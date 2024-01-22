const fs = require("fs");

const uploadImage = function uploadImage(file, dest) {
    return new Promise(function (resolve, reject) {
      var extension = (file.mimetype).split("/");
      let type = extension[1]
      type = '.'+type
      fs.createReadStream('./uploads/' + file.filename).pipe(fs.createWriteStream('./public/files/' + dest + file.filename + type).on('finish', function (err) {
        fs.unlink('./uploads/' + file.filename, (err) => {
          reject(err);
        });
        if (err) {
          reject(err);
        } else {
  
          var path_img = {};
          path_img[file.fieldname] = 'files/' + dest + file.filename + type;
          resolve(path_img);
        }
      }));
    });
  }

  const uploadGallery = function uploadImage(file, dest) {
    return new Promise(function (resolve, reject) {
      var extension = (file.mimetype).split("/");
      let type = extension[1]
      type = '.'+type
      fs.createReadStream('./uploads/' + file.filename).pipe(fs.createWriteStream('./public/files/' + dest + file.filename + type).on('finish', function (err) {
        fs.unlink('./uploads/' + file.filename, (err) => {
          reject(err);
        });
        if (err) {
          reject(err);
        } else {
  
          var path_img = {};
          path_img[file.fieldname] = 'files/' + dest + file.filename + type;
          resolve(path_img);
        }
      }));
    });
  }


  
module.exports = {
    uploadImage,
    uploadGallery
  };