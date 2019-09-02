/**
 * Created by Henry Huang on 2019/9/1.
 */
const AWS = require('aws-sdk');
const qiniu = require('qiniu');
const gm = require('gm');

const path = require('path');
const url = require('url');

const logger = require('../lib/logger');

const genFileInfo = (fileFullName) => {

  const rootPath = path.dirname(fileFullName);
  const baseName = path.basename(fileFullName);

  const bFileName = new Buffer(baseName).toString('base64') + '_'
    + (new Date().getMilliseconds());
  const fileExt = path.extname(baseName);

  const fileName = path.join(rootPath, bFileName + fileExt);
  return {
    fileName,
    fileExt
  }
};

class RemoteUpload {

  constructor({ REMOTE_UPLOAD: config }) {
    this.init(config);
  }

  init({ TYPE, END_POINT, ACCESS_KEY, SECRET_KEY, BUCKET }) {
    if (TYPE === 'qiniu') {
      const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
      const options = {
        scope: BUCKET,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
      };

      const putPolicy = new qiniu.rs.PutPolicy(options);
      this.uploadToken = putPolicy.uploadToken(mac);

      const qnConfig = new qiniu.conf.Config();
      this.formUploader = new qiniu.form_up.FormUploader(qnConfig);

    } else {
      AWS.config.update({
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY
      });
      this.S3 = new AWS.S3();
    }

    this.type = TYPE;
    this.endPoint = END_POINT;
    this.bucket = BUCKET;
  }

  upload({ fileName, stream, mimeType }) {

    const fileInfo = genFileInfo(fileName);

    return new Promise((resolve, reject) => {

      logger.info(`Uploading ${fileName}`);

      if (this.type === 'qiniu') {
        this
          .uploadForQiniu({
            fileName: fileInfo.fileName,
            stream,
            mimeType
          })
          .then((url) => {
            resolve({
              url,
              thumbUrl: url + '?imageView2/1/w/300/h/300'
            })
          })
          .catch(reject);
      } else {
        this.uploadForAWSS3({
          fileName: fileInfo.fileName,
          stream,
          mimeType
        })
          .then((url) => {
            resolve({
              url,
              thumbUrl: url + '?imageView2/1/w/300/h/300'
            })
          })
          .catch(reject);
      }
    })
  }

  uploadForAWSS3({ fileName, stream, mimeType }) {
    return new Promise((resolve, reject) => {

      const params = {
        Bucket: this.bucket,
        Key: fileName,
        Body: stream,
        ACL: 'public-read',
        ContentType: mimeType
      };

      this.S3.putObject(params, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(url.resolve(this.endPoint, fileName));
        }
      });

    })
  }

  uploadForQiniu({ fileName, stream }) {
    return new Promise((resolve, reject) => {
      const putExtra = new qiniu.form_up.PutExtra();

      this.formUploader.putStream(
        this.uploadToken,
        fileName,
        stream,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
          }
          if (respInfo.statusCode === 200) {
            resolve(url.resolve(this.endPoint, fileName));
          } else {
            reject(respBody);
          }
        });
    })
  }

  remove({ fileUrl, thumbFileUrl }) {
    // remove file
    // remove thumbFileUrl
    return new Promise((resolve, reject) => {
      // TODO
      logger.info(`Deleting ${fileUrl}`);
      logger.info(`Deleting ${thumbFileUrl}`);
      resolve();
    })
  }

  removeForAWS({ fileUrl, thumbFile }) {

  }

  removeForQiniu({ fileUrl, thumbFile }) {

  }

}

module.exports = RemoteUpload;
