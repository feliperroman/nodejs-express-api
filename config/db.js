require('dotenv').config();
const mongoose = require('mongoose');
const url = process.env.NODE_ENV === 'production' ? process.env.DATA_BASE_PROD : process.env.DATA_BASE;
module.exports = {
    connection: () => {
      mongoose.connect(url, {
        keepAlive: 'true',
        connectTimeoutMS: 30000,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex : true,
      }).catch(error => console.log(error, 'ERROR CONNECTION DB'));
    }
  };
