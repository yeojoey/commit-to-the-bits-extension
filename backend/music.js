const moods = ["action", "romance", "wild west", "spooky"];

const Muse = class Music
{
  constructor()
  {
    this.djBucket = [];
    this.dj = "";
    this.queue = [];
  }

  getInDJBucket(uID)
  {
    this.djBucket.push(uID);
    console.log(this.djBucket);
  }

  clearDJBucket()
  {
    this.djBucket = [];
  }

  clearQueue()
  {
    this.queue = [];
  }

  getDJ()
  {
    let rand = this.randomInt(this.djBucket.length);
    this.dj = this.djBucket[rand];
    this.removeFromDJBucket(this.dj);
    this.clearQueue();
    return this.dj;
  }

  getOptions()
  {
    const toReturn = [];
    var prunedList = moods.slice();

    //Make sure we don't provide options that are already in the queue
    for(var i = 0; i < prunedList.length; i++)
    {
      if(this.queue.includes(prunedList[i]))
        prunedList = prunedList.splice(i, 1);
    }

    for(var i = 0; i < 3; i++)
    {
      let index = this.randomInt(prunedList.length);
      toReturn.push(prunedList[index]);
      prunedList = prunedList.splice(index, 1);
    }

    return toReturn;
  }

  getQueue()
  {
    return this.queue;
  }

  getState()
  {
    var opt = this.getOptions();
    return {
      musicQueue: this.queue,
      musicOptions: opt,
      dj: this.dj
    }
  }

  removeFromDJBucket(uID)
  {
    for(var i = 0; i < this.djBucket.length; i++)
    {
      console.log("checking bucket");
      if(this.djBucket[i] == uID)
      {
        this.djBucket = this.djBucket.splice(i, 1);
        console.log("remove from bucket");
        console.log(this.djBucket);
      }
    }
  }

  addToQueue(mood)
  {
    this.queue.push(mood);
    return this.queue;
  }

  randomInt(max)
  {
    return Math.floor(Math.random() * Math.floor(max));
  }
}

module.exports = Muse;
