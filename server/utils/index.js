const jwt = require('./jwt');
const auth = require('./auth');
const errorHandler = require('./errHandler');
const upload = require('./upload');

module.exports = {
    jwt,
    auth,
    errorHandler,
    upload
}