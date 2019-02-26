const rp = require('request-promise')

var url = "https://tmi.twitch.tv/group/user/" + "charlieparke" + "/chatters"
rp(url)
  .then(function(body)
  {
    // const chatters = body.chatters.viewers;
    // var rando = Math.floor(Math.random() * Math.floor(chatters.length));
    // cap = chatters[rando];
    // toReturn = {
    //   captain: cap
    // };
    // AcaBot.setCaptain(cap);
    console.log(body)
  })
  .catch(function(err)
  {
    console.log(err)
  })
