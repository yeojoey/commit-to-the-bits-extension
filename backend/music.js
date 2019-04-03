const request = require('request');

const moods = ["Action", "Heavy Metal", "Marriage", "Romance", "Spooky", "Very Sad", "Wild West"];
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
    console.log(this.djBucket);
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

    this.dj = await this.convertUidToUsername(id);
    console.log("DJNAME : "+this.dj);
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
    console.log("CAN SELECT SONG: "+this.canSelectSong);
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
      console.log("IN ASYNC : " + json.display_name);
      return json.display_name;
    });
    return name;
  }
}

module.exports = Muse;
