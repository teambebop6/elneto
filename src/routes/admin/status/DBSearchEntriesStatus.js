/**
 * Created by Henry Huang on 2020/8/4.
 */
const StatusItem = require('./StatusItem');
const db = require('../../../mongodb/db');

class DBSearchEntriesStatus extends StatusItem {
  constructor() {
    super("SearchEntries");
  }

  async check() {
    try {
      const count = await db.SearchEntry.count().exec();
      this.status = 'SUCCESS'
      this.message = `DB\'s search entries count is ${count}`
    } catch (e) {
      this.status = 'ERROR'
      this.message = e.message
    }
    return this
  }

}

module.exports = DBSearchEntriesStatus
