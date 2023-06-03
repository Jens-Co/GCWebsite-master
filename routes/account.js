import express from 'express';
import { Router } from 'express';
import {
  connection,
  getData,
  updateDate,
  updatePremium,
  updateAdmin,
  updateBotName,
  updateDiscordID,
  profileLookUp
} from '../connection.js';

import dotenv from 'dotenv';
import axios from 'axios';
import querystring from 'querystring';

const router = Router();
dotenv.config();

let getTitle = "GeyserConnect profile";
// logged in person
let getUsername;
let getDiscordLinked;
let getIsLinked;
let getPlaytime;
let getPremium;
let getAdmin;
let getBotName;
// Target Person
let target = false;
let tUsername;
let tPlaytime;
let tBotName;
let tAdmin;
let tPremium;
let tXuid;

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect('/auth/signin'); // redirect to sign-in route
  }
  next();
}

router.get('/profile', isAuthenticated, async (req, res, next) => {
  getUsername = req.session.xboxAccount?.gamertag;
  const getDatabase = getData();

  for (let i = 0; i < getDatabase.length; i++) {
    const person = getDatabase[i];
    if (person.NAME === getUsername) {
      getIsLinked = true;
      getDiscordLinked = person.DISCORDID;
      getPlaytime = person.DATE;
      getPremium = person.PREMIUM;
      getAdmin = person.ADMIN;
      getBotName = person.BOTNAME;
      break;
    } else if (i === getDatabase.length - 1) {
      getDiscordLinked = false;
      getIsLinked = false;
      getPremium = false;
      getPlaytime = "You have not used/joined any bots!";
      getAdmin = false;
      getBotName = 'You have not used/joined any bots!';
    }
  }
  renderAccountPage(res, req, false);
});

router.post('/playtimer', (req, res, next) => {
  isAuthenticated(req, res, next); // Pass req, res, and next to isAuthenticated function
  console.log("Renewed playtimer of " + getUsername);
  updateDateDB(getUsername);
  renderAccountPage(res, req, 'Your PlayTimer has been reset!');
});

router.post('/updatebot', (req, res, next) => {
  isAuthenticated(req, res, next); // Pass req, res, and next to isAuthenticated function
  updateBotDB(getUsername, req.body.method_select);
  getBotName = req.body.method_select;
  renderAccountPage(res, req, 'Transferred your account to bot: ' + req.body.method_select);
});

router.post('/admin/premium', (req, res, next) => {
  isAuthenticated(req, res, next); // Pass req, res, and next to isAuthenticated function
  console.log("Added premium to " + req.body.input);
  updatePremiumDB(req.body.input);
  renderAccountPage(res, req, 'Made ' + req.body.input + ' a premium member!');
});

router.post('/admin/admin', (req, res, next) => {
  isAuthenticated(req, res, next); // Pass req, res, and next to isAuthenticated function
  console.log("Added admin to " + req.body.input);
  updateAdminDB(req.body.input);
  renderAccountPage(res, req, 'Made ' + req.body.input + ' an administrator!');
});

router.post('/admin/playtimer', (req, res, next) => {
  isAuthenticated(req, res, next); // Pass req, res, and next to isAuthenticated function
  console.log("Renewed playtimer of " + req.body.input);
  updateDateDB(req.body.input);
  renderAccountPage(res, req, 'The PlayTimer has been reset for player ' + req.body.input + '!');
});

router.post('/admin/lookup', (req, res, next) => {
  isAuthenticated(req, res, next); // Pass req, res, and next to isAuthenticated function
  profileLookUpDB(req.body.input, res, req);
});

router.get('/discord/redirect', async (req, res, next) => {
  isAuthenticated(req, res, next); // Pass req, res, and next to isAuthenticated function
  const tokenURL = 'https://discord.com/api/oauth2/token';
  const params = {
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_SECRET,
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.APP_URL + `/account/discord/redirect`,
  };

  try {
    const { data: OAuthResult } = await axios.post(tokenURL, querystring.stringify(params), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { data: user } = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${OAuthResult.access_token}`,
      },
    });

    if (user.id !== "undefined") {
      updateDiscordIDDB(getUsername, user.id);
      renderAccountPage(res, req, 'Your discord is now linked!');
      return;
    }
    updateDiscordIDDB(getUsername, user.id);
    renderAccountPage(res, req, 'Something went wrong while linking your discord account.');
  } catch (error) {
    console.log(error);
    renderAccountPage(res, req, 'An error occurred while linking your discord account.');
  }
});

async function profileLookUpDB(gamertag, res, req) {
  const x = profileLookUp(gamertag);
  if (x[0] === undefined || x[0] === null) {
    renderAccountPage(res, req, gamertag + ' was not found in our database!');
    return;
  }
  target = true;
  tUsername = x[0].NAME;
  tXuid = x[0].XUID;
  tPlaytime = x[0].DATE;
  tAdmin = Boolean([0].ADMIN);
  tPremium = Boolean(x[0].PREMIUM);
  tBotName = x[0].BOTNAME;
  renderAccountPage(res, req, false);
}

async function updateDateDB(gamertag) {
  updateDate(gamertag);
}

async function updatePremiumDB(gamertag) {
  updatePremium(gamertag);
}

async function updateAdminDB(gamertag) {
  updateAdmin(gamertag);
}

async function updateBotDB(gamertag, input) {
  updateBotName(gamertag, input);
}

async function updateDiscordIDDB(gamertag, id) {
  updateDiscordID(gamertag, id);
}

function renderAccountPage(res, req, feedback) {
  res.render('account', {
    isAuthenticated: req.session.isAuthenticated,
    alert: feedback,
    title: getTitle,
    username: getUsername,
    botName: getBotName,
    isLinked: getIsLinked,
    isDiscordLinked: getDiscordLinked,
    playtime: getPlaytime,
    premium: getPremium,
    admin: getAdmin,
    hasTarget: target,
    targetUsername: tUsername,
    targetPlaytime: tPlaytime,
    targetBotName: tBotName,
    targetPremium: tPremium,
    targetAdmin: tAdmin,
    targetXuid: tXuid,
  });
}

export default router;