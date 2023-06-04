import express from 'express';
import msal from '@azure/msal-node';
import axios from 'axios';

import {
  msalConfig,
  REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI
} from '../authConfig.js';

const router = express.Router();
const msalInstance = new msal.ConfidentialClientApplication(msalConfig);
const cryptoProvider = new msal.CryptoProvider();

const host = process.env.APP_URL

async function redirectToAuthCodeUrl (req, res, next, authCodeUrlRequestParams, authCodeRequestParams) {
  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

  req.session.pkceCodes = {
    challengeMethod: 'S256',
    verifier: verifier,
    challenge: challenge
  };

  req.session.authCodeUrlRequest = {
    redirectUri: host + REDIRECT_URI,
    responseMode: 'form_post',
    codeChallenge: req.session.pkceCodes.challenge,
    codeChallengeMethod: req.session.pkceCodes.challengeMethod,
    ...authCodeUrlRequestParams
  };

  req.session.authCodeRequest = {
    redirectUri: host + REDIRECT_URI,
    code: '',
    ...authCodeRequestParams
  };

  try {
    const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(req.session.authCodeUrlRequest)
    res.redirect(authCodeUrlResponse);
  } catch (error) {
    next(error);
  }
}

async function getXboxAccount(accessToken) {
  const xboxAuth = await axios
    .post(
      'https://user.auth.xboxlive.com/user/authenticate',
      {
        Properties: {
          AuthMethod: 'RPS',
          SiteName: 'user.auth.xboxlive.com',
          RpsTicket: 'd=' + accessToken
        },
        RelyingParty: 'http://auth.xboxlive.com',
        TokenType: 'JWT'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );

  const xstsAuth = await axios
    .post(
      'https://xsts.auth.xboxlive.com/xsts/authorize',
      {
        Properties: {
          SandboxId: 'RETAIL',
          UserTokens: [xboxAuth.data.Token]
        },
        RelyingParty: 'http://xboxlive.com',
        TokenType: 'JWT'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );

  return {
    gamertag: xstsAuth.data.DisplayClaims.xui[0].gtg,
    xuid: xstsAuth.data.DisplayClaims.xui[0].xid
  };
}

router.get('/signin', async function (req, res, next) {
  req.session.csrfToken = cryptoProvider.createNewGuid();

  const state = cryptoProvider.base64Encode(
    JSON.stringify({
      csrfToken: req.session.csrfToken,
      redirectTo: '/'
    })
  );

  const authCodeUrlRequestParams = {
    state: state,
    scopes: ['XboxLive.signin']
  };

  const authCodeRequestParams = {
    scopes: ['XboxLive.signin']
  };

  return redirectToAuthCodeUrl(req, res, next, authCodeUrlRequestParams, authCodeRequestParams)
});

router.post('/redirect', async function (req, res, next) {
  if (req.body.state) {
    const state = JSON.parse(cryptoProvider.base64Decode(req.body.state));

    console.log(state, req.session.csrfToken);
    if (state.csrfToken === req.session.csrfToken) {
      req.session.authCodeRequest.code = req.body.code;
      req.session.authCodeRequest.codeVerifier = req.session.pkceCodes.verifier;

      try {
        const tokenResponse = await msalInstance.acquireTokenByCode(req.session.authCodeRequest);
        const xboxResponse = await getXboxAccount(tokenResponse.accessToken);
        req.session.xboxAccount = xboxResponse;
        req.session.accessToken = tokenResponse.accessToken;
        req.session.idToken = tokenResponse.idToken;
        req.session.account = tokenResponse.account;
        req.session.isAuthenticated = true;

        res.redirect(state.redirectTo);
      } catch (error) {
        next(error);
      }
    } else {
      next(new Error('csrf token does not match'));
    }
  } else {
    next(new Error('state is missing'));
  }
});

router.get('/signout', function (req, res) {
  const logoutUri = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${host + POST_LOGOUT_REDIRECT_URI}`;

  req.session.destroy(() => {
    res.redirect(logoutUri);
  });
});

export default router;