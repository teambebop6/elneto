/**
 * Created by Henry Huang on 2020/8/4.
 */
class StatusItem {
  constructor(name) {
    this.name = name
    this.status = 'UNKNOWN'
    this.message = 'Waiting for check'
  }

  async check() {
    return this
  }

  getName() {
    return this.name
  }

  getStatus() {
    return this.status
  }

  getMessage() {
    return this.message
  }


}

module.exports = StatusItem;
