/**
 * Created by Henry Huang on 2019/6/27.
 */
var path = require('path');
var fs = require('fs');
var archiver = require('archiver');
var moment = require('moment');
var db = require('../mongodb/db');

function createBackupedFile(sourceDir, destDir, fileName) {

  return new Promise((resolve, reject) => {

    try {

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
      }

      var fileName = (fileName || moment().format('YYYY_MM_DD_HH_mm_ss_SSS'))
        + ".zip";
      var output = fs.createWriteStream(destDir + '/' + fileName);
      var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      console.log(fileName);

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log(
          'archiver has been finalized and the output file descriptor has closed.');
        resolve(fileName);
      });

      output.on('end', function () {
        console.log('Data has been drained');
      });

      archive.on('error', function (err) {
        console.error(err);
        reject(err);
      });

      archive.pipe(output);

      fs.readdirSync(sourceDir).forEach((imgFile) => {
        var stat = fs.statSync(sourceDir + '/' + imgFile);
        if (!stat.isDirectory() && path.extname(imgFile) !== '.zip') {
          archive.append(fs.createReadStream(sourceDir + '/' + imgFile),
            { name: imgFile });
        }
      });

      archive.finalize();

      console.log('after finalize')

    } catch (e) {
      reject(e);
    }
  });

}

function createBackupedFileAndSaveDB(sourceDir, destDir, fileName) {

  return new Promise((resolve, reject) => {

    db.Counter.findOne({ _id: 'backup' }, function (err, counter) {
      if (err) {
        reject(err);
      }

      // Autoincrement of id
      if (!counter) {

        counter = new db.Counter({
          _id: "backup",
          seq: 0
        });
      }
      counter.seq++;
      counter.save(function (err) {

        // Create new backup
        var backup = new db.Backup({
          _id: counter.seq,
          title: 'backup' + counter.seq,
          description: 'Backup of photos',
          creationDate: new Date()
        });

        createBackupedFile(sourceDir, destDir, fileName).then(
          (fileName) => {

            backup.fileName = fileName;
            backup.save(function (err) {
              if (err) {
                reject(err);
              }

              resolve(fileName)
            });

          }).catch((err) => {
          reject(err);
        });
      });
    });
  });

}

function deleteBackupedFile(dirname, filename) {

  if (dirname && filename && fs.existsSync(dirname + '/' + filename)) {

    var taskPath = path.resolve(__dirname, '../../tasks/deleteImage.js');
    var childProcess = require('child_process').fork(taskPath);

    childProcess.on('message', function (message) {
      console.log(message);
    });
    childProcess.on('error', function (error) {
      console.error(error.stack)
    });
    childProcess.on('exit', function () {
      console.log(filename + ' done.');
    });

    if (filename) {
      childProcess.send({
        dirname: dirname,
        filename: filename
      });
    }

  }

}

module.exports = {
  createBackupedFile,
  createBackupedFileAndSaveDB,
  deleteBackupedFile,
};
