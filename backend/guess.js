require('dotenv').config();

//Stores objects that contain a word and the user who submitted the word. This object stores the selections from randomly choosing a noun, verb, or location.
const words = {
  noun: {},
  verb: {},
  location: {}
}

//Stores the username of the person who correctly guessed the noun, verb, or loaction.
const guessedBy = {
  noun: "",
  verb: "",
  location: ""
}

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
  }

  addVerb(ve, user)
  {
    verbs[verbs.length] = {
      word: ve,
      user: user,
    };
  }

  addLocation(loc, user)
  {
    locations[locations.length] = {
      word: loc,
      user: user,
    };
  }

  clearWords()
  {
    nouns = [];
    verbs = [];
    locations = [];

    words = {
      noun: "",
      verb: "",
      location: ""
    };
  }

  getState()
  {
    var state = {
      isGuessing: false,
      currentNoun: words.noun.word,
      currentVerb: words.verb.word,
      currentLocation: words.location.word,
      guessedNoun: guessedBy.noun,
      guessedVerb: guessedBy.verb,
      guessedLocation: guessedBy.location
    }
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

    words.noun = word;
    return word.word;
  }

  getVerb()
  {
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

    words.verb = word;
    return word.word;
  }

  getLocation()
  {
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

    words.location = word;
    return word.word;
  }

  async guess(word, uid)
  {
    let promise = await this.convertUidToUsername(id);
    promise = JSON.parse(promise);
    var user = promise.display_name;

    if(guessedBy.noun == "")
      guessNoun(word, user);
    if(guessedBy.verb == "")
      guessVerb(word, user);
    if(guessedBy.location == "")
      guessLocation(word, user);
  }

  guessNoun(message, user)
  {
    if(!(words.noun.user == user))
    {
      if(message.includes(words.noun.word))
      {
        guessedBy.noun = user;
      }
    }
  }

  guessVerb(message, user)
  {
    if(!(words.verb.user == user))
    {
      if(message.includes(words.verb.word))
      {
        guessedBy.verb = user;
      }
    }
  }

  guessLocation(message, user)
  {
    if(!(words.location.user == user))
    {
      if(message.includes(words.location.word))
      {
        guessedBy.location = user;
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
