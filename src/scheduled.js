/**
 * Created by Henry Huang on 2019/6/27.
 */
var schedule = require('node-schedule');
var backupHelper = require('./lib/backupHelpers');

const scheduleBackupFiles = (config) => {

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

  // every Monday's 1 am
  var cron = '0 0 1 0 0 1';
  // var cron = '5 * * * * *';
  console.log('Schedule backup files job with cron expression ' + cron);
  schedule.scheduleJob(cron, function () {
    console.log('Trigger backup job at ' + new Date());
    backupHelper.createBackupedFileAndSaveDB(config.UPLOAD_FOLDER,
      config.UPLOAD_FOLDER + '/backup')
      .then((fileName) => {
        console.log("Generated backuped file " + fileName);
      })
      .catch((error) => {
        console.error("Errror when generate backuped file", error);
      })
  });
};

const startJobs = (config) => {
  scheduleBackupFiles(config);
};

module.exports = startJobs;
