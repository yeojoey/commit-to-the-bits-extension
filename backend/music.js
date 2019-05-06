const request = require('request-promise');

//Contains our music genres for users to choose from.
const moods = ["Action", "Adventure", "Choral", "Comedy", "Dance", "Dramatic", "Gregorian Chant", "Groovy", "Fancy", "Futuristic", "Heavy Metal", "Mysterious", "Old-Timey", "Romance", "Sensual", "Smooth Jazz", "Spooky", "Suspense", "Sad", "Wild West"];

const Muse = class Music
{
  constructor()
  {
    this.djBucket = [];
    this.opaqueBucket = [];
    this.dj = "";
    this.queue = [];
    this.canSelectSong = true;
    this.options = [];
  }

  //Puts the given user in the running to be DJ. Takes that user's user id and opaque user id.
  getInDJBucket(uID, opID)
  {
    if(!this.djBucket.includes(uID))
    {
      this.djBucket.push(uID);
      this.opaqueBucket.push(opID);
      console.log(this.djBucket);
    }
  }

  //Clears the bucket.
  clearDJBucket()
  {
    this.djBucket = [];
    this.opaqueBucket = [];
  }

  //Clears the song queue.
  clearQueue()
  {
    this.queue = [];
    this.canSelectSong = true;
  }

  //Gets a random DJ from the bucket. Is async to retrieve user's username.
  async getDJ()
  {
    let rand = this.randomInt(this.djBucket.length);
    let id = this.djBucket[rand];
    let opID = this.opaqueBucket[rand];
    this.removeFromDJBucket(id);
    this.clearQueue();

    let promise = await this.convertUidToUsername(id);
    promise = JSON.parse(promise);
    this.dj = promise.display_name;
    return {
      dj: this.dj,
      id: opID,
    };
  }

  //Gets the song options for the current DJ.
  getOptions()
  {
    this.options = [];
    var prunedList = moods.slice();

    //Make sure we don't provide options that are already in the queue
    var len = prunedList.length;
    for(var i = 0; i < prunedList.length; i++)
    {
      if(this.queue.includes(prunedList[i]))
      {
        prunedList.splice(i, 1);
        i--;
      }
    }

    for(var i = 0; i < 3; i++)
    {
      let index = this.randomInt(prunedList.length);
      this.options.push(prunedList[index]);
      prunedList.splice(index, 1);
    }
    return this.options;
  }

  //Gets the queue.
  getQueue()
  {
    return this.queue;
  }

  //Gets the DJ Bucket.
  getDJBucket()
  {
    return this.djBucket;
  }

  //Returns the state of the music game.
  getState()
  {
    return {
      musicQueue: this.queue,
      musicOptions: this.options,
      dj: this.dj,
      canSelectSong: this.canSelectSong,
    }
  }

  //Removes the given id from the bucket.
  removeFromDJBucket(uID)
  {
    for(var i = 0; i < this.djBucket.length; i++)
    {
      if(this.djBucket[i] == uID)
      {
        this.djBucket.splice(i, 1);
        this.opaqueBucket.splice(i, 1);
      }
    }
  }

  //Removes the given song from the queue.
  removeFromQueue(index)
  {
    this.queue.splice(index, 1);
    this.canSelectSong = true;
    return this.queue;
  }

  //Swaps two songs. Unused.
  swapElements(el1, el2)
  {
    let temp = this.queue[el1];
    this.queue[el1] = this.queue[el2];
    this.queue[el2] = temp;
    return this.queue;
  }

  //Adds a song to the queue.
  addToQueue(mood)
  {
    this.queue.push(mood);
    if(this.queue.length >= 3)
      this.canSelectSong = false;
    return this.queue;
  }

  randomInt(max)
  {
    return Math.floor(Math.random() * Math.floor(max));
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
}

module.exports = Muse;
