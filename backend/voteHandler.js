
var defaultCharacter = ["Narcissist", "Baker", "Baby", "Eskimo that is too Cold"]
var defaultRelationship = ["Reluctant Boyfriend", "Grandma", "Long-time Butler", "Frenemies"]
var defaultObjective = ["To Get Away", "To Become Taller", "Pass the Exam", "Earn Your License"]
var defaultWhere = ["Pawn Shop", "Under a Desk", "Nightclub", "Deep Cave"]

const Vote = class VoteHandler
{

  constructor()
  {
    // Suggestion Lists
    this.character  = []
    this.relationship = []
    this.objective = []
    this.where = []

    // Used Suggestion Lists
    this.usedCharacter  = []
    this.usedRelationship = []
    this.usedObjective = []
    this.usedWhere = []

    // Used Default Suggestion Lists
    this.usedDefaultCharacter  = []
    this.usedDefaultRelationship = []
    this.usedDefaultObjective = []
    this.usedDefaultWhere = []

    //Voting variables
    this.voting = false
    this.votes = []
    this.options = []
    this.votedAlready = []

    this.finalWord = ""
  }

  clear()
  {
    //Suggestion Lists
    this.character  = []
    this.relationship = []
    this.objective = []
    this.where = []

    //Voting variables
    this.votes = []
    this.options = []
    this.votedAlready = []

    this.captain = ""
  }

  addCharacter(cha)
  {
    this.character.push(cha)
    console.log(this.character)
  }

  addRelationship(rel)
  {
    this.relationship.push(rel)
    console.log(this.relationship)
  }

  addObjective(obj)
  {
    this.objective.push(obj)
    console.log(this.objective)
  }

  addWhere(wh)
  {
    this.where.push(wh)
    console.log(this.where)
  }

  submitSuggestion(category, suggestion)
  {
    console.log("Category: "+category);
    console.log("Suggestion: "+suggestion);
    switch(category)
    {
      case category == "Character":
        addCharacter(suggestion);
        break;
      case category == "Relationship":
        addRelationship(suggestion);
        break;
      case category == "Objective":
        addObjective(suggestion);
        break;
      case category == "Location":
        addWhere(suggestion);
        break;
    }
  }

  getCharacter(num = 1)
  {
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      if(this.character.length > 0)
        var candidates = this.character.slice()
      else if (defaultCharacter.length > 0)
        var candidates = defaultCharacter.slice()
      else
      {
        this.character = this.usedCharacter.slice()
        defaultCharacter = this.usedDefaultCharacter.slice()

        this.usedCharacter = []
        this.usedDefaultCharacter = []

        if(this.character.length > 0)
          var candidates = this.character.slice()
        else if (defaultCharacter.length > 0)
          var candidates = defaultCharacter.slice()
      }

      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)

      if(this.character.length > 0)
      {
        this.usedCharacter.push(this.character[random])
        this.character.splice(random, 1);
      }
      else
      {
        this.usedDefaultCharacter.push(defaultCharacter[random])
        defaultCharacter.splice(random, 1);
      }
    }
    return chosen
  }

  getRelationship(num = 1)
  {
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      if(this.relationship.length > 0)
        var candidates = this.relationship.slice()
      else if (defaultRelationship.length > 0)
        var candidates = defaultRelationship.slice()
      else
      {
        this.relationship = this.usedRelationship.slice()
        defaultRelationship = this.usedDefaultRelationship.slice()

        this.usedRelationship = []
        this.usedDefaultRelationship = []

        if(this.relationship.length > 0)
          var candidates = this.relationship.slice()
        else if (defaultRelationship.length > 0)
          var candidates = defaultRelationship.slice()
      }

      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)

      if(this.relationship.length > 0)
      {
        this.usedRelationship.push(this.relationship[random])
        this.relationship.splice(random, 1);
      }
      else
      {
        this.usedDefaultRelationship.push(defaultRelationship[random])
        defaultRelationship.splice(random, 1);
      }
    }
    return chosen
  }

  getObjective(num = 1)
  {
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      if(this.objective.length > 0)
        var candidates = this.objective.slice()
      else if (defaultObjective.length > 0)
        var candidates = defaultObjective.slice()
      else
      {
        this.objective = this.usedObjective.slice()
        defaultObjective = this.usedDefaultObjective.slice()

        this.usedObjective = []
        this.usedDefaultObjective = []

        if(this.objective.length > 0)
          var candidates = this.objective.slice()
        else if (defaultObjective.length > 0)
          var candidates = defaultObjective.slice()
      }

      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)

      if(this.objective.length > 0)
      {
        this.usedObjective.push(this.objective[random])
        this.objective.splice(random, 1);
      }
      else
      {
        this.usedDefaultObjective.push(defaultObjective[random])
        defaultObjective.splice(random, 1);
      }
    }
    return chosen
  }

  getWhere(num = 1)
  {
    var chosen = []
    for(var i = 0; i < num; i++)
    {
      if(this.where.length > 0)
        var candidates = this.where.slice()
      else if (defaultWhere.length > 0)
        var candidates = defaultWhere.slice()
      else
      {
        this.where = this.usedWhere.slice()
        defaultWhere = this.usedDefaultWhere.slice()

        this.usedWhere = []
        this.usedDefaultWhere = []

        if(this.where.length > 0)
          var candidates = this.where.slice()
        else if (defaultWhere.length > 0)
          var candidates = defaultWhere.slice()
      }

      var random = Math.floor(Math.random() * (+candidates.length - +0)) + +0;
      chosen.push(candidates[random])
      candidates.slice(random, 1)

      if(this.where.length > 0)
      {
        this.usedWhere.push(this.where[random])
        this.where.splice(random, 1);
      }
      else
      {
        this.usedDefaultWhere.push(defaultWhere[random])
        defaultWhere.splice(random, 1);
      }
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

  }

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
    }
    this.voting = false
  }

  vote()
  {
    this.voting = true
    this.votes = [0, 0, 0, 0]
    this.votedAlready = []

    this.options = this.getOptions()
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
      finalWord: this.finalWord,
    };
  }

}

module.exports = Vote;
