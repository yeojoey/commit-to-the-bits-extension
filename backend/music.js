const request = require('request-promise');

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

  getInDJBucket(uID, opID)
  {
    if(!this.djBucket.includes(uID))
    {
      this.djBucket.push(uID);
      this.opaqueBucket.push(opID);
    }
  }

  clearDJBucket()
  {
    this.djBucket = [];
    this.opaqueBucket = [];
  }

  clearQueue()
  {
    this.queue = [];
    this.canSelectSong = true;
  }

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

  getQueue()
  {
    return this.queue;
  }

  getDJBucket()
  {
    return this.djBucket;
  }

  getState()
  {
    return {
      musicQueue: this.queue,
      musicOptions: this.options,
      dj: this.dj,
      canSelectSong: this.canSelectSong,
    }
  }

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
        'Client-ID': 'tndhpyr8a9l40u3m5cw5wpnrbievij',
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
