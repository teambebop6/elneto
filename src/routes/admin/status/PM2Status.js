/**
 * Created by Henry Huang on 2020/8/5.
 */
const pm2 = require('pm2')
const StatusItem = require('./StatusItem');
class PM2Status extends StatusItem {

  constructor() {
    super('PM2');
  }

  async check() {

    const status = this;

    return new Promise((resolve) => {

      pm2.connect(err => {

        if (err) {
          status.status = 'ERROR';
          status.message = err.message;
          resolve(status)
        } else {
          pm2.list((err, list) => {
            pm2.disconnect();
            if (err) {
              status.status = 'ERROR';
              status.message = err.message;
              resolve(status)
            } else {
              status.status =  'SUCCESS';
              status.message = list;
              resolve(status)
            }
          })
        }
      })
    })
  }

}

module.exports = PM2Status


