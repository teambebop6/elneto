/**
 * Created by Henry Huang on 2019/9/7.
 */
const db = require('../mongodb/connect');
const RestoreDB = require('./RestoreDB');

const env = process.env.NODE_ENV || 'development';
console.log(`Env is ${env}`);

const filePath = process.argv[2];
console.log(`File path is ${filePath}`);

if (filePath) {
  const config = require('../config')(env);
  db.connect(config, env);

  RestoreDB(filePath)
    .then(() => {
      console.log('Done!');
    })
    .catch(console.error);
} else {
  console.log('Please provide file path.')
}

