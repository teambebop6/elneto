const express = require('express');
const router = express.Router();
const db = require('../../mongodb/db');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const constants = require('../../utils/constants');
const dateUtils = require('../../utils/dateUtils');
const logger = require('../../lib/logger');
const sort = require('../../utils/sort');
const RemoteUpload = require('../../utils/RemoteUpload');
const utils = require('../../utils/AdminUtils');

module.exports = router;

const mergeImageInfo = (pre, { title, size, technik, comments }) => {
  Object.assign(pre, {
    title,
    comments: comments ? comments.trim() : null
  });
};

const reCreateIndex = () => {

  logger.info("start re-create index for galery at backend ...");
  db.Galery.collection.dropIndexes();

  db.Galery.collection.createIndex({
    "$**": "text"
  }, {
    default_language: 'spanish',
    background: true
  }, (err) => {
    if (err) {
      logger.error("re-create index for galery collection failed");
      logger.error(err);
    }
  });
};

router.get('/getThumbTemplate', (req, res) => {
  const link = req.query.link;
  const id = req.query.id;

  fs.readFile(path.join(req.config.VIEW_FOLDER,
    '/partials/admin/galery-thumb-element.handlebars'), 'utf8',
    function (err, content) {
      const template = handlebars.compile(content);
      res.write(template({
        link,
        id
      }));
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

      reCreateIndex();

      return res.json(
        { success: true, message: "Sucessfully set galery state to active" }
      );
    });
  });

});

// GET, create new galery
router.get('/new', function (req, res) {

  res.render('admin/new_galery', {
    title: 'Create new galery',
    body_scripts: 'new-galery.bundle',
    active: { list_galeries: true },
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

      // Create new galery
      const galery = new db.Galery({
        _id: counter.seq,
        title: req.body.title,
        description: req.body.description,
        dateOfPlay: dateUtils.parse(req.body.date_of_play, 'DD/MM/YYYY'),
        createdOn: new Date(),
        location: req.body.location,
        author: req.body.author,
        director: req.body.director,
        tags: req.body.tags,
      });

      galery.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }

        reCreateIndex();

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

    const galeryObject = galery.toObject();

    if (galery.titlePicture) {

      // Find image that is title picture and assign isTitlePicture value
      galeryObject.images.some((image) => {
        if (image.link === galery.titlePicture) {
          image.isTitlePicture = true;
          return true;
        }
        return false;
      });
    }

    res.render('admin/modify_galery', {
      title: 'Manage galery',
      galery: galeryObject,
      body_scripts: 'modify-galery.bundle',
      active: { list_galeries: true },
      tags: constants.tags,
    });
  });
});

router.post('/change-order/:id', (req, res) => {
  const { direction } = req.body;
  const id = req.params.id;

  db.Galery.findOne({ _id: id }).exec((err, galery) => {
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
      if (!data.titlePictureId) {
        res.json({ success: false, message: "Title picture not found. " });
        return;
      }

      galery.images.forEach((image) => {
        if (image.id === data.titlePictureId) {
          galery.titlePicture = image.link;
        }
      });

      galery.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
        return res.json({ success: true });
      });

    } else if (data.action === "updateGaleryImages") {

      if (data.formData == null || data.formData.length <= 0) {
        // formData is empty, do nothing
        return res.json(
          { success: true, message: "No data provided. Nothing happened." });
      }

      // Parse object from json data
      const imagesData = JSON.parse(data.formData);
      const images = [];
      imagesData.forEach(pd => {
        galery.images.forEach((p) => {
          if (p.id === pd.id) {
            mergeImageInfo(p, pd);
            images.push(p);
          }
        });
      });
      galery.images = images;

      if (!galery.titlePicture && images[0]) {
        galery.titlePicture = images[0].link
      }

      galery.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
        reCreateIndex();
        return res.json({ success: true });
      });

    } else if (data.action === "updateGaleryInfo") {
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

      galery['dateOfPlay'] = dateUtils.parse(formData.date_of_play,
        'DD/MM/YYYY');

      galery.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
        setTimeout(() => {
          reCreateIndex();
        }, 2000);
        return res.json({ success: true });
      });
    }

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

    const fileUrls = [];
    const thumbUrls = [];
    galery.images = galery.images.filter((el) => {
      if (el.id === postData.pictureId) {
        fileUrls.push(el.link);
        thumbUrls.push(el.linkThumb);
      }
      return el.id !== postData.pictureId;
    });

    deleteImage2(req.config, fileUrls, thumbUrls);

    galery.save((err) => {
      if (err) {
        return err;
      }
      reCreateIndex();
      res.status(200).json({});
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

const deleteImage2 = (config, fileUrls, thumbFileUrls) => {
  new RemoteUpload(config)
    .remove({
      fileUrls,
      thumbFileUrls,
    })
    .then(() => {
      logger.info(`Deleted ${JSON.stringify(fileUrls)}`);
      logger.info(`Deleted ${JSON.stringify(thumbFileUrls)}`);
    })
    .catch(logger.error)
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
      reCreateIndex();
      res.json({ success: true, message: "Galery deleted successfully!" });
    });

    // Delete associated images
    console.log(galery.images.length + " images to delete...");

    if (galery.images) {
      const fileUrls = [];
      const thumbFileUrls = [];
      galery.images.forEach((photo) => {
        fileUrls.push(photo.link);
        thumbFileUrls.push(photo.linkThumb);
      });
      deleteImage2(req.config, fileUrls, thumbFileUrls)
    }
  });
});
