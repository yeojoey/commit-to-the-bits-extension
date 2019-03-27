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

const AcademicBot = require('./academicbot.js');
const GoogleSheetHandler = require('./googleSheetHandler.js');

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

const queue = [];

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

const server = new Hapi.Server(serverOptions);

// Game State
var currentGame = "FreezeTag";

(async () => {

  await server.register(require('inert'));

  // Serve static files
    server.route({
      method: "GET",
      path: "/{path*}",
      handler: {
        directory: {
          path: "./build",
          listing: true,
          index: true,
          redirectToSlash: true
        }
      }
    });

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

  server.route ({
    method: 'POST',
    path: '/api/vote',
    handler: botVoteHandler
  });

  server.route ({
    method: "GET",
    path: "/api/getBotState",
    handler: botStateQueryHandler
  })

  server.route ({
    method: "GET",
    path: "/api/getCaptain",
    handler: captainQueryHandler
  })

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
    path: "/api/enqueueAudienceMember",
    handler: enqueueAudienceMemberHandler
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
  // if (header.startsWith(bearerPrefix)) {
  try {
    const token = header; //header.substring(bearerPrefix.length);
    return jsonwebtoken.verify(token, secret, { algorithms: ['HS256'] });
    }
  catch (ex) {
    throw Boom.unauthorized(STRINGS.invalidJwt);
  }
  //throw Boom.unauthorized(STRINGS.invalidAuthHeader);
}

function botStateQueryHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  return getState(opaqueUserId);
}

function getState(userId) {
  const botState = AcaBot.getState();
  userInQueue = checkIfInQueue(opaqueUserId);
  pos = getQueuePosition(opaqueUserId);
  return {
    botState: {
      isVoting: state.voting,
      votes: state.votes,
      options: state.options,
      votedAlready: state.votedAlready,
      finalWord: state.finalWord
    },
    captain: state.captain,
    currentGame: currentGame,
    inQueue: userInQueue,
    queuePosition: pos,
    headOfQueue: queue[0].discordTag
  };

}

function botClearHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  // Clear bot info.
  AcaBot.clear();

  const state = AcaBot.getState();
  return {
    botState: {
      options: state.options,
      isVoting: state.isVoting
    }
  };
}

function botStartVoteHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  // Start the vote with the bot.
  AcaBot.vote();

  const state = AcaBot.getState();

  attemptStateBroadcast(channelId);
  return {
    botState: {
      options: state.options,
      isVoting: state.isVoting
    }
  };
}

function botEndVoteHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  // Display the winner of the vote.
  AcaBot.displayWinner();

  const state = AcaBot.getState();
  attemptStateBroadcast(channelId);
  return {
    botState: state
  };
}

function botVoteHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  // Get the vote
  const vote = req;
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  // Send the vote
  AcaBot.voteFor(req.headers.vote, opaqueUserId);

  const state = AcaBot.getState();
  return {
    botState: {
      options: state.options,
      isVoting: state.isVoting
    }
  };
}

function captainQueryHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  var cap = "undefined";
  var url = "https://tmi.twitch.tv/group/user/" + "charlieparke" + "/chatters"
  var semaphore = 0;
  var toReturn = "";
  // request(
  // {
  //   url: url,
  //   json: true
  // }, function(error, response, body)
  // {
  //   semaphore = 1;
  //   if(!error && response.statusCode === 200)
  //   {
  //     const chatters = body.chatters.viewers;
  //     var rando = Math.floor(Math.random() * Math.floor(chatters.length));
  //     cap = chatters[rando];
  //     toReturn = {
  //       captain: cap
  //     };
  //
  //     AcaBot.setCaptain(cap);
  //   }
  //   else {
  //     toReturn = {
  //       captain: ""
  //     };
  //   }
  //   semaphore = 0;
  // })
  rp(url)
    .then(function(body)
    {
      // const chatters = body.chatters.viewers;
      // var rando = Math.floor(Math.random() * Math.floor(chatters.length));
      // cap = chatters[rando];
      // toReturn = {
      //   captain: cap
      // };
      // AcaBot.setCaptain(cap);
      console.log(body)
    })
    .catch(function(err)
    {
      console.log(err)
    })
  return toReturn;
}

function changeToTSAHandler(req) {
    // Verify all requests.
    const payload = verifyAndDecode(req.headers.authorization);
    const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

    const state = AcaBot.getState();
    this.currentGame = "TSA";

    attemptStateBroadcast(channelId);

    return {
      botState: state,
      currentGame: "TSA"
    }
}

function changeToFreezeTagHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  const state = AcaBot.getState();
  this.currentGame = "FreezeTag";
  attemptStateBroadcast(channelId);

  return {
    botState: state,
    currentGame: "FreezeTag"
  }
}

function changeToCourtroomHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
  const state = AcaBot.getState();
  this.currentGame = "Courtroom";
  attemptStateBroadcast(channelId);

  return {
    botState: state,
    currentGame: "Courtroom"
  }
}

function enqueueAudienceMemberHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  //Get mystical input via frontend consisting of Discord tag#12345 called discordTag
  //Assumes discordTag is given under req.headers
  var discordTag = req.headers.discordTag;

  //Create object containing user ID and user Discord tag
  var queueObj = {
    uID: opaqueUserId,
    discordTag: discordTag
  }

  //Verify user is not already in the queue
  var newEntrant = !checkIfInQueue(opaqueUserId)

  //Put user if queue if they are not already in the queue
  if(newEntrant)
  {
    queue[queue.length] = queueObj;
    console.log(queue);

    //Return queue and user's queue position
    return {
      queue: queue,
      pos: queue.length,
      inQueue: true
    }

  // user already in queue
  } else {
    return {
      queue: queue,
      pos: queue.length
    }
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

function getQueuePosition (userId) {
  for(var i = 0; i < queue.length; i++)
  {
    if(queue[i].uID == userId)
    {
      return i;
    } else {
      return -1;
    }
  }
}

function dequeueAudienceMemberHandler(req) {
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId } = payload;
  //Pop, or 'shift', the earliest element from the array.
  var userToReturn = queue.shift().discordTag;
  console.log(userToReturn);
  attemptStateBroadcast(channelId);
  return {
    queue: queue,
    guestStar: userToReturn
  }
}

function getQueuePositionHandler(req)
{
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  //Gets user ID for position. Assums uID is in req.headers
  const uID = req.headers.userID;

  //If -1 is returned that means that the queried user is not in the queue
  var pos = getQueuePosition(uID);

  return {
    pos: pos
  }
}

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

  const state = AcaBot.getState();
  const obj = JSON.stringify({ botState: state, currentGame: currentGame }) ;

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
