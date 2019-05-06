const TwitchBot = require('twitch-bot')
const request = require('request');
const fs = require('fs')
var os = require('os')

//GoogleSheetHandler needed to read whitelistsed users from our google sheet, which is fed by a google form
const GoogleSheetHandler = require('./googleSheetHandler.js');
//VoteHandler needed for edge cases in which people want to vote via chat, but this design was later deprecated in favor of the Twitch extension
const VoteHandler = require('./voteHandler.js');
//Uses server to update frontend in the case of a correct guess found in guessing game
const server = require('./server.js');

require('dotenv').config();

const GoogSheet = new GoogleSheetHandler();
var Voter;
//Guesser used for Guessing game. Must be in bot's code for the bot to send messages received to guessing code.
var Guesser;
//Uses this channel id as the id for the state broadcast in the case of a correct guess.
var channelID = "";

const ABot = class AcademicBot
{
  //Uses environment variables on our server to initialize the chatbot.
  constructor(channel = process.env.CHANNEL_TO_SCRAPE)
  {
    this.Bot = new TwitchBot({
      username: process.env.TWITCHBOT_USERNAME,
      oauth: process.env.TWITCHBOT_OAUTH,
      channels: [channel]
    })

    //Guessing defaults to false, because the Guessing game doesn't start in guessing mode.
    this.guess = false;

    this.startup()
  }

  //Sets up the bots most vital functions/responses.
  startup()
  {
    //Joins the given channel.
    this.Bot.on('join', channel => {
      console.log(`Joined channel: ${channel}`)
    })

    //Logs any errors received.
    this.Bot.on('error', err => {
      console.log(err)
    })

    //This is where it deals with messages it reads in chat.
    //It logs all messages from whitelisted users into our chatlog via GoogSheet.
    //If guess is true, it'll compare the given message with the answers and update the state if correct.
    this.Bot.on('message', chatter => {
      if(this.guess)
      {
        console.log("Checking message.");
        let foundMatch = Guesser.guess(chatter.message, chatter.username);
        if(foundMatch)
          server.attemptStateBroadcast(server.getCHID());
      }
      this.writeToLog(chatter)
    })
  }

  //Gets and Sets.

  setVoter(v)
  {
    Voter = v;
  }

  setGuesser(g)
  {
    Guesser = g;
  }

  setChannelID(id)
  {
    channelID = id;
  }

  setGuessing(phase)
  {
    this.guess = phase;
  }

  //Print out hotkey information
  getHelp()
  {
    for(var i = 0; i < this.hotkeys.length; i++)
    {
      console.log(this.hotkeys[i])
      console.log()
    }
  }

  getGuessing()
  {
    return this.guess;
  }

  //Logging.

  writeToLog(chatter)
  {
    GoogSheet.writeToChatLog(chatter);
  }

}

module.exports = ABot;
