/**
 *    Copyright 2018 Amazon.com, Inc. or its affiliates
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

require('dotenv').config();

const fs = require('fs');
const Hapi = require('hapi');
const path = require('path');
const Boom = require('boom');
const color = require('color');
const ext = require('commander');
const jsonwebtoken = require('jsonwebtoken');
const request = require('request');
const rp = require('request-promise');


const Inert = require('inert');

const AcademicBot = require('./academicbot.js');
const GoogleSheetHandler = require('./googleSheetHandler.js');
const VoteHandler = require('./voteHandler');
const Music = require('./music.js');
const Guess = require('./guess.js');
const formidable = require('formidable');

// The developer rig uses self-signed certificates.  Node doesn't accept them
// by default.  Do not use this in production.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Use verbose logging during development.  Set this to false for production.
const verboseLogging = true;
const verboseLog = verboseLogging ? console.log.bind(console) : () => { };

// Service state variables
const initialColor = color('#6441A4');      // super important; bleedPurple, etc.
const serverTokenDurationSec = 30;          // our tokens for pubsub expire after 30 seconds
const userCooldownMs = 1000;                // maximum input rate per user to prevent bot abuse
const userCooldownClearIntervalMs = 60000;  // interval to reset our tracking object
const channelCooldownMs = 1000;             // maximum broadcast rate per channel
const bearerPrefix = 'Bearer ';             // HTTP authorization headers have this prefix
const colorWheelRotation = 30;
const channelColors = {};
const channelCooldowns = {};                // rate limit compliance
let userCooldowns = {};                     // spam prevention

const queue = [];                           // Used for queueing users for Courtroom Game
var guessingGameChannelID = "";
var djBucket = [];                        // Used for collecting users who want to be DJ
var dj = "";

const STRINGS = {
  secretEnv: usingValue('secret'),
  clientIdEnv: usingValue('client-id'),
  ownerIdEnv: usingValue('owner-id'),
  serverStarted: 'Server running at %s',
  secretMissing: missingValue('secret', 'EXT_SECRET'),
  clientIdMissing: missingValue('client ID', 'EXT_CLIENT_ID'),
  ownerIdMissing: missingValue('owner ID', 'EXT_OWNER_ID'),
  messageSendError: 'Error sending message to channel %s: %s',
  pubsubResponse: 'Message to c:%s returned %s',
  cyclingColor: 'Cycling color for c:%s on behalf of u:%s',
  colorBroadcast: 'Broadcasting color %s for c:%s',
  sendColor: 'Sending color %s to c:%s',
  cooldown: 'Please wait before clicking again',
  invalidAuthHeader: 'Invalid authorization header',
  invalidJwt: 'Invalid JWT',
  sendText: "Sending \"%s\" to c:%s",
  changeText: "Changing text to %s on c:%s behalf of u:%s"
};

ext.
  version(require('../package.json').version).
  option('-s, --secret <secret>', 'Extension secret').
  option('-c, --client-id <client_id>', 'Extension client ID').
  option('-o, --owner-id <owner_id>', 'Extension owner ID').
  parse(process.argv);

const ownerId = getOption('ownerId', 'ENV_OWNER_ID');
const secret = Buffer.from(getOption('secret', 'ENV_SECRET'), 'base64');
const clientId = getOption('clientId', 'ENV_CLIENT_ID');

const serverOptions = {
  host: process.env.HOST || 'localhost',
  port: (process.env.PORT || 8081),
  routes: {
    cors: {
      origin: ['*'],
    },
  },
};
const serverPathRoot = path.resolve(__dirname, '..', 'conf', 'server');
if (fs.existsSync(serverPathRoot + '.crt') && fs.existsSync(serverPathRoot + '.key')) {
  serverOptions.tls = {
    // If you need a certificate, execute "npm run cert".
    cert: fs.readFileSync(serverPathRoot + '.crt'),
    key: fs.readFileSync(serverPathRoot + '.key'),
  };
}

//Create a bot to listen and interact with chat.
const AcaBot = new AcademicBot()
//Create a GoogleSheetHandler to read/write from various google sheets. For chatlogging and verifying whitelisted users.
const GoogSheet = new GoogleSheetHandler();
//Create a Voter to handle voting
const Voter = new VoteHandler();
AcaBot.setVoter(Voter);
//Music object to handle DJ Game
const Muse = new Music();
//Guess object to handle guessing game
const Gus = new Guess();
AcaBot.setGuesser(Gus);

//Map of User ID's to User States
const userStates = [];

const server = new Hapi.Server(serverOptions);
const io = require('socket.io')(server.listener);

// Game State
var currentGame = "GuessingGame";

(async () => {

  await server.register(Inert);

  //********************
  //***GENERAL ROUTES***
  //********************

  // Serve app
  server.route({
    method: "GET",
    path: "/{path*}",
    handler: {
      directory: {
        path: "./build",
        listing: false,
        index: true
      }
    }
  });

  //Changes current game state.
  server.route ({
    method: 'POST',
    path: "/api/changeGame",
    handler: changeGameHandler
  })

  //Specific game state changing functions per game.

  server.route ({
    method: "POST",
    path: "/api/changeToTSA",
    handler: changeToTSAHandler
  })

  server.route ({
    method: "POST",
    path: "/api/changeToFreezeTag",
    handler: changeToFreezeTagHandler
  })

  server.route ({
    method: "POST",
    path: "/api/changeToCourtroom",
    handler: changeToCourtroomHandler
  })

  server.route ({
    method: "POST",
    path: "/api/changeToMusic",
    handler: changeToMusicHandler
  })

  //***********************
  //***FREEZE TAG ROUTES***
  //***********************

  // Config: clear database
  server.route ({
    method: 'POST',
    path: "/api/clear",
    handler: botClearHandler
  });

  // Config: start Voting
  server.route ({
    method: 'POST',
    path: "/api/startVote",
    handler: botStartVoteHandler
  });

  // Config: end voting
  server.route ({
    method: 'POST',
    path: "/api/endVote",
    handler: botEndVoteHandler
  });

  //Allows a user to vote for a specific suggestion.
  server.route ({
    method: 'POST',
    path: '/api/vote',
    handler: botVoteHandler
  });

  //Submits a suggestion.
  server.route ({
    method: "POST",
    path: "/api/submitSuggestion",
    handler: submitSuggestionHandler
  })

  //Gets the winner of a vote.
  server.route ({
    method: "GET",
    path: "/api/getFreezeTagPrompt",
    handler: getFreezeTagPromptHandler
  })

  //Gets the state of the voting game.
  server.route ({
    method: "GET",
    path: "/api/getBotState",
    handler: botStateQueryHandler
  })

  //******************************
  //***MUSIC TO MY PEERS ROUTES***
  //******************************

  server.route ({
    method: "POST",
    path: "/api/enqueueAudienceMember",
    handler: enqueueAudienceMemberHandler
  })

  //Puts a viewer into the DJBucket
  server.route ({
    method: "POST",
    path: "/api/getInDJBucket",
    handler: getInDJBucketHandler
  })

  //Empties the DJ Bucket
  server.route ({
    method: "POST",
    path: "/api/clearDJBucket",
    handler: clearDJBucketHandler
  })

  //Picks a song for the queue.
  server.route ({
    method: "POST",
    path: "/api/chooseMusic",
    handler: chooseMusicHandler
  })

  server.route ({
    method: "GET",
    path: "/api/dequeueAudienceMember",
    handler: dequeueAudienceMemberHandler
  })

  server.route ({
    method: "GET",
    path: "/api/getQueuePosition",
    handler: getQueuePositionHandler
  })

  server.route ({
    method: "GET",
    path: "/api/getQueue",
    handler: getQueueHandler
  })

  server.route ({
    method: "GET",
    path: "/api/getHeadOfQueue",
    handler: getHeadOfQueueHandler
  })

  //DJ Handling - GET
  server.route ({
    method: "GET",
    path: "/api/getMusicOptions",
    handler: getMusicOptionsHandler
  })

  server.route ({
    method: "GET",
    path: "/api/getDJ",
    handler: getDJHandler
  })

  //**************************
  //***GUESSGING GAME ROUTE***
  //**************************

  //Submits a word for the pool
  server.route ({
    method: "POST",
    path: "/api/submitWord",
    handler: submitWordHandler
  })

  //Begins guessing phase.
  server.route ({
    method: "POST",
    path: "/api/beginGuessing",
    handler: beginGuessingHandler
  })

  //Allows word submission
  server.route ({
    method: "POST",
    path: "/api/beginWordSubmission",
    handler: beginWordSubmissionHandler
  })

  //Gets a random word, given the word type.
  server.route ({
    method: "GET",
    path: "/api/getWord",
    handler: getWordHandler
  })

  // Start the server.
  await server.start();


  console.log(STRINGS.serverStarted, server.info.uri);

  // Periodically clear cool-down tracking to prevent unbounded growth due to
  // per-session logged-out user tokens.
  setInterval(() => { userCooldowns = {}; }, userCooldownClearIntervalMs);

})();

function usingValue(name) {
  return `Using environment variable for ${name}`;
}

function missingValue(name, variable) {
  const option = name.charAt(0);
  return `Extension ${name} required.\nUse argument "-${option} <${name}>" or environment variable "${variable}".`;
}

// Get options from the command line or the environment.
function getOption(optionName, environmentName) {
  const option = (() => {
    if (ext[optionName]) {
      return ext[optionName];
    } else if (process.env[environmentName]) {
      console.log(STRINGS[optionName + 'Env']);
      return process.env[environmentName];
    }
    console.log(STRINGS[optionName + 'Missing']);
    process.exit(1);
  })();
  console.log(`Using "${option}" for ${optionName}`);
  return option;
}

// Verify the header and the enclosed JWT.
function verifyAndDecode(header) {
  try {
    const token = header; //header.substring(bearerPrefix.length);
    return jsonwebtoken.verify(token, secret, { algorithms: ['HS256'] });
    }
  catch (ex) {
    throw Boom.unauthorized(STRINGS.invalidJwt);
  }
}

//Gets the state of the voting game
function botStateQueryHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  //locationnnelID(channelId);

  verifyUserExists(opaqueUserId);

  const state = getState(opaqueUserId);
  return state;
}

//Gets the winning word from the vote.
function getFreezeTagPromptHandler(req) {
  return { freezeTagPrompt: Voter.getState().finalWord }
}

//UserState Handling

//Stores a user's information in an internal array
function verifyUserExists(opaqueUserId)
{
  if(!(userStates.hasOwnProperty(opaqueUserId)))
  {
    userStates[opaqueUserId] = {
      votedBefore: false,
      inQueue: false,
      discordTag: "",
      queuePosition: -1,
      isDJ: false,
      inDJBucket: false,
      displayName: "",
    }
    console.log(userStates);
  }
}

//Clears a user's voting state, allowing them to vote again.
function clearUserVotes()
{
  for(var key in userStates)
  {
    userStates[key].votedBefore = false;
  }
}

//Broad state retrieval function. Does a LOT.
function getState(userId) {
  const botState = Voter.getState();
  const musicState = Muse.getState();
  const guessState = Gus.getState();
  let actualGuessPhase = AcaBot.getGuessing();
  guessState.phase = actualGuessPhase;

  pos = getQueuePosition(userId);

  const toReturn = {
    isVoting: botState.isVoting,
    votes: botState.votes,
    options: botState.options,
    finalWord: botState.finalWord,
    votedBefore: userStates[userId].votedBefore,
    inQueue: userStates[userId].inQueue,

    currentGame: currentGame,

    inDJBucket: userStates[userId].inDJBucket,
    isDJ: userStates[userId].isDJ,
    dj: musicState.dj,
    musicQueue: musicState.musicQueue,
    musicOptions: musicState.musicOptions,
    canSelectSong: musicState.canSelectSong,

    discordTag: userStates[userId].discordTag,
    queuePosition: pos,
    headOfQueue: queue[0],

    guessingGame: {
      phase: guessState.phase,
      words: guessState.words,
      answers: guessState.answers
    }
  };
  return toReturn;
}

//Clears the voting data.
function botClearHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  // Clear bot info.
  Voter.clear();

  const state = Voter.getState();
  return {
    options: state.options,
    isVoting: state.isVoting
  };
}

//Starts a vote.
function botStartVoteHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  // Start the vote with the bot.
  Voter.vote();
  clearUserVotes();

  const state = Voter.getState();

  attemptStateBroadcast(channelId);
  return {
    options: state.options,
    isVoting: state.isVoting
  };
}

//Ends a vote.
function botEndVoteHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  // Display the winner of the vote.
  Voter.displayWinner();

  const botState = Voter.getState();
  attemptStateBroadcast(channelId);
  return {
    isVoting: botState.isVoting,
    votes: botState.votes,
    options: botState.options,
    finalWord: botState.finalWord,
  };
}

//Votes for a suggestion.
function botVoteHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  // Get the vote
  const vote = req;
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  // Send the vote
  Voter.voteFor(req.headers.vote, opaqueUserId);

  //Update User State
  //verifyUserExists(opaqueUserId);
  userStates[opaqueUserId].votedBefore = true;
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

//Changes the current game.
function changeGameHandler (req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  const botState = Voter.getState();
  currentGame = req.headers.game;
  if(currentGame == "GuessingGame")
  {
    Gus.clearGuessers();
    Gus.clearAnswers();
    Gus.setPublic();
  }
  else
    AcaBot.setGuessing(false);

  attemptStateBroadcast(channelId);
  return {
    isVoting: botState.isVoting,
    votes: botState.votes,
    options: botState.options,
    finalWord: botState.finalWord,
    currentGame: currentGame
  }
}

//Specific game state changing functions per game.

function changeToTSAHandler(req) {
    // Verify all requests.
    const payload = verifyAndDecode(req.headers.authorization);
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

    const botState = Voter.getState();
    currentGame = "TSA";

    attemptStateBroadcast(channelId);

    return {
      isVoting: botState.isVoting,
      votes: botState.votes,
      options: botState.options,
      finalWord: botState.finalWord,
      currentGame: currentGame
    }
}

function changeToFreezeTagHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  const botState = Voter.getState();
  currentGame = "FreezeTag";
  attemptStateBroadcast(channelId);

  return {
    isVoting: botState.isVoting,
    votes: botState.votes,
    options: botState.options,
    finalWord: botState.finalWord,
    currentGame: currentGame
  }
}

function changeToCourtroomHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  const botState = Voter.getState();
  currentGame = "Courtroom";
  attemptStateBroadcast(channelId);

  return {
    isVoting: botState.isVoting,
    votes: botState.votes,
    options: botState.options,
    finalWord: botState.finalWord,
    currentGame: currentGame
  }
}

function changeToMusicHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  const botState = Voter.getState();
  currentGame = "Music";
  attemptStateBroadcast(channelId);

  return {
    isVoting: botState.isVoting,
    votes: botState.votes,
    options: botState.options,
    finalWord: botState.finalWord,
    currentGame: currentGame
  }
}

/*******************
*   QUEUE RELATED  *
********************/

