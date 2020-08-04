/**
 * Created by Henry Huang on 2020/8/4.
 */
class StatusItem {
  constructor(name) {
    this.name = name
  }
  async getStatusInfo() {
    return {
      status: 'NORMAL',
      message: 'No message'
    }
  }
}

module.exports = StatusItem;
