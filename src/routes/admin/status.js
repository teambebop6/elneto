/**
 * Created by Henry Huang on 2020/8/4.
 */
const express = require('express');
const router = express.Router();
const DBSearchEntriesStatus = require('./status/DBSearchEntriesStatus');


router.get('/', (req, res) => {
  const ps = []
  ps.push(new DBSearchEntriesStatus().getStatusInfo())
  Promise.all(ps).then((infos) => {
    res.send(infos || {})
  })
})

module.exports = router;
