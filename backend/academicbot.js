const TwitchBot = require('twitch-bot')
const fs = require('fs')
var os = require('os')

require('dotenv').config();

const defaultCharacter = ["Narcissist", "Baker", "Baby", "Eskimo that is too Cold"]
const defaultRelationship = ["Reluctant Boyfriend", "Grandma", "Long-time Butler", "Frenemies"]
const defaultObjective = ["To Get Away", "To Become Taller", "Pass the Exam", "Earn Your License"]
const defaultWhere = ["Pawn Shop", "Under a Desk", "Nightclub", "Deep Cave"]

const ABot = class AcademicBot
{

  constructor(channel = process.env.CHANNEL_TO_SCRAPE)
  {
    
    //Suggestion Lists
    this.character  = defaultCharacter.slice()
    this.relationship = defaultRelationship.slice()
    this.objective = defaultObjective.slice()
    this.where = defaultWhere.slice()

    //Voting variables
    this.voting = false
    this.votes = []
    this.options = []
    this.votedAlready = []

    this.finalWord = ""

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
              this.vote()
            break
          case "1":
            if(this.voting)
              this.displayWinner(0)
            break
          case "2":
            if(this.voting)
              this.displayWinner(1)
            break
          case "3":
            if(this.voting)
              this.displayWinner(2)
            break
          case "4":
            if(this.voting)
              this.displayWinner(3)
            break
          case "r":
            this.getRandomSuggestion()
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
    //Suggestion Lists
    this.character  = defaultCharacter.slice()
    this.relationship = defaultRelationship.slice()
    this.objective = defaultObjective.slice()
    this.where = defaultWhere.slice()

    //Voting variables
    this.votes = []
    this.options = []
    this.votedAlready = []
  }

  getState()
  {
    return {
      character: this.character,
      relationship: this.relationship,
      objective: this.objective,
      where: this.where,
      isVoting: this.voting,
      votes: this.votes,
      options: this.options,
      votedAlready: this.votedAlready,
      finalWord: this.finalWord
    };
  }

  //SUGGESTION ADDITION

  addCharacter(cha)
  {
    this.Bot.say('A character has been suggested.')
    this.character.push(cha)
    console.log(this.character)
  }

  addRelationship(rel)
  {
    this.Bot.say('A relationship has been suggested.')
    this.relationship.push(rel)
    console.log(this.relationship)
  }

  addObjective(obj)
  {
    this.Bot.say('An objective has been suggested.')
    this.objective.push(obj)
    console.log(this.objective)
  }

  addWhere(wh)
  {
    this.Bot.say('A where has been suggested.')
    this.where.push(wh)
    console.log(this.where)
  }

  //SUGGESTION FETCH

  getCharacter(num = 1)
  {
    if(this.character.length == 0)
      return 0

    var candidates = this.character.slice()
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)
    }
    return chosen
  }

  getRelationship(num = 1)
  {
    if(this.relationship.length == 0)
      return 0

    var candidates = this.relationship.slice()
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)
    }
    return chosen
  }

  getObjective(num = 1)
  {
    if(this.objective.length == 0)
      return 0

    var candidates = this.objective.slice()
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)
    }
    return chosen
  }

  getWhere(num = 1)
  {
    if(this.where.legnth == 0)
      return 0

    var candidates = this.where.slice()
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)
    }
    return chosen
  }

  getRandomSuggestion()
  {
    var randomSuggestions = getOptions()
    if(randomSuggestions.length == 0)
      return -1

    var rand = Math.floor(Math.random() * Math.floor(randomSuggestions.length))
    var randomSuggestion
    randomSuggestion = randomSuggestions[rand]

    this.Bot.say("Random Suggestion: " + randomSuggestion)
  }

  //TIMER FOR PRINTING DISCLAIMER and/or CONSENT FORM

  printLegalDoc()
  {
    this.Bot.say("A legal consent form or disclaimer would go here. ;)")
  }

  //LOGGING

  writeToLog(chatter)
  {
    //For some reason the bot marks some things that should logically be false as undefined. I am shifting them here for the purposes of logging. Will do research before changing the actual bot in case of functionality I'm unaware of.
    if(chatter.emote_only === undefined)
      chatter.emote_only = false
    if(chatter.mod === undefined)
      chatter.mod = false
    if(chatter.sub === undefined)
      chatter.sub = false

    var filename = "./" + new Date().toDateString() + ".csv"
    var toFile
    if(!fs.existsSync(filename))
    {
      toFile = "Timestamp,Username,Message,Emote Only,Mod,Sub,Prime,Channel" + "\r\n"
      fs.appendFile(filename, toFile, (err) =>
      {
        if(err)
        {
          throw err;
          console.log("Failed to write")
        }
        else
          console.log("Created new log file.")
      })
    }

    toFile =  new Date() + "," + chatter.username + "," + chatter.message + "," + chatter.emote_only + "," + chatter.mod + "," + chatter.sub + "," + chatter.turbo + "," + chatter.channel + "\r\n"
    fs.appendFile(filename, toFile, (err) =>
    {
      if(err)
      {
        throw err;
        console.log("Failed to write")
      }
      else
        console.log("Wrote to file.")
    })
  }

  //VOTING

  getOptions()
  {
    var cha
    var rel
    var obj
    var wh

    var toReturn = []

    cha = this.getCharacter()
    rel = this.getRelationship()
    obj = this.getObjective()
    wh = this.getWhere()

    if(cha != 0)
      toReturn.push(cha + " (Character)")
    if(rel != 0)
      toReturn.push(rel + " (Relationship)")
    if(obj != 0)
      toReturn.push(obj + " (Objective)")
    if(wh != 0)
      toReturn.push(wh + " (Where)")

    return toReturn
  }

  voteFor(choice, user)
  {
    console.log("Vote received. Voting for: "+ choice +", Vote by: " + user)
    if(this.votedAlready.indexOf(user) > -1)
    {
      return
    }
    this.votes[parseInt(choice)]++
    this.votedAlready.push(user)
  }

  displayWinner(winner = -1)
  {
    if(this.voting)
    {
      if(winner == -1)
      {
        var ties = []
        winner = 0
        for(var i = 0; i < this.options.length; i++)
        {
          if(this.votes[i] > this.votes[winner])
            winner = i
          else if(this.votes[i] == this.votes[winner] && this.votes[winner] != 0)
            ties.push(i)
            ties.push(winner)
        }

        if(ties.length > 0 && this.votes[ties[0]] == this.votes[winner])
          winner = ties[Math.floor(Math.random() * Math.floor(ties.length))]
      }
      else if(winner >= this.options.length || winner < 1)
      {
        console.log("Invalid winner chosen.")
        return -1
      }
      this.finalWord = this.options[winner]
      //this.Bot.say("Winner is " + this.finalWord)
    }
    this.voting = false
  }

  vote()
  {
    this.voting = true
    this.votes = [0, 0, 0, 0]
    this.votedAlready = []

    this.options = this.getOptions()

    /*
    this.Bot.say("Voting has begun. Options:")
    for(var i = 0; i < this.options.length; i++)
    {
      this.Bot.say(""+(i+1) + ": " + this.options[i])
    }
    this.Bot.say("Format: '!v #'")
    */

    //Tabulate results
    //setTimeout(() =>
    //{
    //  this.displayWinner()
    //}, 15000)
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
