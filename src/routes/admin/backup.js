const express = require('express');
const router = express.Router();
const fs = require('fs');
const rimraf = require('rimraf');
const StreamZip = require('node-stream-zip');
const db = require('../../mongodb/db');
const logger = require('../../lib/logger');
const dateUtils = require('../../utils/dateUtils');
const BackupDB = require('../../tasks/BackupDB');
const RestoreDB = require('../../tasks/RestoreDB');

module.exports = router;

const createBackup = (config, originalBackupName) => {

  if (originalBackupName && originalBackupName.startsWith('Automatic Backup')) {
    logger.info('Automatic backup file does not need create backup');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {

    BackupDB(config)
      .then((backupInfoMeta) => {

        logger.info('Created backup file');
        logger.info(JSON.stringify(backupInfoMeta, null, 2));

        db.Counter.findOne({ _id: 'backup' }, (error, counter) => {
          if (error) {
            logger.error(error);
            reject(error);
          }

          // Autoincrement of id
          if (!counter) {
            counter = new db.Counter({
              _id: "backup",
              seq: 0
            });
          }
          counter.seq++;
          counter.save((error) => {

            if (error) {
              logger.error(error);
              reject(error);
            }

            const backup = new db.Backup({
              _id: counter.seq,
              title: originalBackupName ? `Automatic Backup for ${originalBackupName}` : 'backup' + counter.seq,
              fileName: backupInfoMeta.backupZipFile,
              filePath: backupInfoMeta.backupZipFilePath,
              fileHash: backupInfoMeta.backupZipFile,
              creationDate: new Date()
            });

            backup.save((error) => {
              if (error) {
                logger.error(error);
                reject(error);
              }
              resolve();
            });
          });
        });
      })
      .catch((error) => {
        logger.error("Error when generate backup file", error);
        reject(error);
      });
  })
};

router.get('/', (req, res) => {

  db.Backup.find({}).sort({ creationDate: 'desc' }).exec((err, backups) => {
    if (err) {
      console.log(err);
      return;
    }

    const backupObjects = backups.map((backup) => {
      const t = backup.toObject();
      t.creationDate = dateUtils.format(backup.creationDate);
      if (t.lastRestoredDate) {
        t.lastRestoredDate = dateUtils.format(backup.lastRestoredDate);
      }
      return t;
    });

    res.render('admin/list_backups', {
      title: 'Manage Backups',
      custom_js: 'admin/list-backups.bundle',
      backups: backupObjects,
      active: { list_backups: true },
      body_scripts: 'list-backups.bundle',
    });
  });

});

// POST, create new backup
router.post('/new', (req, res) => {

  createBackup(req.config)
    .then(() => {
      res.status(200).json({});
    })
    .catch((error) => {
      res.status(500).send({
        error
      });
    });

});

// Download backup
router.get('/:id/download', (req, res) => {

  db.Backup.findOne({ _id: req.params.id }).exec((err, backup) => {
    if (err) {
      throw err;
    }
    if (!backup || !backup.filePath) {
      return res.redirect('/admin/backup');
    }
    if (!fs.existsSync(backup.filePath)) {
      logger.error(`File ${backup.filePath} is not existing`);
      return res.redirect('/admin/backup');
    }
    res.download(backup.filePath);
  });
});

router.get('/:id/restore', (req, res) => {

  const id = req.params.id;
  db.Backup.findOne({ _id: id }).exec((err, backup) => {
    if (err) {
      throw err;
    }
    if (!backup || !backup.filePath) {
      return res.redirect('/admin/backup');
    }
    if (!fs.existsSync(backup.filePath)) {
      logger.error(`File ${backup.filePath} is not existing`);
      return res.redirect('/admin/backup');
    }

    const zip = new StreamZip({
      file: backup.filePath,
      storeEntries: true
    });

    zip.on('ready', () => {
      const backupInfoMeta = {};
      for (const entry of Object.values(zip.entries())) {
        if (entry.name === 'metaInfo.json') {
          Object.assign(backupInfoMeta, JSON.parse(zip.entryDataSync(entry)));
          break;
        }
      }
      zip.close();
      Object.assign(backupInfoMeta, backup.toObject());
      res.render('admin/backup_restore', {
        title: 'Restore Backup',
        backupInfoMeta,
        id,
        active: { list_backups: true },
        body_scripts: 'restore-backup.bundle',
      });
    });
  });
});

router.post('/:id/restore', (req, res) => {

  const id = req.params.id;

  db.Backup.findOne({ _id: id }).exec((err, backup) => {

    if (err) {
      throw err;
    }
    if (!backup || !backup.filePath) {
      return res.redirect('/admin/backup');
    }
    if (!fs.existsSync(backup.filePath)) {
      logger.error(`File ${backup.filePath} is not existing`);
      return res.redirect('/admin/backup');
    }

    // create backup for current state
    const originalBackupName = backup.title;
    createBackup(req.config, originalBackupName)
      .then(() => {
        logger.info(`Create Automatic Backup for ${originalBackupName} done, then start restore`);
        RestoreDB(backup.filePath)
          .then(() => {
            backup.lastRestoredDate = Date();
            backup.save((error) => {
              if (error) {
                logger.error(error);
                // restore success, but save restore time failed, reply success response
              }
              return res.status(200).json({});
            });
          })
          .catch((error) => {
            return res.status(500).json({ success: false, error });
          });

      })
      .catch((error) => {
        res.status(500).send({
          error
        });
      });

  });
});

// POST, delete galery
router.post('/delete', (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ message: "Missing backup id." });
  }

  db.Backup.findOne({ _id: req.body.id }, (err, backup) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (!backup) {
      return res.status(400).json({ message: "Backup does not exist!" });
    }

    const filePath = backup.filePath;

    backup.remove((err) => {
      if (err) {
        return res.status(500).json(err);
      }
      if (filePath) {
        rimraf(filePath, () => {
          res.status(200).json(
            { success: true, message: "Backup deleted successfully!" });
        });
      } else {
        res.status(200).json(
          { success: true, message: "Backup deleted successfully!" });
      }
    });
  });
});