function getHeadOfQueueHandler (req) {
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  if (queue[0]) {
    console.log(queue[0].discordTag + "is at head of queue");
    return {
      guestStar: queue[0].discordTag
    }
  } else {
    return {
      guestStar: "None"
    }
  }
}

function getQueueHandler (req) {
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  return ({
    queue: queue
  })
}

function enqueueAudienceMemberHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  //Get mystical input via frontend consisting of Discord tag#12345 called discordTag
  //Assumes discordTag is given under req.headers
  var discordTag = req.headers.discordtag;
  //Create object containing user ID and user Discord tag
  var queueObj = {
    uID: opaqueUserId,
    discordTag: discordTag
  }

  console.log(queueObj.discordTag + " has reached the server");

  //Verify user is not already in the queue
  var newEntrant = !checkIfInQueue(opaqueUserId)

  //Put user if queue if they are not already in the queue
  if(newEntrant)
  {
    queue[queue.length] = queueObj;
    console.log("Attempt user creation");
    //verifyUserExists(opaqueUserId);
    console.log("Done adding new member.");
    userStates[opaqueUserId].inQueue = true;
    userStates[opaqueUserId].discordTag = queueObj.discordTag
    userStates[opaqueUserId].queuePosition = getQueuePosition(opaqueUserId);

    console.log(userStates[opaqueUserId]);
    console.log(queue);
  }

  updateQueuePositions();

  return {
    queue: queue,
    queuePosition: userStates[opaqueUserId].queuePosition,
    inQueue: true,
  }

}

