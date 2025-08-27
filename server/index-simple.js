global.__basedir = __dirname;
require('dotenv').config()
const dbConnector = require('./config/db-simple');
const apiRouter = require('./router');
const cors = require('cors');
const { errorHandler } = require('./utils');

dbConnector.connect()
  .then(() => {
    const config = require('./config/config');

    const app = require('express')();
    require('./config/express')(app);

    app.use(cors({
      origin: config.origin,
      credentials: true
    }));

    app.use('/api', apiRouter);

    app.use(errorHandler);

    app.listen(config.port, console.log(`Listening on port ${config.port}!`));
  })
  .catch(console.error); 