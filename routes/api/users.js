'use strict';

/**
 * Module dependencies.
 */
const debug = require('debug')(process.env.APP_NAME + ':db');
const router = require('express').Router();
const User = require('../../models/user');

/**
 * GET: /api/users
 */
router.get('/', (req, res, next) => {
    const { _id, email, username } = req.query;
    const query = {};
    if (_id) query._id = _id;
    else if (email) query.email = email;
    else if (username) query.username = username;

    User.find(query, {
        _id: 0,
        name: 1,
        username: 1,
    }, (error, user) => {
        if (error) {
            debug('error find user', error)
            return res.status(500).json({});
        }
        res.json(user);
    });
});

/**
 * POST: /api/users
 */
router.post('/', (req, res, next) => {
    // try to save user
    new User(req.body).save((err, user) => {
        if (err) {
            // duplicate key error
            if (err.code === 11000) {

                // duplicate email
                if (/email/.test(err.errmsg)) {
                    return res.json({
                        success: false,
                        error: {
                            field: 'email',
                            text: 'Email already exists.'
                        }
                    });

                // duplicate username
                } else if (/username/.test(err.errmsg)) {
                    return res.json({
                        success: false,
                        error: {
                            field: 'username',
                            text: 'Username is taken.'
                        }
                    });
                }
            }

            // other error
            debug('error save user', err);
            return res.json({
                success: false,
                message: 'Server error, please try again.'
            });
        }

        // user successfully saved
        req.session.isAuthenticated = true;
        res.json({
            success: true,
            message: 'Account created!',
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                isAuthenticated: req.session.isAuthenticated
            }
        });
    });
});

/**
 * Export router.
 */
module.exports = router;
