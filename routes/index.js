import express from 'express';

const router = express.Router();

router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Public GeyserConnect',
    isAuthenticated: req.session.isAuthenticated,
    username: req.session.xboxAccount?.gamertag,
  });
});

export default router;