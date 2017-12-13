var devEnc = require('./elneto-secret/development');
var prodEnc = require('./elneto-secret/production');

var development = {
  DEBUG_LOG : true,
  DEBUG_WARN : true,
  DEBUG_ERROR : true,
  DEBUG_CLIENT : true,
  DB_PORT: '27017',
  DB_NAME: 'elneto_dev',
  USE_IMAGE_MAGICK : true,
  redis : {
    port: '6379'
  },
};

var production = {
  DEBUG_LOG : false,
  DEBUG_WARN : false,
  DEBUG_ERROR : true,
  DEBUG_CLIENT : false,
  DB_PORT: '27017',
  DB_NAME: 'elneto',
  APP_PORT : 20082,
  redis : {
    port: '6379'
  },
};

var config = {
  ROOT: __dirname,
  DB_HOST: 'localhost',
};

module.exports = function (env) {
  switch(env){
    case "development": {
      Object.assign(config, development);
      if (devEnc) {
        Object.assign(config, devEnc);
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
