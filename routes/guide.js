import express from 'express';

const router = express.Router();

router.get('/friendslist', function (req, res) {
  res.render('guides/friendslist', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag
  });
});

router.get('/xbox', function (req, res) {
  res.render('guides/xbox', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag
  });
});

router.get('/windows&mobile', function (req, res) {
  res.render('guides/windows&mobile', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag
  });
});

router.get('/switch', function (req, res) {
  res.render('guides/switch', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag
  });
});

router.get('/playstation', function (req, res) {
  res.render('guides/playstation', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag
  });
});

router.get('/outdated-server', function (req, res) {
  res.render('guides/outdated-server', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag
  });
});

export default router;