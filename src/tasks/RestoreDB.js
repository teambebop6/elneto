/**
 * Created by Henry Huang on 2019/9/7.
 */
const logger = require('../lib/logger');
const db = require('../mongodb/db');
const StreamZip = require('node-stream-zip');

const modelMap = {
  cuados: db.Cuadro,
  galeries: db.Galery,
  poems: db.Poem,
  yonnyfotos: db.YonnyFoto,
};

const loadContent = (backupFilePath) => {
  return new Promise((resolve, reject) => {

    const zip = new StreamZip({
      file: backupFilePath,
      storeEntries: true
    });

    zip.on('ready', () => {
      const backupInfoMeta = {};
      const collections = {};
      for (const entry of Object.values(zip.entries())) {
        const entryName = entry.name;
        if (entryName === 'metaInfo.json') {
          Object.assign(backupInfoMeta, JSON.parse(zip.entryDataSync(entry)));
        } else if (entryName.startsWith('data/')) {
          const collectionName = entryName.substring(5, entryName.length - 5);
          collections[collectionName] = JSON.parse(zip.entryDataSync(entry));
        }
      }
      zip.close();
      resolve({
        backupInfoMeta,
        collections
      })
    });

    zip.on('error', reject);
  })
};

const restoreCollection = (collectionName, data) => {

  return new Promise((resolve, reject) => {

    logger.info(`Start restore ${collectionName}`);
    logger.info(JSON.stringify(data));

    const model = modelMap[collectionName];
    if (!model) {
      reject(`Cannot find model for collection ${collectionName}`);
    }

    model.find().exec((err, datas) => {
      if (err) {
        reject(err);
      }
      const _ids = datas.map(data => data._id);
      model.deleteMany({
        _id: {
          $in: _ids
        }
      }, (err) => {
        if (err) {
          reject(err);
        }
        // insert backup data
        model.insertMany(data, (err) => {
          if (err) {
            reject(err);
          }
          logger.info(`Finish restored ${collectionName}`);
          resolve();
        })
      })
    })
  });
};

module.exports = (backupFilePath) => {

  return new Promise((resolve, reject) => {
    loadContent(backupFilePath)
      .then((result) => {

        logger.info(JSON.stringify(result.backupInfoMeta), null, 2);

        const collectionInfos = result.backupInfoMeta.collections;
        const collectionToDesc = {};
        collectionInfos.forEach((ci) => {
          collectionToDesc[ci.collectionName] = ci.description;
        });

        const promises = [];
        if (result.collections) {
          Object.keys(collectionToDesc).forEach((collectionName) => {
            promises.push(restoreCollection(collectionName,
              result.collections[collectionName]));
          });
        }
        Promise
          .all(promises)
          .then(resolve)
          .catch(reject);
      })
      .catch(reject);
  })
};
