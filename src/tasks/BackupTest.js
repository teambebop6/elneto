/**
 * Created by Henry Huang on 2019/9/4.
 */
const env = 'development';
const config = require('../config')(env);
const db = require('../mongodb/connect');
db.connect(config, env);

const BackupDB = require('./BackupDB');

BackupDB(config)
  .then((backupInfoMeta) => {
    console.log(JSON.stringify(backupInfoMeta, null, 2));
    console.log('Done!');
  })
  .catch((error) => {
    console.info(error);
  });
