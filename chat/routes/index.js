var express = require('express');
var router = express.Router();
const usermodel = require('./users');
const users = require('./users');

var passport = require('passport');
var localStrategy = require('passport-local');
passport.use(new localStrategy(users.authenticate()));

/* GET home page. */
router.get('/', isloggedIn, async function (req, res, next) {
  res.render('index', { title: 'Express', user: req.user });
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  var newUser = {
    //user data here
    username: req.body.username,
    contact: req.body.contact,
    //user data here
  };
  users
    .register(newUser, req.body.password)
    .then((result) => {
      passport.authenticate('local')(req, res, () => {
        //destination after user register
        res.redirect('/');
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
  (req, res, next) => { }
);

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/login');
    });
  else {
    res.redirect('/login');
  }
});

function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/login');
}

module.exports = router;
