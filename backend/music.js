const moods = ["action", "romance", "wild west", "spooky"];

const Muse = class Music
{
  constructor()
  {
    this.djBucket = [];
    this.dj = "";
    this.queue = [];
    this.canSelectSong = true;
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
    this.canSelectSong = true;
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
    console.log("Pruned List");
    console.log(prunedList);
    console.log(prunedList.length);

    //Make sure we don't provide options that are already in the queue
    var len = prunedList.length;
    for(var i = 0; i < prunedList.length; i++)
    {
      console.log("CHECKING IF IN QUEUE");
      console.log(prunedList[i]+" of "+prunedList.length);
      console.log(i);
      if(this.queue.includes(prunedList[i]))
      {
        console.log("Thing found");
        prunedList.splice(i, 1);
        i--;
      }
    }

    for(var i = 0; i < 3; i++)
    {
      let index = this.randomInt(prunedList.length);
      toReturn.push(prunedList[index]);
      prunedList.splice(index, 1);
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
      dj: this.dj,
      canSelectSong: this.canSelectSong,
    }
  }

  removeFromDJBucket(uID)
  {
    for(var i = 0; i < this.djBucket.length; i++)
    {
      console.log("checking bucket for uid " + uID);
      if(this.djBucket[i] == uID)
      {
        console.log("Before Removal");
        console.log(this.djBucket);
        this.djBucket.splice(i, 1);
        console.log("After Removal");
        console.log(this.djBucket);
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
}

module.exports = Muse;
