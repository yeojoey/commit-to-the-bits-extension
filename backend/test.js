require('dotenv').config();

const fs = require('fs');
const Hapi = require('hapi');
const path = require('path');
const Boom = require('boom');
const color = require('color');
const ext = require('commander');
const jsonwebtoken = require('jsonwebtoken');
const request = require('request');
const rp = require('request-promise');

const AcademicBot = require('./academicbot.js');
const GoogleSheetHandler = require('./googleSheetHandler.js');

const GoogSheet = new GoogleSheetHandler();
var stdin = process.openStdin();
stdin.on('data', chunk => {
  var c = GoogSheet.getWhiteListedUsers();
  console.log(c[0]);
  GoogSheet.lolMyGod("hi");
})
