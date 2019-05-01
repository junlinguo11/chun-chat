const request = require('request');
const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../services').User;
const OnlineUser = require('../services').OnlineUser;

exports.getLoginUserInfo = async (req, res, next) => {
    try {
        let user = await User.getUserById(req.payload._id);
        res.json({isSuccess: true, user: user});
    } catch(err) {
        next(err);
    }
}

exports.createNewUser = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.mapped(), isSuccess: false});
    }

    // const recaptchaResponse = matchedData(req).recaptchaResponse;
    // const secretKey = '6Lfp0zEUAAAAAB-TSq-EkOlscUZC2co4nUtKf44S';
      //Verify URL
    // const verifyUrl = 'https://google.com/recaptcha/api/siteverify';
    // Make request to verify URL
    // request.post(verifyUrl, {
    //     secret: secretKey,
    //     response: recaptchaResponse,
    //     remoteip: req.connection.remoteAddress,
    // }, async (err, response, body) => {
    //     console.log(verifyUrl, err, response);
        // body = JSON.parse(body);
        // if(body.success === undefined || !body.success) {
        //     res.json({isSuccess: false, message: '请勾选reCAPTCHA验证'});
        // } else {
            const newUser = matchedData(req);

            if(newUser.gender === '男') {
                newUser.avatar = 'https://i.imgur.com/dLXPD2u.png'
            } else {
                newUser.avatar = 'https://i.imgur.com/u0xvKsl.png'
            }
            const user = new User(newUser);

            try {
                await user.createUser();
                res.json({isSuccess: true});
            } catch(err) {
                res.json({isSuccess: false});
            }
        // }
    // });
}

exports.loginStrategy = async function(username, password, done) {
    try {
        let user = await User.getUserByUsername(username);
        if(!user) {
            return done(null, false);
        } else {
            let isMatch = await User.comparePassword(password, user.password);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        }            
    } catch(err) {
        return done(null, false);
    }
}

exports.login = (req, res, next) => {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
        if(err) next(err);
        if(!user) {
            res.json({isSuccess: false, message:'用户名或密码不正确'});
        } else {
            try {
                let existUser = await OnlineUser.checkOnline(user._id);
                if(existUser) {
                    res.json({isSuccess: false, message:'用户在别处登录'});
                } else {
                    const onlineUser = new OnlineUser({user: user._id});
                    onlineUser.online();
                    const token = user.generateJwt();
                    res.cookie('awesome', token, {expires: new Date(Date.now() + 1000000000)});
                    res.status(200).json({token, isSuccess: true});
                }
            } catch(err) {
                next(err);
            }
        }
    })(req, res, next);
}

exports.updateAvatar = async (req, res, next) => {
    try {
        let newAvatar = await User.updateAvatar(req.payload._id, req.body.avatar);
        res.status(200).json({avatar: newAvatar, isSuccess: true});
    } catch(err) {
        next(err);
    }
}

exports.updateStatus = async (req, res, next) => {
    try {
        let newStatus = await User.updateStatus(req.payload._id, req.body.status);
        res.status(200).json({status: newStatus, isSuccess: true});
    } catch(err) {
        next(err);
    }
}

exports.getFriendsList = async (req, res, next) => {
    try {
        let user = await User.getFriendsList(req.payload._id);
        res.json({friends: user.friends});
    } catch(err) {
        next(err);
    }
}

exports.searchFriends = async (req, res, next) => {
    try {
        let users = await User.searchUsersByUsername(req.body.username);
        res.json({results: users});
    } catch(err) {
        next(err);
    }
}

exports.logout = async (req, res, next) => {
    try {
        await OnlineUser.offline(req.payload._id);
        res.json({isLogout: true});
    } catch(err) {
        next(err);
    }
}