const jwt = require('./jwt');
const { authCookieName } = require('../app-config');
const { users, tokens } = require('../config/db-simple');

function auth(redirectUnauthenticated = true) {

    return function (req, res, next) {
        const token = req.cookies[authCookieName] || '';
        
        if (!token) {
            if (!redirectUnauthenticated) {
                req.user = null;
                req.isLogged = false;
                next();
                return;
            }
            res.status(401).send({ message: "No token provided!" });
            return;
        }

        Promise.all([
            jwt.verifyToken(token),
            Promise.resolve(tokens.get(token))
        ])
            .then(([data, blacklistedToken]) => {
                if (blacklistedToken) {
                    return Promise.reject(new Error('blacklisted token'));
                }
                return Promise.resolve(users.get(data.id));
            })
            .then(user => {
                if (!user) {
                    return Promise.reject(new Error('User not found'));
                }
                req.user = user;
                req.isLogged = true;
                next();
            })
            .catch(err => {
                if (!redirectUnauthenticated) {
                    req.user = null;
                    req.isLogged = false;
                    next();
                    return;
                }
                if (['token expired', 'blacklisted token', 'jwt must be provided', 'User not found'].includes(err.message)) {
                    console.error('Auth error:', err.message);
                    res.status(401).send({ message: "Invalid token!" });
                    return;
                }
                next(err);
            });
    }
}

module.exports = auth;