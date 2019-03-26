const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

require('dotenv').config();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const GoogSheet = class GoogleSheetHandler
{

  constructor()
  {
    this.whiteList = [];
    this.getWhiteListedUsers();
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  authorize(credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    var token = fs.readFileSync(TOKEN_PATH);
    //if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error while trying to retrieve access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }

  readWhiteListedUsers(auth, self)
  {
    const sheets = google.sheets({version: 'v4', auth});
    var spreadsheetId = '17y7JlRe-F8rl2wrZkrjUe9zrddfEtwTBghrhKFp3EoA';

    let inArray = false;
    sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'Form Responses 1!B2:C',
    }, (err, res) =>
    {
      if (err)
        return console.log('The API returned an error: ' + err);
      const rows = res.data.values;
      if (rows.length)
      {
        //console.log('Username:');
        rows.map((row) =>
        {
          inArray = false;
          //console.log(row[0]);
          for(var i = 0; i < self.whiteList.length; i++)
          {
            if(row[0] == self.whiteList[i])
            {
              //console.log("Breaking from loop due to duplicate.");
              inArray = true;
              break;
            }
          }
          if(!inArray)
          {
            self.whiteList[self.whiteList.length] = row[0];
            //console.log("USERS: "+users);
          }
        });
      }
      else
      {
        console.log('No data found.');
        self.whiteList[0] = -1;
      }
      console.log("FINAL USERS: "+self.whiteList);
    });
    console.log("RETURN READING");
  }

  //Begin stuff written by Parker, not by Google.
  getWhiteListedUsers()
  {
    var content = fs.readFileSync('credentials.json');
    var auth = this.authorize(JSON.parse(content), this.readWhiteListedUsers);
    this.readWhiteListedUsers(auth, this);
    return this.whiteList;
  }

  appendData(auth, chatter)
  {
    const whiteListedUsers = this.getWhiteListedUsers();
    var listed = false;
    for(var i = 0; i < whiteListedUsers.length; i++)
    {
      if(whiteListedUsers[i] == chatter.username)
      {
        listed = true;
        break;
      }
    }

    if(listed)
    {
      //For some reason the bot marks some things that should logically be false as undefined. I am shifting them here for the purposes of logging. Will do research before changing the actual bot in case of functionality I'm unaware of.
      if(chatter.emote_only === undefined)
        chatter.emote_only = false
      if(chatter.mod === undefined)
        chatter.mod = false
      if(chatter.sub === undefined)
        chatter.sub = false

      //Append data here
      var spreadsheetId = process.env.CHATLOG;
      let values = [
        [
          new Date(), chatter.username, chatter.message, chatter.emote_only, chatter.mod, chatter.sub, chatter.turbo, chatter.channel
        ],
        // Additional rows ...
      ];
      let resource = {
        values,
      };
      const sheets = google.sheets({version: 'v4', auth});
      sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        valueInputOption: "RAW",
        resource: resource,
      }, (err, result) => {
        if (err) {
          // Handle error.
          console.log(err);
        } else {
          console.log(`${result.updates.updatedCells} cells appended.`);
        }
      });
    }
  }

  writeToChatLog(chatter)
  {
    var content = fs.readFileSync('credentials.json');
    var auth = this.authorize(JSON.parse(content));
    this.appendData(auth, chatter);
  }
}

module.exports = GoogSheet;
