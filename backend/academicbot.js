const TwitchBot = require('twitch-bot')
const request = require('request');
const fs = require('fs')
var os = require('os')
const GoogleSheetHandler = require('./googleSheetHandler.js');
const VoteHandler = require('./vote.js');

require('dotenv').config();

var defaultCharacter = ["Narcissist", "Baker", "Baby", "Eskimo that is too Cold"]
var defaultRelationship = ["Reluctant Boyfriend", "Grandma", "Long-time Butler", "Frenemies"]
var defaultObjective = ["To Get Away", "To Become Taller", "Pass the Exam", "Earn Your License"]
var defaultWhere = ["Pawn Shop", "Under a Desk", "Nightclub", "Deep Cave"]

const GoogSheet = new GoogleSheetHandler();
const Voter = new VoteHandler();

const ABot = class AcademicBot
{

  constructor(channel = process.env.CHANNEL_TO_SCRAPE)
  {
    // // Suggestion Lists
    // this.character  = []
    // this.relationship = []
    // this.objective = []
    // this.where = []
    //
    // // Used Suggestion Lists
    // this.usedCharacter  = []
    // this.usedRelationship = []
    // this.usedObjective = []
    // this.usedWhere = []
    //
    // // Used Default Suggestion Lists
    // this.usedDefaultCharacter  = []
    // this.usedDefaultRelationship = []
    // this.usedDefaultObjective = []
    // this.usedDefaultWhere = []
    //
    // //Voting variables
    // this.voting = false
    // this.votes = []
    // this.options = []
    // this.votedAlready = []
    //
    // this.finalWord = ""

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
            this.addCharacter(chatter.message.slice(3, chatter.message.length))
            break
          case 'r':
            this.addRelationship(chatter.message.slice(3, chatter.message.length))
            break
          case 'o':
            this.addObjective(chatter.message.slice(3, chatter.message.length))
            break
          case 'w':
            this.addWhere(chatter.message.slice(3, chatter.message.length))
            break
          case 'v':
            this.voteFor(chatter.message.charAt(3), chatter.username)
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
              //this.vote()
              Voter.vote();
            }
            break
          case "1":
            if(this.voting)
            {
              //this.displayWinner(0)
              Voter.displayWinner(0);
            }
            break
          case "2":
            if(this.voting)
            {
              //this.displayWinner(1)
              Voter.displayWinner(1);
            }
            break
          case "3":
            if(this.voting)
            {
              //this.displayWinner(2)
              Voter.displayWinner(2);
            }
            break
          case "4":
            if(this.voting)
            {
              //this.displayWinner(3)
              Voter.displayWinner(3);
            }
            break
          case "r":
            //this.getRandomSuggestion()
            Voter.getRandomSuggestion();
            break
          case "h":
            this.getHelp()
            break
        }
      }
    })
  }

  // Clear internal information
  clear()
  {
    // //Suggestion Lists
    // this.character  = []
    // this.relationship = []
    // this.objective = []
    // this.where = []
    //
    // //Voting variables
    // this.votes = []
    // this.options = []
    // this.votedAlready = []
    //
    // this.captain = ""
    Voter.clear();
  }

  // Returns the bot state to the Server and Frontend
  getState()
  {
    // return {
    //   character: this.character,
    //   relationship: this.relationship,
    //   objective: this.objective,
    //   where: this.where,
    //   isVoting: this.voting,
    //   votes: this.votes,
    //   options: this.options,
    //   votedAlready: this.votedAlready,
    //   finalWord: this.finalWord,
    //   captain: this.captain
    // };
    return Voter.getState();
  }

  // Retrieves a user to act as Captain
  setCaptain(cap)
  {
    this.captain = cap;
  }

  //SUGGESTION ADDITION

  addCharacter(cha)
  {
    // this.Bot.say('A character has been suggested.')
    // this.character.push(cha)
    // console.log(this.character)
    Voter.addCharacter(cha);
  }

  addRelationship(rel)
  {
    // this.Bot.say('A relationship has been suggested.')
    // this.relationship.push(rel)
    // console.log(this.relationship)
    Voter.addRelationship(rel);
  }

  addObjective(obj)
  {
    // this.Bot.say('An objective has been suggested.')
    // this.objective.push(obj)
    // console.log(this.objective)
    Voter.addObjective(obj);
  }

  addWhere(wh)
  {
    // this.Bot.say('A where has been suggested.')
    // this.where.push(wh)
    // console.log(this.where)
    Voter.addWhere(wh);
  }

  //SUGGESTION FETCH

  getCharacter(num = 1)
  {
    // var chosen = []
    // for(var i = 0; i < num; i++)
    // {
    //   if(this.character.length > 0)
    //     var candidates = this.character.slice()
    //   else if (defaultCharacter.length > 0)
    //     var candidates = defaultCharacter.slice()
    //   else
    //   {
    //     this.character = this.usedCharacter.slice()
    //     defaultCharacter = this.usedDefaultCharacter.slice()
    //
    //     this.usedCharacter = []
    //     this.usedDefaultCharacter = []
    //
    //     if(this.character.length > 0)
    //       var candidates = this.character.slice()
    //     else if (defaultCharacter.length > 0)
    //       var candidates = defaultCharacter.slice()
    //   }
    //
    //   var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
    //   chosen.push(candidates[random])
    //   candidates.slice(random, 1)
    //
    //   if(this.character.length > 0)
    //   {
    //     this.usedCharacter.push(this.character[random])
    //     this.character.splice(random, 1);
    //   }
    //   else
    //   {
    //     this.usedDefaultCharacter.push(defaultCharacter[random])
    //     defaultCharacter.splice(random, 1);
    //   }
    // }
    // return chosen

    return Voter.getCharacter(num);
  }

  getRelationship(num = 1)
  {
    // var chosen = []
    // for(var i = 0; i < num; i++)
    // {
    //   if(this.relationship.length > 0)
    //     var candidates = this.relationship.slice()
    //   else if (defaultRelationship.length > 0)
    //     var candidates = defaultRelationship.slice()
    //   else
    //   {
    //     this.relationship = this.usedRelationship.slice()
    //     defaultRelationship = this.usedDefaultRelationship.slice()
    //
    //     this.usedRelationship = []
    //     this.usedDefaultRelationship = []
    //
    //     if(this.relationship.length > 0)
    //       var candidates = this.relationship.slice()
    //     else if (defaultRelationship.length > 0)
    //       var candidates = defaultRelationship.slice()
    //   }
    //
    //   var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
    //   chosen.push(candidates[random])
    //   candidates.slice(random, 1)
    //
    //   if(this.relationship.length > 0)
    //   {
    //     this.usedRelationship.push(this.relationship[random])
    //     this.relationship.splice(random, 1);
    //   }
    //   else
    //   {
    //     this.usedDefaultRelationship.push(defaultRelationship[random])
    //     defaultRelationship.splice(random, 1);
    //   }
    // }
    // return chosen

    return Voter.getRelationship(num);
  }

  getObjective(num = 1)
  {
    // var chosen = []
    // for(var i = 0; i < num; i++)
    // {
    //   if(this.objective.length > 0)
    //     var candidates = this.objective.slice()
    //   else if (defaultObjective.length > 0)
    //     var candidates = defaultObjective.slice()
    //   else
    //   {
    //     this.objective = this.usedObjective.slice()
    //     defaultObjective = this.usedDefaultObjective.slice()
    //
    //     this.usedObjective = []
    //     this.usedDefaultObjective = []
    //
    //     if(this.objective.length > 0)
    //       var candidates = this.objective.slice()
    //     else if (defaultObjective.length > 0)
    //       var candidates = defaultObjective.slice()
    //   }
    //
    //   var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
    //   chosen.push(candidates[random])
    //   candidates.slice(random, 1)
    //
    //   if(this.objective.length > 0)
    //   {
    //     this.usedObjective.push(this.objective[random])
    //     this.objective.splice(random, 1);
    //   }
    //   else
    //   {
    //     this.usedDefaultObjective.push(defaultObjective[random])
    //     defaultObjective.splice(random, 1);
    //   }
    // }
    // return chosen

    return Voter.getObjective(num);
  }

  getWhere(num = 1)
  {
    // var chosen = []
    // for(var i = 0; i < num; i++)
    // {
    //   if(this.where.length > 0)
    //     var candidates = this.where.slice()
    //   else if (defaultWhere.length > 0)
    //     var candidates = defaultWhere.slice()
    //   else
    //   {
    //     this.where = this.usedWhere.slice()
    //     defaultWhere = this.usedDefaultWhere.slice()
    //
    //     this.usedWhere = []
    //     this.usedDefaultWhere = []
    //
    //     if(this.where.length > 0)
    //       var candidates = this.where.slice()
    //     else if (defaultWhere.length > 0)
    //       var candidates = defaultWhere.slice()
    //   }
    //
    //   var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
    //   chosen.push(candidates[random])
    //   candidates.slice(random, 1)
    //
    //   if(this.where.length > 0)
    //   {
    //     this.usedWhere.push(this.where[random])
    //     this.where.splice(random, 1);
    //   }
    //   else
    //   {
    //     this.usedDefaultWhere.push(defaultWhere[random])
    //     defaultWhere.splice(random, 1);
    //   }
    // }
    // return chosen

    return Voter.getWhere(num);
  }

  getRandomSuggestion()
  {
    // var randomSuggestions = getOptions()
    // if(randomSuggestions.length == 0)
    //   return -1
    //
    // var rand = Math.floor(Math.random() * Math.floor(randomSuggestions.length))
    // var randomSuggestion
    // randomSuggestion = randomSuggestions[rand]
    //
    // this.Bot.say("Random Suggestion: " + randomSuggestion)
    Voter.getRandomSuggestion();
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

  //VOTING

  getOptions()
  {
    // var cha
    // var rel
    // var obj
    // var wh
    //
    // var toReturn = []
    //
    // cha = this.getCharacter()
    // rel = this.getRelationship()
    // obj = this.getObjective()
    // wh = this.getWhere()
    //
    // if(cha != 0)
    //   toReturn.push(cha + " (Character)")
    // if(rel != 0)
    //   toReturn.push(rel + " (Relationship)")
    // if(obj != 0)
    //   toReturn.push(obj + " (Objective)")
    // if(wh != 0)
    //   toReturn.push(wh + " (Where)")
    //
    // return toReturn

    return Voter.getOptions();
  }

  voteFor(choice, user)
  {
    // console.log("Vote received. Voting for: "+ choice +", Vote by: " + user)
    // if(this.votedAlready.indexOf(user) > -1)
    // {
    //   return
    // }
    // this.votes[parseInt(choice)]++
    // this.votedAlready.push(user)

    Voter.voteFor(choice, user);
  }

  displayWinner(winner = -1)
  {
    // if(this.voting)
    // {
    //   if(winner == -1)
    //   {
    //     var ties = []
    //     winner = 0
    //     for(var i = 0; i < this.options.length; i++)
    //     {
    //       if(this.votes[i] > this.votes[winner])
    //         winner = i
    //       else if(this.votes[i] == this.votes[winner] && this.votes[winner] != 0)
    //         ties.push(i)
    //         ties.push(winner)
    //     }
    //
    //     if(ties.length > 0 && this.votes[ties[0]] == this.votes[winner])
    //       winner = ties[Math.floor(Math.random() * Math.floor(ties.length))]
    //   }
    //   else if(winner >= this.options.length || winner < 1)
    //   {
    //     console.log("Invalid winner chosen.")
    //     return -1
    //   }
    //   this.finalWord = this.options[winner]
    //   //this.Bot.say("Winner is " + this.finalWord)
    // }
    // this.voting = false

    Voter.displayWinner(winner);
  }

  vote()
  {
    // this.voting = true
    // this.votes = [0, 0, 0, 0]
    // this.votedAlready = []
    //
    // this.options = this.getOptions()

    Voter.vote();
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
