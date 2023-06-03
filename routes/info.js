import express from 'express';

const router = express.Router();

router.get('/faq', function (req, res) {
  res.render('info/faq', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag,
  });
});

router.get('/featured', function (req, res) {
  res.render('info/featured', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag,
  });
});

router.get('/staff', function (req, res) {
  res.render('info/staff', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag,
  });
});

router.get('/aspirin', function (req, res) {
  res.render('info/aspirin', {
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag,
  });
});

export default router;