var path = require('path');

var devEnc = require('./elneto-secret/development');
var stagingEnc = require('./elneto-secret/staging');
var prodEnc = require('./elneto-secret/production');

var development = {
  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || path.join(process.env.HOME, '/www/uploads/elneto'),
  DEBUG_LOG : true,
  DEBUG_WARN : true,
  DEBUG_ERROR : true,
  DEBUG_CLIENT : true,
  DB_PORT: '27017',
  DB_NAME: process.env.DB_NAME || "elneto_dev",
  USE_IMAGE_MAGICK : true,
  redis : {
    port: '6379'
  },
};

var staging = {
  UPLOAD_FOLDER: process.env.UPLOAD_FOLDER || path.join(process.env.HOME, '/www/uploads/elneto'),
  DEBUG_LOG : true,
  DEBUG_WARN : true,
  DEBUG_ERROR : true,
  DEBUG_CLIENT : true,
  DB_PORT: '27017',
  DB_NAME: process.env.DB_NAME || "elneto_dev",
  USE_IMAGE_MAGICK : true,
  redis : {
    port: '6379'
  },
};

var production = {
  UPLOAD_FOLDER: '/usr/local/share/uploads/elneto',
  DEBUG_LOG : false,
  DEBUG_WARN : false,
  DEBUG_ERROR : true,
  DEBUG_CLIENT : false,
  DB_PORT: '27017',
  DB_NAME: process.env.DB_NAME || (process.env.ELNETO_ENV == "dev") ? "elneto_dev" : "elneto",
  APP_PORT : 20082,
  redis : {
    port: '6379'
  },
  USE_IMAGE_MAGICK : true,
};

module.exports = function (env) {

  var config = {
    ROOT: __dirname,
    DB_HOST: 'localhost',
    VIEW_FOLDER: path.join(__dirname, 'views'),
    ENV: env,
  };

  switch(env){
    case "development": {
      Object.assign(config, development);
      if (devEnc) {
        Object.assign(config, devEnc);
      }
      break;
    }
    case "staging": {
      Object.assign(config, staging);
      if (stagingEnc) {
        Object.assign(config, stagingEnc);
      }
      break;
    }
    case "production": {
      Object.assign(config, production);
      if (prodEnc) {
        Object.assign(config, prodEnc);
      }
      break;
    }
    default:
      console.error("Environment not found.");
  }

  return config;
};
