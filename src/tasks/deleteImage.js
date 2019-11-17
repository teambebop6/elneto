var gulp = require('gulp');
var path = require('path');
var fs = require('fs');

var deleteFile = function(path){
  return new Promise(function(resolve, reject){
    fs.unlink(path, function(err){
      if(err) { resolve(err); }
      else{
        resolve();
      }
    });
  });
};

// Delete image
function deleteGaleryImage(dir, filename) {
  // Delete galery image
  deleteFile(path.join(dir, filename)).then(function(err){
    var message;
    if(err){ message = err; }
    else{ message = "Successfully deleted image " + filename; }
    process.send(message);

    // Delete thumb
    deleteFile(path.join(dir, 'thumbs', filename)).then(function(err){
      if(err){ message = err; }
      else{ message = "Successfully deleted thumb " + filename; }
      process.send(message);

      process.exit();
    });
  });
}

process.on('message', function (data) {
  var stream = deleteGaleryImage(data.dirname, data.filename);
});

module.exports = {};
