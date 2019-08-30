const express = require('express');
const router = express.Router();
const db = require('../../mongodb/db');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const moment = require('moment');
const categoriesHelper = require('../../lib/categoriesHelper');
const constants = require('../../utils/constants');
const logger = require('../../lib/logger');
const sort = require('../../utils/sort');
const utils = require('../../utils/AdminUtils');

module.exports = router;

router.get('/getThumbTemplate', (req, res) => {
  const src = req.query.src;

  fs.readFile(path.join(req.config.VIEW_FOLDER,
    '/partials/admin/galery-thumb-element.handlebars'), 'utf8',
    function (err, content) {
      const template = handlebars.compile(content);
      res.write(template({ src: src }));
      res.end();
    });
});

router.get('/', function (req, res) {
  // Fetch trips
  db.Galery.find({ title: { $exists: true } }).sort({ order: 'desc' }).exec(
    function (err, galeries) {
      if (err) {
        console.log(err);
        return;
      }

      res.render('admin/list_galeries', {
        title: 'Manage Galeries',
        custom_js: 'admin/list-galeries.bundle',
        galeries: galeries,
        active: { list_galeries: true },
        body_scripts: 'list-galeries.bundle',
      });
    });

});

// modify galery
router.post('/modify', (req, res) => {
  if (!req.body.galeryId && !req.body.action) {
    res.json({ success: false, message: "Missing data" });
    return;
  }

  db.Galery.findOne({ _id: req.body.galeryId }, function (err, galery) {
    if (err) {
      res.json({ success: false, message: err.message });
      return;
    }
    if (!galery) {
      res.json({ success: false, message: "Galery does not exist" });
      return;
    }

    if (req.body.action === "setActive") {
      galery.isActive = true;
    } else if (req.body.action === "setInactive") {
      galery.isActive = false;
    } else {
      res.json({ success: false, message: "Nothing happened..." });
      return;
    }

    galery.save((err) => {
      if (err) {
        res.json({ success: false, message: err.message });
        return;
      }

      return res.json(
        { success: true, message: "Sucessfully set galery state to active" }
      );
    });
  });

});

// GET, create new galery
router.get('/new', function (req, res) {
  categoriesHelper.getLastCategories()
    .then((categories) => {
      res.render('admin/new_galery', {
        title: 'Create new galery',
        body_scripts: 'new-galery.bundle',
        categories,
        css: ['new-galery'],
      });
    })
    .catch((e) => {
      logger.error(e);
      res.render('admin/new_galery', {
        title: 'Create new galery',
        body_scripts: 'new-galery.bundle',
        css: ['new-galery'],
      });
    });

});

// POST, create new galery
router.post('/new', (req, res) => {

  db.Counter.findOne({ _id: 'galery' }, function (err, counter) {
    if (err) {
      return res.json({ success: false, message: err });
    }

    // Autoincrement of id
    if (!counter) {

      counter = new db.Counter({
        _id: "galery",
        seq: 0
      });
    }
    counter.seq++;
    counter.save((err) => {
      if (err) {
        return res.json({ success: false, message: err.message });
      }
      // create categories
      const { categories } = req.body;
      if (categories) {
        categoriesHelper.addCategories(categories);
      }

      // Create new galery
      const galery = new db.Galery({
        _id: counter.seq,
        title: req.body.title,
        description: req.body.description,
        dateOfPlay: new Date(req.body.date_of_play),
        createdOn: new Date(),
        location: req.body.location,
        author: req.body.author,
        director: req.body.director,
        tags: req.body.tags,
        categories: categories
      });

      galery.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }

        res.json({ success: true, galery_id: counter.seq });
      });

    });
  });
});

// Modify galery
router.get('/:id/modify', (req, res) => {

  db.Galery.findOne({ _id: req.params.id }).exec((err, galery) => {
    if (err) {
      throw err;
    }
    if (!galery) {
      return res.redirect('/admin');
    }

    // Sort them images
    galery.images.sort(utils.sort_by('sort'));

    if (galery.titlePicture) {

      // Find image that is title picture and assign isTitlePicture value
      galery.images.some((image) => {
        if (image.src === galery.titlePicture) {
          image.isTitlePicture = true;
          return true;
        }
        return false;
      });
    }

    const galeryObject = galery.toObject();
    // if (galeryObject.categories) {
    //   galeryObject.categories = galeryObject.categories.join(',');
    // }
    categoriesHelper.getLastCategories()
      .then((categories) => {
        res.render('admin/modify_galery', {
          title: 'Manage galery',
          galery: galeryObject,
          categories,
          body_scripts: 'modify-galery.bundle',
          active: { list_galeries: true },
          tags: constants.tags,
        });
      })
      .catch((e) => {
        logger.error(e);
        res.render('admin/modify_galery', {
          title: 'Manage galery',
          galery: galeryObject,
          body_scripts: 'modify-galery.bundle',
          active: { list_galeries: true },
          tags: constants.tags,
        });
      });

  });
});

router.post('/change-order/:id', (req, res) => {
  const { direction } = req.body;
  const id = req.params.id;

  db.Galery.findOne({_id: id}).exec((err, galery) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    sort(galery, db.Galery, direction === 'up')
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        return res.status(500).json({ success: false, message: err.message });
      })
  })

});

