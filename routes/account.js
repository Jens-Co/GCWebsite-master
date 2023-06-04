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

var getTitle = "GeyserConnect profile"
// logged in person
var getUsername
var getDiscordLinked
var getIsLinked
var getPlaytime
var getPremium
var getAdmin
var getBotName
// Target Person
var target = false
var tUsername
var tPlaytime
var tBotName
var tAdmin
var tPremium
var tXuid

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect('/auth/signin') // redirect to sign-in route
  }
  next()
}

router.get('/profile',
  isAuthenticated, // check if user is authenticated
  async function (req, res, next) {
    getUsername = req.session.xboxAccount?.gamertag
    const getDatabase = await getData()

    for (var i = 0; i < getDatabase.length; i++) {
      var person = getDatabase[i];
      if (person.NAME === getUsername) {
        getIsLinked = true
        getDiscordLinked = person.DISCORDID
        getPlaytime = person.DATE
        getPremium = person.PREMIUM
        getAdmin = person.ADMIN
        getBotName = person.BOTNAME
        break
      }
      else if (i === getDatabase.length - 1) {
        getDiscordLinked = false
        getIsLinked = false
        getPremium = false
        getPlaytime = "You have not used/joined any bots!"
        getAdmin = false
        getBotName = 'You have not used/joined any bots!'

      }
    }
    renderAccountPage(res, req, false)
  }
)

router.post('/playtimer', (req, res, next) => {
  isAuthenticated
  console.log("Renewed playtimer of " + getUsername)
  updateDateDB(getUsername)
  renderAccountPage(res, req, 'Your PlayTimer has been reset!')
})

router.post('/updatebot', (req, res, next) => {
  isAuthenticated
  updateBotDB(getUsername, req.body.method_select)
  getBotName = req.body.method_select
  renderAccountPage(res, req, 'Transfered your account to bot: ' + req.body.method_select)
})

router.post('/admin/premium', (req, res, next) => {
  isAuthenticated
  console.log("Added premium to " + req.body.input)
  updatePremiumDB(req.body.input)
  renderAccountPage(res, req, 'Made ' + req.body.input + ' a premium member!')
})

router.post('/admin/admin', (req, res, next) => {
  isAuthenticated
  console.log("Added admin to " + req.body.input)
  updateAdminDB(req.body.input)
  renderAccountPage(res, req, 'Made ' + req.body.input + ' administrator!')
})

router.post('/admin/playtimer', (req, res, next) => {
  isAuthenticated
  console.log("Renewed playtimer of " + req.body.input)
  updateDateDB(req.body.input);
  renderAccountPage(res, req, 'The PlayTimer has been reset from player ' + req.body.input + '!')
})

router.post('/admin/lookup', (req, res, next) => {
  isAuthenticated
  profileLookUpDB(req.body.input, res, req)
})

router.get('/discord/redirect', async function (req, res, next) {
  isAuthenticated
  const tokenURL = 'https://discord.com/api/oauth2/token'
  const params = {
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_SECRET,
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: process.env.APP_URL +`/account/discord/redirect`,
  }

  const OAuthResult = await fetch(tokenURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify(params),
  })
    .then((data) => data.json())
    .catch((err) => {
      console.log(err);
    })

  user = await fetch(`https://discord.com/api/users/@me`, {
    headers: {
      Authorization: `Bearer ${OAuthResult.access_token}`
    }
  })

  user = await user.json()

  if (user.id !== "undefined") {
    //updateDiscordIDDB(getUsername, user.id);
    renderAccountPage(res, req, + 'Your discord is now linked!')
    return
  }
  //updateDiscordIDDB(getUsername, user.id);
  renderAccountPage(res, req, + 'Something went wrong while linking your discord account.')
})

async function profileLookUpDB(gamertag, res, req) {
  var x = await profileLookUp(gamertag)
  if (x[0] === undefined || x[0] === null) {
    renderAccountPage(res, req, + gamertag + ' Was not found in our database!')
    return
  }
  target = true
  tUsername = x[0].NAME
  tXuid = x[0].XUID
  tPlaytime = x[0].DATE
  tAdmin = Boolean([0].ADMIN)
  tPremium = Boolean(x[0].PREMIUM)
  tBotName = x[0].BOTNAME
  renderAccountPage(res, req, false)
}

async function updateDateDB(gamertag) {
  await updateDate(gamertag)
}

async function updatePremiumDB(gamertag) {
  await updatePremium(gamertag)
}

async function updateAdminDB(gamertag) {
  await updateAdmin(gamertag)
}

async function updateBotDB(gamertag, input) {
  await updateBotName(gamertag, input)
}

async function updateDiscordIDDB(gamertag, id) {
  await updateDiscordID(gamertag, id)
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
    targetXuid: tXuid
  })
}

export default router;