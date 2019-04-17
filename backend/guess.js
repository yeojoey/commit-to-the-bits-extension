require('dotenv').config();

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
    let promise = await this.convertUidToUsername(id);
    promise = JSON.parse(promise);
    var user = promise.display_name;

    console.log("Submitting "+word+" as "+type+". Word submitted by "+user);

    if(type == "noun")
      addNoun(word, user);
    else if(type == "verb")
    {
      addVerb(word, user);
    }
    else if(type == "location")
    {
      addLocation(word, user);
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
      phase: "Submission",
      words: words,
      answers: answers,
    }

    return state;
  }

  getWord(type)
  {
    if(type == "noun")
      return getNoun();
    else if(type == "verb")
      return getVerb();
    else if(type == "location")
      return getLocation();
  }

  getNoun()
  {
    console.log("Getting a noun.");
    let rand = this.getRandomInt(nouns.length);
    let word = nouns[rand];

    if(nouns.length > 1)
    {
      previousNouns.push(nouns[rand]);
      nouns.splice(rand, 1);
    }
    else
    {
      nouns = previousNouns.slice();
      previousNouns = [];
    }

    words[0].word = word.word;
    words[0].submitter = word.user;
    answers[0].submitter = word.user;
    console.log("Got noun: "+word.word);
    return word.word;
  }

  getVerb()
  {
    console.log("Getting a verb.");
    let rand = this.getRandomInt(verbs.length);
    let word = verbs[rand];

    if(verbs.length > 1)
    {
      previousVerbs.push(verbs[rand]);
      verbs.splice(rand, 1);
    }
    else
    {
      verbs = previousVerbs.slice();
      previousVerbs = [];
    }

    words[1].word = word.word;
    words[1].submitter = word.user;
    answers[1].submitter = word.user;
    console.log("Got verb: "+word.word);
    return word.word;
  }

  getLocation()
  {
    console.log("Getting a location.");
    let rand = this.getRandomInt(locations.length);
    let word = locations[rand];

    if(locations.length > 1)
    {
      previousLocations.push(locations[rand]);
      locations.splice(rand, 1);
    }
    else
    {
      locations = previousLocations.slice();
      previousLocations = [];
    }

    words[2].word = word.word;
    words[2].submitter = word.user;
    answers[2].submitter = word.user;
    console.log("Got location: "+word.word);
    return word.word;
  }

  async guess(word, uid)
  {
    let promise = await this.convertUidToUsername(id);
    promise = JSON.parse(promise);
    var user = promise.display_name;

    word = word.toLowerCase();

    if(guessedBy.noun == "")
      guessNoun(word, user);
    if(guessedBy.verb == "")
      guessVerb(word, user);
    if(guessedBy.location == "")
      guessLocation(word, user);
  }

  guessNoun(message, user)
  {
    if(!(words[0].submitter == user))
    {
      let toCompare = words[0].word.toLowerCase();
      if(message.includes(toCompare))
      {
        guessedBy.noun = user;
        answers[0].word = words[0].word;
        answers[0].guesser = user;
      }
    }
  }

  guessVerb(message, user)
  {
    if(!(words[1].submitter == user))
    {
      let toCompare = words[1].word.toLowerCase();
      if(message.includes(toCompare))
      {
        guessedBy.verb = user;
        answers[1].word = words[1].word;
        answers[1].guesser = user;
      }
    }
  }

  guessLocation(message, user)
  {
    if(!(words[2].user == user))
    {
      let toCompare = words[2].word.toLowerCase();
      if(message.includes(toCompare))
      {
        guessedBy.location = user;
        answers[2].word = words[2].word;
        answers[2].guesser = user;
      }
    }
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
