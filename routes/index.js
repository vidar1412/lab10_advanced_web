var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const userAccount = require("../models/user-account");
const passport = require("passport");
const socketio = require("socket.io");

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var userProfile;
var isLogin = false;


passport.use(
  new GoogleStrategy({
    clientID:
      "961892973481-8liek7sb224t5hv8hjnfcpom2a09g8e5.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/callback",
  },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);




router.get('/', function (req, res) {
  res.render('login')
})


router.get('/home', function (req, res) {
  if (!isLogin) {
    res.redirect('/');
  }
  res.render('chat', {user: userProfile})
})

router.get("/register", function (req, res) {
  res.render("register");
});

router.post("/register", function (req, res) {
  if (req.body.email && req.body.fullname && req.body.password) {
    const account = {
      fullName: req.body.fullname,
      email: req.body.email,
      password: req.body.password,
    };
    try {
      userAccount.create(account, function (err, account) {
        if (err) {
          console.log(err);
        }
        console.log(`Tạo tài khoản thành công`);
        return res.redirect("/");
      });
    } catch (err) {
      console.log(err);
    }
  }
});

router.post("/login", function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  userAccount.findOne({ email: email }).then((account) => {
    if (!account) {
      throw new Error("Không tìm thấy người dùng");
    }
    bcrypt.compare(password, account.password, function (err, result) {
      if (result) {
        req.session.username = email;
        isLogin = true;
        res.redirect("/home");
      } else {
        console.log(err);
        res.redirect("/");
      }
    });
  });
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  function (req, res) {
    isLogin = true;
    res.redirect("/home");
  }
);




module.exports = router;