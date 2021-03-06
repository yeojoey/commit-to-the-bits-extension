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

    var token = process.env.GOOGLE_SHEETS_TOKEN;//fs.readFileSync(TOKEN_PATH);
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

  //Reads whitelisted users from our internal google sheet to ensure that we only scrape their data.
  readWhiteListedUsers(auth, self)
  {
    const sheets = google.sheets({version: 'v4', auth});
    var spreadsheetId = process.env.WHITELISTED_USERS_SHEET;

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
        rows.map((row) =>
        {
          inArray = false;
          for(var i = 0; i < self.whiteList.length; i++)
          {
            if(row[0] == self.whiteList[i])
            {
              inArray = true;
              break;
            }
          }
          if(!inArray)
          {
            self.whiteList[self.whiteList.length] = row[0];
          }
        });
      }
      else
      {
        console.log('No data found.');
        self.whiteList[0] = -1;
      }
    });
  }

  //Return whitelisted users.
  getWhiteListedUsers()
  {
    try{
    var content = process.env.GOOGLE_SHEETS_CREDENTIALS;
    var auth = this.authorize(JSON.parse(content));
    this.readWhiteListedUsers(auth, this);
    return this.whiteList;
    }
    catch (err) {
      console.log("OHNO");
    }
  }

  //Writes chatter to our chatlog google sheet.
  appendData(auth, chatter)
  {
    const whiteListedUsers = this.getWhiteListedUsers();
    var listed = false;
    for(var i = 0; i < whiteListedUsers.length; i++)
    {
      if(whiteListedUsers[i].toLowerCase() == chatter.username.toLowerCase())
      {
        listed = true;
        break;
      }
    }

    if(listed)
    {
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
        range: 'A1',
      }, (err, result) => {
        if (err) {
          // Handle error.
          console.log(err);
        } else {
        }
      });
    }
  }

  writeToChatLog(chatter)
  {
    try{
      var content = process.env.GOOGLE_SHEETS_CREDENTIALS;
      var auth = this.authorize(JSON.parse(content));
      this.appendData(auth, chatter);}
    catch(err){
      console.log('ohno');
    }
  }
}

module.exports = GoogSheet;
