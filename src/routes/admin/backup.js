var express = require('express');
var router = express.Router();
var db = require('../../mongodb/db');
var moment = require('moment');

var backupHelpers = require('../../lib/backupHelpers');

module.exports = router;

var createBackupedFile = backupHelpers.createBackupedFile;
var deleteBackupedFile = backupHelpers.deleteBackupedFile;

router.get('/', function (req, res) {

  db.Backup.find({}).sort({ creationDate: 'desc' }).exec(
    function (err, backups) {
      if (err) {
        console.log(err);
        return;
      }

      var backupObjects = backups.map(function (backup) {
        var t = backup.toObject();
        t['creationDate'] = moment.utc(backup.creationDate).format();
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

// GET, create new backup
router.get('/new', function (req, res) {
  res.render('admin/new_backup', {
    title: 'Create new backup',
    body_scripts: 'new-backup.bundle',
    active: { list_backups: true },
  });
});

// POST, create new backup
router.post('/new', function (req, res) {

  console.log('Trigger backup job at ' + new Date());
  backupHelpers.createBackupedFileAndSaveDB(
    req.config.UPLOAD_FOLDER,
    req.config.UPLOAD_FOLDER + '/backup'
  )
    .then((fileName) => {
      console.log("Generated backuped file " + fileName);
      res.status(200).send({})
    })
    .catch((error) => {
      console.error("Errror when generate backuped file", error);
      res.status(500).send({ error })
    })

});

// Modify backup
router.get('/:id/modify', function (req, res) {

  db.Backup.findOne({ _id: req.params.id }).exec(function (err, backup) {
    if (err) {
      throw err;
    }
    if (!backup) {
      return res.redirect('/admin');
    }

    res.render('admin/modify_backup', {
      title: 'Manage Backup',
      backup: backup,
      body_scripts: 'new-backup.bundle',
      active: { list_backups: true },
    });
  });
});

// Download backup
router.get('/:id/download', function (req, res) {

  db.Backup.findOne({ _id: req.params.id }).exec(function (err, backup) {
    if (err) {
      throw err;
    }
    if (!backup) {
      return res.redirect('/admin');
    }

    var fullPath = req.config.UPLOAD_FOLDER + '/backup/' + backup.fileName;
    res.download(fullPath);

  });
});

// POST, modify backup
router.post('/:id/modify', function (req, res) {
  db.Backup.findOne({ _id: req.params.id }, function (err, backup) {
    if (err) {
      res.json({ success: false, message: err.message });
      return;
    }
    if (!backup) {
      res.json({ success: false, message: "Backup does not exist!" });
      return;
    }

    var data = req.body;

    if (data.formData == null || data.formData.length <= 0) {
      // formData is empty, do nothing
      res.json(
        { success: true, message: "No data provided. Nothing happened." });
      return;
    }

    // Parse object from json data
    var formData = JSON.parse(data.formData);

    // Iterate through data
    for (var key in formData) {
      if (!backup[key]) {
        backup[key] = formData[key]
      }
    }

    backup.save(function (err) {
      if (err) {
        res.json({ success: false, message: err.message });
        return;
      }
      res.json({ success: true });
      return;
    });

  });
});

// POST, delete galery
router.post('/delete', function (req, res) {
  if (!req.body.id) {
    return res.status(400).json({ message: "Missing backup id." });
  }

  db.Backup.findOne({ _id: req.body.id }, function (err, backup) {
    if (err) {
      return res.json(err)
    }

    if (!backup) {
      return res.status(400).json({ message: "Backup does not exist!" });
    }

    var fileName = backup.fileName;

    backup.remove(function (err) {
      if (err) {
        return res.json(err);
      }

      res.json({ success: true, message: "Backup deleted successfully!" });
    });

    // Delete associated backuped file
    deleteBackupedFile(req.config.UPLOAD_FOLDER + '/backup', fileName);

  });

});
