/**
 * Created by Henry Huang on 2019/9/4.
 */
const logger = require('../lib/logger');
const db = require('../mongodb/db');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const archiver = require('archiver');
const rimraf = require('rimraf');

const fetchData = ({model, description}) => {

  logger.info(`Start backup ${model.collection.name}`);

  return new Promise((resolve, reject) => {
    model.find().exec((err, datas) => {
      if (err) {
        reject(err);
      }
      resolve({
        model,
        description,
        datas
      });
    })
  })
};

const persistDataAndCreateMeta = (folder, model, description, data) => {
  const collectionName = model.collection.name;
  logger.info(`Persist ${collectionName}`);
  const length = data.length;
  const filePath = path.join(folder, `${collectionName}.json`);
  fs.writeFileSync(filePath, new Buffer(JSON.stringify(data, null, 2)),
    { flag: 'a' });
  return {
    collectionName: model.collection.name,
    length,
    description,
    success: true,
    error: null
  }
};

module.exports = ({ UPLOAD_FOLDER }) => {

  logger.info(`Upload folder is ${UPLOAD_FOLDER}`);

  const modelInfos = [
    {
      model: db.Galery,
      description: 'Galeries'
    },
    {
      model: db.Poem,
      description: 'Poems'
    },
    {
      model: db.Cuadro,
      description: 'Cuadros'
    },
    {
      model: db.YonnyFoto,
      description: 'En Fotos'
    }
  ];

  return new Promise((resolve, reject) => {

    const promises = [];
    modelInfos.forEach((modelInfo) => {
      promises.push(fetchData(modelInfo));
    });

    Promise
      .all(promises)
      .then((results) => {

        const m = moment();
        const dateInfo = m.format('YYYY_MM_DD_HH_mm_ss');

        const backupBaseFolder = path.join(UPLOAD_FOLDER, 'db_backup');
        if (!fs.existsSync(backupBaseFolder)) {
          fs.mkdirSync(backupBaseFolder);
        }

        const backName = `backup-${dateInfo}`;
        const backupFolder = path.join(backupBaseFolder, backName);
        fs.mkdirSync(backupFolder);

        const backupZipFilePath = path.join(backupBaseFolder,
          `${backName}.zip`);
        const backupInfoMeta = {
          name: backName,
          creationDate: m,
          collections: [],
          backupZipFile: `${backName}.zip`,
          backupZipFilePath,
        };

        results.forEach(({ model, description, datas }) => {
          logger.info(`Print ${model.collection.name}...`);
          logger.info(JSON.stringify(datas));

          const modelPersistInfo = persistDataAndCreateMeta(backupFolder,
            model, description, datas);

          backupInfoMeta.collections.push(modelPersistInfo);
        });

        // make zip
        const output = fs.createWriteStream(backupZipFilePath);
        const archive = archiver('zip', {
          zlib: { level: 9 }
        });

        output.on('close', () => {
          logger.info(archive.pointer() + ' total bytes');
          logger.info(
            'Backup zip has been finalized and the output file descriptor has closed.');
          // remove backup temp folder
          rimraf(backupFolder, () => {
            resolve(backupInfoMeta);
          });
        });

        output.on('end', () => {
          console.log('Backup data has been drained');
        });

        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            logger.warn(err);
          } else {
            reject(err);
          }
        });

        archive.on('error', (err) => {
          reject(err);
        });

        archive.pipe(output);

        archive.append(new Buffer(JSON.stringify(backupInfoMeta, null, 2)), {
          name: 'metaInfo.json'
        });
        archive.directory(backupFolder, 'data');

        archive.finalize();

      })
      .catch((e) => {
        reject(e);
      })
  })

};
