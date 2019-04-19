require('dotenv').config();
const request = require('request-promise');
const stringSimilarity = require('string-similarity');

//Stores objects that contain a word and the user who submitted the word. This object stores the selections from randomly choosing a noun, verb, or location.
const words = [
  {word: null, submitter: null},
  {word: null, submitter: null},
  {word: null, submitter: null}
];

const similarityThreshold = .75;

//Stores the username of the person who correctly guessed the noun, verb, or loaction.
var guessedBy = {
  noun: "",
  verb: "",
  location: ""
}

//Joey's preference for state. Contains word info for current secret words. Submitter is always filled in, word and guesser are only filled after correctly guessed.
var answers = [
  {word: null, submitter: null, guesser: null},
  {word: null, submitter: null, guesser: null},
  {word: null, submitter: null, guesser: null}
];

var publicAnswers = [
  {word: null, submitter: null, guesser: null},
  {word: null, submitter: null, guesser: null},
  {word: null, submitter: null, guesser: null}
];

//These objects store more objects that contain a suggested word and the user who submitted the word. There are 'previous' versions to allow us to avoid repeating words.
var nouns = [];
var verbs = [];
var locations = [];
var previousVerbs = [];
var previousNouns = [];
var previousLocations = [];

const Guesser = class Guess
{
  constructor()
  {

  }

  async addWord(word, uid, type)
  {
    let promise = await this.convertUidToUsername(uid);
    promise = JSON.parse(promise);
    var user = promise.display_name;
    user = user.toLowerCase();

    console.log("Submitting "+word+" as "+type+". Word submitted by "+user);

    if(type == "noun")
      this.addNoun(word, user);
    else if(type == "verb")
    {
      this.addVerb(word, user);
    }
    else if(type == "location")
    {
      this.addLocation(word, user);
    }
  }

  addNoun(no, user)
  {
    nouns[nouns.length] = {
      word: no,
      user: user,
    };
    console.log(nouns);
  }

  addVerb(ve, user)
  {
    verbs[verbs.length] = {
      word: ve,
      user: user,
    };
    console.log(verbs);
  }

  addLocation(loc, user)
  {
    locations[locations.length] = {
      word: loc,
      user: user,
    };
    console.log(locations);
  }

  clearGuessers()
  {
    guessedBy = {
      noun: "",
      verb: "",
      location: ""
    }
  }

  clearAnswers()
  {
    answers[0].word = null;
    answers[1].word = null;
    answers[2].word = null;
    answers[0].guesser = null;
    answers[1].guesser = null;
    answers[2].guesser = null;

    publicAnswers = answers.slice();
  }

  getState()
  {
    var state = {
      phase: false,
      words: words,
      answers: publicAnswers,
    }

    return state;
  }

  getWord(type)
  {
    if(type == "noun")
      return this.getNoun();
    else if(type == "verb")
      return this.getVerb();
    else if(type == "location")
      return this.getLocation();
  }

  getNoun()
  {
    console.log("Getting a noun.");
    if(nouns.length <= 0 && previousNouns.length <= 0)
      return "";
    if(nouns.length <= 0)
    {
      nouns = previousNouns.slice();
      previousNouns = [];
    }

    let rand = this.getRandomInt(nouns.length);
    let word = nouns[rand];

    previousNouns.push(nouns[rand]);
    nouns.splice(rand, 1);

    words[0].word = word.word;
    words[0].submitter = word.user;
    answers[0].submitter = word.user;
    console.log("Got noun: "+word.word);
    console.log(answers);
    return word.word;
  }

  getVerb()
  {
    console.log("Getting a verb.");
    if(verbs.length <= 0 && previousVerbs.length <= 0)
      return "";
    if(verbs.length <= 0)
    {
      verbs = previousVerbs.slice();
      previousVerbs = [];
    }

    let rand = this.getRandomInt(verbs.length);
    let word = verbs[rand];

    previousVerbs.push(verbs[rand]);
    verbs.splice(rand, 1);

    words[1].word = word.word;
    words[1].submitter = word.user;
    answers[1].submitter = word.user;
    console.log("Got verb: "+word.word);
    console.log(answers);
    return word.word;
  }

  getLocation()
  {
    console.log("Getting a location.");
    if(locations.length <= 0 && previousLocations.length <= 0)
      return "";
    if(locations.length <= 0)
    {
      locations = previousLocations.slice();
      previousLocations = [];
    }

    let rand = this.getRandomInt(locations.length);
    let word = locations[rand];

    previousLocations.push(locations[rand]);
    locations.splice(rand, 1);

    words[2].word = word.word;
    words[2].submitter = word.user;
    answers[2].submitter = word.user;
    console.log("Got location: "+word.word);
    console.log(answers);
    return word.word;
  }

  guess(word, user)
  {
    word = word.toLowerCase();

    console.log(user+" has guessed "+word);
    var cont = true;
    if(guessedBy.noun == "")
      cont = this.guessNoun(word, user);
    if(cont && guessedBy.verb == "")
      cont = this.guessVerb(word, user);
    if(cont && guessedBy.location == "")
      cont = this.guessLocation(word, user);

    return !cont;
  }

  guessNoun(stringReceived, user)
  {
    console.log("Checking if noun.");
    var keepGoing = true;
    if(!(words[0].submitter == user))
    {
      console.log("Guesser is not submitter.");
      let correctString = words[0].word.toLowerCase();
      console.log("Comparing "+stringReceived+" with "+correctString);
      let simValue = stringSimilarity.compareTwoStrings(stringReceived, correctString);
      if(simValue >= similarityThreshold)
      {
        console.log("They match.");
        guessedBy.noun = user;
        answers[0].word = words[0].word;
        answers[0].guesser = user;
        keepGoing = false;
      }
    }

    return keepGoing;
  }

  guessVerb(stringReceived, user)
  {
    var keepGoing = true;
    if(!(words[1].submitter == user))
    {
      let correctString = words[1].word.toLowerCase();
      console.log("Comparing "+stringReceived+" with "+correctString);
      let simValue = stringSimilarity.compareTwoStrings(stringReceived, correctString);
      if(simValue >= similarityThreshold)
      {
        guessedBy.verb = user;
        answers[1].word = words[1].word;
        answers[1].guesser = user;
        keepGoing = false;
      }
    }
    return keepGoing;
  }

  guessLocation(stringReceived, user)
  {
    var keepGoing = true;
    if(!(words[2].user == user))
    {
      let correctString = words[2].word.toLowerCase();
      console.log("Comparing "+stringReceived+" with "+correctString);
      let simValue = stringSimilarity.compareTwoStrings(stringReceived, correctString);
      if(simValue >= similarityThreshold)
      {
        guessedBy.location = user;
        answers[2].word = words[2].word;
        answers[2].guesser = user;
        keepGoing = false;
      }
    }
    return keepGoing;
  }

  getRandomInt(max)
  {
    return Math.floor(Math.random() * max);
  }

  async convertUidToUsername(uid)
  {
    const url = 'https://api.twitch.tv/kraken/users/'+uid;
    const options = {
      url: url,
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-ID': process.env.ENV_CLIENT_ID,
      }
    };

    const name = await request(options, function(err, res, body) {
      let json = JSON.parse(body);
      return json.display_name;
    });
    return name;
  }

  //Use
  // let promise = await this.convertUidToUsername(id);
  // promise = JSON.parse(promise);
  // this.dj = promise.display_name;
}

module.exports = Guesser;
