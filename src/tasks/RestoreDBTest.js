/**
 * Created by Henry Huang on 2019/9/7.
 */
const env = 'development';
const config = require('../config')(env);
const db = require('../mongodb/connect');
db.connect(config, env);

const RestoreDB = require('./RestoreDB');

RestoreDB(
  "/Users/henry/www/uploads/elneto/db_backup/backup-2019_09_07_14_35_36.zip")
  .then(() => {
    console.log('Done!');
  })
  .catch(console.error);
