import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import createError from 'http-errors';
import logger from 'morgan';

import indexRouter from './routes/index.js';
import accountRouter from './routes/account.js';
import authRouter from './routes/auth.js';
import guideRouter from './routes/guide.js';
import infoRouter from './routes/info.js';

const app = express();

app.use(cookieParser());
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  })
);

app.set('view engine', 'hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/auth', authRouter);
app.use('/guide', guideRouter);
app.use('/info', infoRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

console.log(process.env.APP_PORT + process.env.DBHOST)

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
  console.log('GeyserConnect Website Running!');
});