require('dotenv').config();
const request = require('request-promise');

//Stores objects that contain a word and the user who submitted the word. This object stores the selections from randomly choosing a noun, verb, or location.
const words = [
  {word: null, submitter: null},
  {word: null, submitter: null},
  {word: null, submitter: null}
];

//Stores the username of the person who correctly guessed the noun, verb, or loaction.
const guessedBy = {
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

  clearWords()
  {
    nouns = [];
    verbs = [];
    locations = [];

    words = [
      {word: null, submitter: null},
      {word: null, submitter: null},
      {word: null, submitter: null}
    ];
  }

  getState()
  {
    var state = {
      phase: false,
      words: words,
      answers: answers,
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

  guessNoun(message, user)
  {
    console.log("Checking if noun.");
    var keepGoing = true;
    if(!(words[0].submitter == user))
    {
      console.log("Guesser is not submitter.");
      let toCompare = words[0].word.toLowerCase();
      console.log("Comparing "+message+" with "+toCompare);
      if(message.includes(toCompare))
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

  guessVerb(message, user)
  {
    var keepGoing = true;
    if(!(words[1].submitter == user))
    {
      let toCompare = words[1].word.toLowerCase();
      if(message.includes(toCompare))
      {
        guessedBy.verb = user;
        answers[1].word = words[1].word;
        answers[1].guesser = user;
        keepGoing = false;
      }
    }
    return keepGoing;
  }

  guessLocation(message, user)
  {
    var keepGoing = true;
    if(!(words[2].user == user))
    {
      let toCompare = words[2].word.toLowerCase();
      if(message.includes(toCompare))
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