// POST, modify galery
router.post('/:id/modify', (req, res) => {
  db.Galery.findOne({ _id: req.params.id }, (err, galery) => {
    if (err) {
      res.json({ success: false, message: err.message });
      return;
    }
    if (!galery) {
      res.json({ success: false, message: "Galery does not exist!" });
      return;
    }

    const data = req.body;

    // SET TITLE PICTURE
    if (data.action === "setTitlePicture") {
      // Set title picture
      if (!data.titlePicture) {
        res.json({ success: false, message: "Title picture not found. " });
        return;
      }

      // create categories
      const { categories } = req.body;
      if (categories) {
        categoriesHelper.addCategories(categories);
      }

      db.Galery.findOneAndUpdate({ 'images.src': data.titlePicture },
        {
          '$set':
            { 'titlePicture': data.titlePicture }
        },
        { upsert: true }, (err, galery) => {
          if (err) {
            res.json({ success: false, message: err.message });
            return;
          }
          if (!galery) {
            return res.json({
              success: false,
              message: "Image does not exist in this galery!"
            });
          }
        });

      res.json({ success: true });
      return;
    }

    // UPDATE GALERY IMAGES
    else if (data.action === "updateGaleryImages") {

      if (data.formData == null || data.formData.length <= 0) {
        // formData is empty, do nothing
        return res.json(
          { success: true, message: "No data provided. Nothing happened." });
      }

      // Parse object from json data
      const imagesData = JSON.parse(data.formData);

      imagesData.forEach((imageData) => {
        galery.images.some((image) => {
          if (image.src === imageData.id) {
            // Update properties
            image.title = imageData.title;
            image.description = imageData.description;
            image.sort = imagesData.indexOf(imageData);

            return true;
          }
        });
      });

      galery.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
      });

      return res.json({ success: true });
    }

    // UPDATE GALERY INFO
    else if (data.action === "updateGaleryInfo") {
      if (data.formData == null || data.formData.length <= 0) {
        // formData is empty, do nothing
        return res.json(
          { success: true, message: "No data provided. Nothing happened." }
        );
      }

      // Parse object from json data
      const formData = JSON.parse(data.formData);

      // Iterate through data
      for (let key in formData) {
        if (galery[key] !== 'undefined') {
          galery[key] = formData[key]
        }
      }

      galery['dateOfPlay'] = new moment(formData.date_of_play).utc().format();

      galery.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
      });

      return res.json({ success: true });
    }

    return res.json({ success: false, message: "Nothing happened." });
  });
});

// Delete galery picture
router.post('/:id/deletePicture', (req, res) => {
  const postData = {
    galeryId: req.params.id,
    pictureId: req.body.id,
  };

  console.log(postData);

  if (!postData.pictureId) {
    return res.status(400).json();
  }

  db.Galery.findOne({ _id: postData.galeryId }, (err, galery) => {
    if (err) {
      return err;
    }

    galery.images = galery.images.filter((el) => {
      return el.src !== postData.pictureId;
    });

    var errors = {};
    // Delete uploaded files
    fs.unlink(
      path.join(req.config.UPLOAD_FOLDER, postData.pictureId),
      (err) => {
        if (err) {
          errors.original = err.message;
        }
      });
    fs.unlink(path.join(req.config.UPLOAD_FOLDER, 'thumbs', postData.pictureId),
      (err) => {
        if (err) {
          errors.thumb = err.message;
        }
      });

    galery.save((err) => {
      if (err) {
        return err;
      }

      res.status(200).json(errors);
    });

  });
});

// POST, set Favorite
router.post('/:id/setFavorite', (req, res) => {
  db.Galery.findOne({ _id: req.params.id }, (err, galery) => {
    if (err) {
      res.json({ success: false, message: err.message });
      return;
    }

    galery.isFavorite = true;
    galery.save((err) => {
      if (err) {
        res.json({ success: false, message: err.message });
        return;
      }

      res.json({ success: true })
    });
  });
});
router.post('/:id/unsetFavorite', (req, res) => {
  db.Galery.findOne({ _id: req.params.id }, (err, galery) => {
    if (err) {
      res.json({ success: false, message: err.message });
      return;
    }

    galery.isFavorite = false;
    galery.save((err) => {
      if (err) {
        res.json({ success: false, message: err.message });
        return;
      }

      res.json({ success: true })
    });
  });
});

const deleteImage = (dirname, filename) => {
  const taskPath = path.resolve(__dirname, '../../tasks/deleteImage.js');
  const childProcess = require('child_process').fork(taskPath);

  childProcess.on('message', (message) => {
    console.log(message);
  });
  childProcess.on('error', (error) => {
    console.error(error.stack)
  });
  childProcess.on('exit', () => {
    console.log(filename + ' done.');
  });

  if (filename) {
    childProcess.send({
      dirname: dirname,
      filename: filename
    });
  }
};

// POST, delete galery
router.post('/delete', (req, res) => {
  if (!req.body.id) {
    return res.status(400).json({ message: "Missing galery id." });
  }

  db.Galery.findOne({ _id: req.body.id }, (err, galery) => {
    if (err) {
      return res.json(err)
    }

    if (!galery) {
      return res.status(400).json({ message: "Galery does not exist!" });
    }

    galery.remove((err) => {
      if (err) {
        return res.json(err);
      }

      res.json({ success: true, message: "Galery deleted successfully!" });
    });

    // Delete associated images
    console.log(galery.images.length + " images to delete...");

    galery.images.forEach((image) => {
      const filename = image.src;

      // Call child process to delete image
      console.log("Deleting " + filename);
      deleteImage(req.config.UPLOAD_FOLDER, filename);
    });
  });
});
