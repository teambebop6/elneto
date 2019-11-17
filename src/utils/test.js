/**
 * Created by Henry Huang on 2019/9/1.
 */
const fs = require('fs');
const RemoteUpload = require('./RemoteUpload');
const CONFIG = require('../config');

const config = CONFIG('development');

const fileName = "yonny/bg_stage.jpg";

const stream = fs.createReadStream(
  '/Users/henry/dev/workspace/github/elneto/public/images/bg_stage.jpg');

new RemoteUpload(config).upload({
  stream,
  fileName,
}).then((res) => {
  console.log(JSON.stringify(res, null, 2));
})
  .catch(console.error);
