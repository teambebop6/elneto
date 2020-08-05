/**
 * Created by Henry Huang on 2020/8/4.
 */
const express = require('express');
const router = express.Router();
const DBSearchEntriesStatus = require('./status/DBSearchEntriesStatus');
const PM2Status = require('./status/PM2Status');


router.get('/', (req, res) => {
  const ps = []
  ps.push(new DBSearchEntriesStatus().check())
  ps.push(new PM2Status().check())
  Promise.all(ps).then((items) => {
    if (items) {
      return res.send(items.map(item => {
        return {
          name: item.getName(),
          status: item.getStatus(),
          message: item.getMessage()
        }
      }))
    }
    res.send({})
  })
})

module.exports = router;
