require('dotenv').config();

const words = {
  noun: "",
  verb: "",
  location: ""
}

const guessedBy = {
  noun: "",
  verb: "",
  location: ""
}

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

  guess(word, user)
  {
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
}

module.exports = Guesser;