function checkIfInQueue (userId) {
  for(var i = 0; i < queue.length; i++) {
    if(queue[i].uID == userId) {
      return true;
    }
  }
  return false;
}

function getQueuePosition (userId)
{
  var index = -1;
  for(var i = 0; i < queue.length; i++)
  {
    if(queue[i].uID == userId)
    {
      index = i;
      break;
    }
  }
  return index;
}

function dequeueAudienceMemberHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId } = payload;

  //Pop, or 'shift', the earliest element from the array.
  var user = queue.shift();
  var name = user.uID;
  var tag = user.discordTag;

  userStates[name].inQueue = false;

  updateQueuePositions();

  attemptStateBroadcast(channelId);
  return {
    queue: queue,
    guestStar: tag
  }
}

function getQueuePositionHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  //Gets user ID for position. Assums uID is in req.headers
  const uID = opaqueUserId;

  //If -1 is returned that means that the queried user is not in the queue
  var pos = getQueuePosition(uID);

  return {
    pos: pos
  }
}

function updateQueuePositions(req)
{
  for(user in userStates)
  {
    userStates[user].queuePosition = getQueuePosition(user);
  }
}

//***************
//QUEUE STUFF End
//***************

//***************
//DJ Handling
//***************

function getInDJBucketHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  //verifyUserExists(opaqueUserId);
  Muse.getInDJBucket(payload.user_id, opaqueUserId);
  console.log("GOT IN DJBUCKET");
  console.log(payload);

  userStates[opaqueUserId].inDJBucket = true;
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

function clearDJBucketHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  Muse.clearDJBucket();

  for(var key in userStates)
  {
    userStates[key].inDJBucket = false;
    userStates[key].isDJ = false;
  }
  attemptStateBroadcast(channelId);
}

async function getDJHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  if(Muse.getDJBucket().length > 0)
  {
    //Get DJ and Set options accordingly
    djObj = await Muse.getDJ();
    console.log("In outer ASYNC : "+djObj);
    dj = djObj.dj;
    uID = djObj.id;
    Muse.getOptions();

    //Make sure this userID exists. (This should never be a problem, but hey who knows)
    //Make everyone else not a DJ.
    dropOtherDJ();

    //Update the DJ's userstate
    console.log(djObj);
    userStates[uID].isDJ = true;
    userStates[uID].inDJBucket = false;
    userStates[uID].displayName = dj;
  }

  //Broadcast to everyone
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

function getMusicOptionsHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  const opt = Muse.getOptions();
  return {
    musicOptions: opt
  }
}

function chooseMusicHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  Muse.addToQueue(req.headers.music);
  Muse.getOptions();
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

function dropOtherDJ()
{
  for(var key in userStates)
  {
    userStates[key].isDJ = false;
  }
}

//**********
// DJ HANDLING END
//***********

function submitSuggestionHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  const suggestion = req.headers.suggestion;
  const category = req.headers.category;
  console.log("Received suggestion " + suggestion + " for " + category);
  Voter.submitSuggestion(category, suggestion);

  return getStategit(opaqueUserId);
}

