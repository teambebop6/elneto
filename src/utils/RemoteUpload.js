/**
 * Created by Henry Huang on 2019/9/1.
 */
const AWS = require('aws-sdk');
const qiniu = require('qiniu');

const path = require('path');

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

const parseFileKey = (endPoint, bucket, url) => {
  let temp = url.substring(endPoint.length, url.length);
  const fileKey = temp.substring(bucket.length + 2, temp.length);
  return decodeURIComponent(fileKey);
};

class RemoteUpload {

  constructor({ REMOTE_UPLOAD: config, REMOTE_UPLOAD_AWS: configAWS, FORCE_AWS }) {
    if (FORCE_AWS) {
      this.init(configAWS);
    } else {
      this.init(config);
    }
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

      logger.info(`Uploading ${fileName} to ${this.type}`);

      if (this.type === 'qiniu') {
        this
          .uploadForQiniu({
            fileName: fileInfo.fileName,
            stream,
            mimeType
          })
          .then((urls) => {
            resolve(urls)
          })
          .catch(reject);
      } else {
        this.uploadForAWSS3({
          fileName: fileInfo.fileName,
          stream,
          mimeType
        })
          .then((urls) => {
            resolve(urls)
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

      this.S3.upload(params, (err) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          const fileNameEncoded = encodeURIComponent(fileName);
          resolve({
            url: `${this.endPoint}/${this.bucket}/${fileNameEncoded}`,
            thumbUrl: `${this.endPoint}/${this.bucket}-thumbs/${fileNameEncoded}`
          });
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
            logger.error(respErr);
            reject(respErr);
          }
          if (respInfo.statusCode === 200) {
            const url = `${this.endPoint}/${fileName}`;
            resolve({
              url,
              thumbUrl: url + '?imageView2/1/w/300/h/300'
            });
          } else {
            reject(respBody);
          }
        });
    })
  }

  remove({ fileUrls, thumbFileUrls }) {

    if (this.type === 'qiniu') {
      return this.removeForQiniu({ fileUrls, thumbFileUrls });
    } else {
      return this.removeForAWS({ fileUrls, thumbFileUrls });
    }

  }

  removeForAWS({ fileUrls, thumbFileUrls }) {

    const normalBucket = this.bucket;
    const thumbBucket = `${this.bucket}-thumbs`;

    const normalParams = {
      Bucket: normalBucket,
      Delete: {
        Objects: fileUrls.filter(url => url.startsWith('http')).map(
          (fileUrl) => {
            logger.info(`Will remove ${fileUrl}`);
            return {
              Key: parseFileKey(this.endPoint, normalBucket, fileUrl)
            }
          }),
        Quiet: true
      }
    };

    const thumbParams = {
      Bucket: thumbBucket,
      Delete: {
        Objects: thumbFileUrls.filter(url => url.startsWith('http')).map(
          (fileUrl) => {
            logger.info(`Will remove ${fileUrl}`);
            return {
              Key: parseFileKey(this.endPoint, thumbBucket, fileUrl)
            }
          }),
        Quiet: true
      }
    };

    return new Promise((resolve, reject) => {

      this.S3.deleteObjects(normalParams, (err) => {
        if (err) {
          logger.error(err);
          reject(err);
        } else {
          this.S3.deleteObjects(thumbParams, (err) => {
            if (err) {
              logger.error(err);
              reject(err);
            }
            resolve();
          })
        }
      });
    })

  }

  removeForQiniu({ fileUrls, thumbFileUrls }) {
    logger.info(fileUrls);
    logger.info(thumbFileUrls);
    logger.warn('Remove for Qiniu is not supported now.');
    return Promise.resolve();
  }

}

module.exports = RemoteUpload;
