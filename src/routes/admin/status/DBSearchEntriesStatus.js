/**
 * Created by Henry Huang on 2020/8/4.
 */
const StatusItem = require('./StatusItem');
const db = require('../../../mongodb/db');

class DBSearchEntriesStatus extends StatusItem {
  constructor() {
    super("SearchEntries");
  }

  async getStatusInfo() {

    const ret = {
      name: this.name
    }
    try {
      const count = await db.SearchEntry.count().exec();
      Object.assign(ret, {
        status: 'SUCCESS',
        message: `DB\'s search entries count is ${count}`
      })
    } catch (e) {
      Object.assign(ret, {
        status: 'ERROR',
        message: e.message
      })
    }
    return ret;

  }

}

module.exports = DBSearchEntriesStatus
