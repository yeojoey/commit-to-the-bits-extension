const TwitchBot = require('twitch-bot')
const request = require('request');
const fs = require('fs')
var os = require('os')
const GoogleSheetHandler = require('./googleSheetHandler.js');
const VoteHandler = require('./voteHandler.js');

require('dotenv').config();

const GoogSheet = new GoogleSheetHandler();
var Voter;

const ABot = class AcademicBot
{

  constructor(channel = process.env.CHANNEL_TO_SCRAPE)
  {
    // Captain is the chosen one of the audience.
    this.captain = "";

    //Hotkey Explanations
    this.hotkeys = ["!v - Initiates voting. This will grab a random suggestion from each of C, R, O, and W (if one exists) and post them in chat. It accepts votes for 15 seconds, or until it is manually stopped, and then posts the results.",
                  "!# - Manually selects a winner. This hotkey will only work while voting is in progress. It allows the user to select the suggestion they wish to win, denoted by its number. Voting ends immediately.",
                  "!h - Prints hotkey information."]

    this.Bot = new TwitchBot({
      username: process.env.TWITCHBOT_USERNAME,
      oauth: process.env.TWITCHBOT_OAUTH,
      channels: [channel]
    })

    this.startup()
  }

  //CHATBOT INITIALIZATION AND UPKEEP
  startup()
  {
    this.Bot.on('join', channel => {
      console.log(`Joined channel: ${channel}`)
    })

    this.Bot.on('error', err => {
      console.log(err)
    })

    this.Bot.on('message', chatter => {
      if(chatter.message.charAt(0) === '!') {
        //TODO: SANITIZE INPUT
        switch(chatter.message.charAt(1))
        {
          case 'c':
            Voter.addCharacter(chatter.message.slice(3, chatter.message.length))
            break
          case 'r':
            Voter.addRelationship(chatter.message.slice(3, chatter.message.length))
            break
          case 'o':
            Voter.addObjective(chatter.message.slice(3, chatter.message.length))
            break
          case 'w':
            Voter.addWhere(chatter.message.slice(3, chatter.message.length))
            break
          case 'v':
            Voter.voteFor(chatter.message.charAt(3), chatter.username)
            break
        }
      }

    setInterval(this.printLegalDoc, 300000)

      this.writeToLog(chatter)
    })

    //HOTKEYS

    var stdin = process.openStdin();
    stdin.on('data', chunk =>
    {
      var chunkster = (""+chunk).split(os.EOL)[0]
      if(chunkster.charAt(0) == "!")
      {
        switch(chunkster.charAt(1))
        {
          case "v":
            if(!this.voting)
            {
              Voter.vote();
            }
            break
          case "1":
            if(this.voting)
            {
              Voter.displayWinner(0);
            }
            break
          case "2":
            if(this.voting)
            {
              Voter.displayWinner(1);
            }
            break
          case "3":
            if(this.voting)
            {
              Voter.displayWinner(2);
            }
            break
          case "4":
            if(this.voting)
            {
              Voter.displayWinner(3);
            }
            break
          case "r":
            Voter.getRandomSuggestion();
            break
          case "h":
            this.getHelp()
            break
        }
      }
    })
  }

  setVoter(v)
  {
    Voter = v;
  }

  // Retrieves a user to act as Captain
  setCaptain(cap)
  {
    this.captain = cap;
  }
  //TIMER FOR PRINTING DISCLAIMER and/or CONSENT FORM

  printLegalDoc()
  {
    //this.Bot.say("A legal consent form or disclaimer would go here. ;)")
  }

  //LOGGING

  writeToLog(chatter)
  {
    GoogSheet.writeToChatLog(chatter);
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

}

module.exports = ABot;