//**********************************
//***GUESSING GAME HANDLING START***
//**********************************

function submitWordHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  const word = req.headers.word;
  const uid = payload.user_id;
  const type = req.headers.type;
  console.log("Word submission received. Word: "+word+" Type: "+type);
  Gus.addWord(word, uid, type);

  //Broadcast to everyone
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

function beginGuessingHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  AcaBot.setGuessing(true);
  Gus.clearGuessers();
  Gus.clearAnswers();
  Gus.setPublic();

  //Broadcast to everyone
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

function beginWordSubmissionHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  AcaBot.setGuessing(false);
  Gus.clearGuessers();
  Gus.clearAnswers();

  //Broadcast to everyone
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

function getWordHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  guessingGameChannelID = channelId;

  const type = req.headers.type;
  console.log("Received 'Get Word' request. Type: "+type);
  Gus.getWord(type);

  //Broadcast to everyone
  attemptStateBroadcast(channelId);
  return getState(opaqueUserId);
}

//**********************************
//***GUESSING GAME HANDLING END***
//**********************************

function attemptStateBroadcast(channelId) {
  // Check the cool-down to determine if it's okay to send now.
  const now = Date.now();
  const cooldown = channelCooldowns[channelId];
  if (!cooldown || cooldown.time < now) {
    // It is.
    sendStateBroadcast(channelId);
    channelCooldowns[channelId] = { time: now + channelCooldownMs };
  } else if (!cooldown.trigger) {
    // It isn't; schedule a delayed broadcast if we haven't already done so.
    cooldown.trigger = setTimeout(sendStateBroadcast, now - cooldown.time, channelId);
  }
}

