/**
 * Created by Henry Huang on 2019/6/27.
 */
var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var moment = require('moment');

function createBackupedFile(sourceDir, destDir, excludes) {

  return new Promise((resolve, reject) => {

    try {

      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir);
      }

      var fileName = moment().format('YYYY_MM_DD_HH_mm_ss_SSS') + ".zip";
      var output = fs.createWriteStream(destDir + '/' + fileName);
      var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      console.log(fileName);

      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log(
          'archiver has been finalized and the output file descriptor has closed.');
        resolve(destDir + '/' + fileName);
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

var sourceDir = '/Users/henry/www/uploads/elneto/';
var destDir = '/Users/henry/www/uploads/elneto/backup';

createBackupedFile(sourceDir, destDir).then((fileName) => {
  console.log(fileName);
}).catch((error) => {
  console.error(error);
});
