const express = require('express');
const User = require("../models/user");
const Check = require("../models/checkU");
const bodyParser = require('body-parser');
const config = require('../config');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;

const FacebookStrategy = require('passport-facebook');

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get("/register", (req, res) => {
    res.render("register", { page_name : "auth"});
});

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    (req, res) => {
        res.redirect('/');
    }
);

router.post("/register", (req, res) => {
    let firstName = req.body.firstName;
    let = lastName = req.body.lastName;
    let password = req.body.password;
    let password2 = req.body.password2;
    let dateOfBirth = new Date(Number(req.body.year), Number(req.body.month) - 1, Number(req.body.day));
    let facebookName = req.body.facebook;
    let telegram;
    if (typeof req.body.telegram !== 'undefined') telegram = req.body.telegram;
    else telegram = "";
    
    User.findUser(firstName)
        .then(result => {
            if (Object.keys(result).length === 0) {
                if (password === password2) {
                    return User.insert(new User(firstName,
                        lastName,
                        password,
                        [],
                        Check.Role.Utilizer,
                        new Date(),
                        telegram,
                        "",
                        "https://res.cloudinary.com/studynodecloud/image/upload/v1542324391/user.png",
                        dateOfBirth,
                        facebookName,
                        ""
                    ));
                } else res.redirect("?error=password+mismatch");
            } else {
                res.redirect("?error=Username+already+exists");
            }
        })
        .then(() => res.redirect('login'))
        .catch(err => console.log(err));
});

router.get("/login", (req, res) => {
    res.render("login", { page_name : "auth"});
});

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.getById(id)
    .then(user =>  done(null, user))
    .catch(err => done(err));
});

passport.use(new LocalStrategy({ usernameField: "name", passwordField: 'password'}, (username, password, done) => {
    User.authorization(username, password)
    .then(result => done(null, result))
    .catch(err => done(err));
    
}));

passport.use(new FacebookStrategy({
        clientID: config.facebookAppId,
        clientSecret: config.facebookAppSecret,
        callbackURL: config.Facebook_callbackURL
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        console.log(profile.lastName);
        console.log(profile.firstName);
        User.findOrCreate(profile.id, profile.displayName)
        .then((user) => {
            return cb(null, user);
        })
        .catch((err) => {
            return cb(err, null);
        });
    }
));

passport.use(new BasicStrategy((username, password, done) => {
    User.authorization(username, password)
    .then(result => done(null, result))
    .catch(err => done(err));
    
}));

router.post("/login", passport.authenticate('local',
    {
        failureRedirect: '/auth/login',
    }), (req, res) => {
        res.redirect("/");
    });

router.get('/logout', Check.checkAuth, (req, res) => {
    req.logout();   
    res.redirect('/');
});

router.get("/profile", Check.checkAuth, (req, res) => {
    res.render("profile", { auth : req.user, courses : req.user.courses});
})

router.get("/update", Check.checkAuth, (req, res) => {
    User.getById(req.body.userId)
    .then(user => {
        User.updateWithoutHashing(user._id, new User(user.name,
            user.lastName,
            user.passport,
            user.courses,
            req.body.role,
            user.date,
            user.telegram,
            user.telegram_chat_id,
            user.avaUrl,
            user.dateOfBirth,
            user.facebookName,
            user.facebookId
        ));
        res.status(201).send("well done!");
    })
    .catch(err => res.status(404).send(err));
})

module.exports = {
    router,
    passport
};