function sendStateBroadcast(channelId) {
  // Set the HTTP headers required by the Twitch API.
  const headers = {
    'Client-ID': clientId,
    'Content-Type': 'application/json',
    'Authorization': bearerPrefix + makeServerToken(channelId),
  };

  const state = Voter.getState();
  const museState = Muse.getState();
  const guessState = Gus.getState();
  let actualGuessPhase = AcaBot.getGuessing();
  console.log("Broadcasting Guess Answers: "+guessState.answers[0]);
  guessState.phase = actualGuessPhase;
  const obj = JSON.stringify({ guessingGame: {phase: guessState.phase, words: guessState.words, answers: guessState.answers}, isVoting: state.isVoting, votes: state.votes, options: state.options, finalWord: state.finalWord, currentGame: currentGame, musicQueue: museState.musicQueue, musicOptions: museState.musicOptions, dj: museState.dj, canSelectSong: museState.canSelectSong }) ;

  const body = JSON.stringify({
    content_type: 'application/json',
    message: obj,
    targets: ['broadcast'],
  });

  request(
    `https://api.twitch.tv/extensions/message/${channelId}`,
    {
      method: 'POST',
      headers,
      body,
    }
    , (err, res) => {
      if (err) {
        console.log(STRINGS.messageSendError, channelId, err);
      } else {
        verboseLog(STRINGS.pubsubResponse, channelId, res.statusCode);
      }
    });

}

// Create and return a JWT for use by this service.
function makeServerToken(channelId) {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + serverTokenDurationSec,
    channel_id: channelId,
    user_id: ownerId, // extension owner ID for the call to Twitch PubSub
    role: 'external',
    pubsub_perms: {
      send: ['*'],
    },
  };
  return jsonwebtoken.sign(payload, secret, { algorithm: 'HS256' });
}

function userIsInCooldown(opaqueUserId) {
  // Check if the user is in cool-down.
  const cooldown = userCooldowns[opaqueUserId];
  const now = Date.now();
  if (cooldown && cooldown > now) {
    return true;
  }

  // Voting extensions must also track per-user votes to prevent skew.
  userCooldowns[opaqueUserId] = now + userCooldownMs;
  return false;
}

function getCHID()
{
  return guessingGameChannelID;
}
module.exports.attemptStateBroadcast = attemptStateBroadcast;
module.exports.getCHID = getCHID;
