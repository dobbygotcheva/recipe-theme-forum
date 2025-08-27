global.__basedir = __dirname;
require('dotenv').config()
const dbConnector = require('./config/db-simple');
// const mongoose = require('mongoose');
const apiRouter = require('./router');
const cors = require('cors');
// const config = require('./config/config');
const { errorHandler } = require('./utils');

// Initialize the persistent database
console.log('Simple persistent database connected.');

const config = require('./config/config');

const app = require('express')();
require('./config/express')(app);

app.use(cors({
  origin: config.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
}));

console.log('API Router loaded:', typeof apiRouter);
app.use('/api', apiRouter);
console.log('API routes registered at /api');

app.use(errorHandler);

app.listen(config.port, console.log(`Listening on port ${config.port}!`));