/**
 * Created by Henry Huang on 2019-07-08.
 */
const express = require('express');
const router = express.Router();
const db = require('../../mongodb/db');
const logger = require('../../lib/logger');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const Cuadro = db.Cuadro;

router.get('/getThumbTemplate', (req, res, next) => {
  const link = req.query.link;

  if (!link) {
    return next();
  }

  fs.readFile(path.join(req.config.VIEW_FOLDER,
    '/partials/admin/cuadro-thumb-element.handlebars'), 'utf8',
    function (err, content) {
      const template = handlebars.compile(content);
      res.write(template({ link }));
      res.end();
    });
});

router.get('/modify/:id', (req, res, next) => {

  const { id } = req.params;
  logger.debug(`Load view for cuadro update with id = ${id}`);

  Cuadro.findOne({ _id: id }, (err, cuadro) => {
    if (err) {
      return next(err);
    }
    if (!cuadro) {
      return next(Error(`Cannot find cuadro with id = ${id}`));
    }

    res.render('admin/modify_cuadro', {
      title: 'Update cuadro',
      cuadro: Cuadro.toDTO(cuadro),
      body_scripts: 'modify-cuadro.bundle',
      active: { list_cuadros: true, modify: true },
    });

  });

});

router.get('/new', (req, res) => {
  res.render('admin/new_cuadro', {
    title: 'Create new cuadro',
    body_scripts: 'new-cuadro.bundle',
    active: { list_cuadros: true, create: true },
  });
});

router.get('/', (req, res) => {

  Cuadro.find({}).sort({ order: 'desc' }).exec((err, cuadros) => {
    if (err) {
      logger.info(err);
      return;
    }

    const cuadroObjects = cuadros.map((cuadro) => {
      const t = cuadro.toObject();
      t['creationDate'] = moment.utc(cuadro.creationDate).format();
      return t;
    });

    res.render('admin/list_cuadros', {
      title: 'Manage Cuadros',
      custom_js: 'admin/list-cuadros.bundle',
      cuadros: cuadroObjects,
      active: { list_cuadros: true },
      body_scripts: 'list-cuadros.bundle',
    });
  });

});

router.post('/modify/:id', (req, res) => {
  Cuadro.findOne({ _id: req.params.id }, (err, cuadro) => {
    if (err) {
      res.json({ success: false, message: err.message });
      return;
    }
    if (!cuadro) {
      res.json({ success: false, message: "Cuadro does not exist!" });
      return;
    }

    const data = req.body;

    // UPDATE Cuadro photos
    if (data.action === "updateCuadroPhotos") {

      if (data.formData == null || data.formData.length <= 0) {
        // formData is empty, do nothing
        return res.json({
          success: true, message: "No data provided. Nothing happened."
        });
      }

      // Parse object from json data
      const photosData = JSON.parse(data.formData);

      const photos = [];
      cuadro.photos.forEach((p) => {
        photosData.forEach( pd => {
          if (p.link === pd.id) {
            Object.assign(p, {
              title: pd.title
            });
            photos.push(p);
          }
        });
      });
      cuadro.photos = photos;

      cuadro.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
      });

      return res.json({ success: true });
    }

    // UPDATE CUADRO INFO
    else if (data.action === "updateCuadroInfo") {

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
        if (cuadro[key] !== 'undefined') {
          cuadro[key] = formData[key]
        }
      }

      cuadro.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
      });

      return res.json({ success: true });
    }

    return res.json({ success: false, message: "Nothing happened." });
  });
});

router.post('/change-order', (req, res) => {
  // TODO
});

router.post('/delete-photo/:id', (req, res) => {

  const postData = {
    cuadroId: req.params.id,
    photoId: req.body.id,
  };

  logger.debug(postData);

  if (!postData.photoId) {
    return res.status(400).json();
  }

  Cuadro.findOne({ _id: postData.cuadroId }, (err, cuadro) => {
    if (err) {
      return err;
    }

    if (cuadro.photos) {
      cuadro.photos = cuadro.photos.filter((el) => {
        return el.link !== postData.photoId;
      });
    }

    var errors = {};
    // Delete uploaded files
    fs.unlink(
      path.join(req.config.UPLOAD_FOLDER, postData.photoId),
      (err) => {
        if (err) {
          errors.original = err.message;
        }
      });
    fs.unlink(path.join(req.config.UPLOAD_FOLDER, 'thumbs', postData.photoId),
      (err) => {
        if (err) {
          errors.thumb = err.message;
        }
      });

    cuadro.save((err) => {
      if (err) {
        return err;
      }

      res.status(200).json(errors);
    });

  });
});

router.post('/', (req, res) => {

  const body = req.body;
  const { id } = body;

  if (id) {
    logger.debug(`update cuadro (id=${id}) ${JSON.stringify(body)}`);
  } else {
    logger.debug(`create cuadro ${JSON.stringify(body)}`);
  }

  try {
    Cuadro.validate(body);
  } catch (e) {
    return buildResponseAndReturn({
      res,
      error: e
    })
  }

  if (id) {
    // update

    updateCuadro(id, body)
      .then(() => buildResponseAndReturn({ res }))
      .catch((error) => buildResponseAndReturn({ res, error }));

  } else {
    // create

    db.Counter.findOne({ _id: 'cuadro' }, (error, counter) => {

      if (error) {
        return buildResponseAndReturn({
          res,
          error
        })
      }

      // Autoincrement of id
      if (!counter) {
        counter = new db.Counter({
          _id: "cuadro",
          seq: 0
        });
      }
      counter.seq++;
      counter.save((err) => {

        if (err) {
          return buildResponseAndReturn({
            res,
            error: err
          })
        }

        const now = new Date();
        const cuadro = new Cuadro({
          _id: counter.seq,
          title: body.title,
          visible: body.visible,
          order: now.getTime()
        });

        cuadro.save((err, { _doc: p }) => {
          if (err) {
            return buildResponseAndReturn({
              res,
              error: err
            })
          }
          return buildResponseAndReturn({ res, data: p });
        })
      })
    });

  }

});

router.delete('/', (req, res) => {

  if (!req.body.id) {
    return res.status(400).json({ message: "Missing cuadro id." });
  }

  Cuadro.findOne({ _id: req.body.id }, (err, cuadro) => {

    if (err) {
      return res.json(err)
    }

    if (!cuadro) {
      return res.status(400).json({ message: "Cuadro does not exist!" });
    }

    cuadro.remove((err) => {

      if (err) {
        return res.json(err);
      }

      res.json({ success: true, message: "Cuadro deleted successfully!" });
    });

    // Delete associated images
    logger.info(cuadro.photos.length + " photos to delete...");

    if (cuadro.photos) {
      cuadro.photos.forEach((photo) => {
        const filename = photo.link;

        // Call child process to delete image
        logger.info("Deleting " + filename);

        deleteImage(req.config.UPLOAD_FOLDER, filename);
      });
    }
  });
});

router.patch('/visible', (req, res) => {
  const { id, visible } = req.body;
  updateCuadro(id, { visible })
    .then(() => {
      return buildResponseAndReturn({ res })
    })
    .catch((e) => {
      return buildResponseAndReturn({ res, error: e })
    })
});

const deleteImage = (dirname, filename) => {

  const taskPath = path.resolve(__dirname, '../../tasks/deleteImage.js');
  const childProcess = require('child_process').fork(taskPath);

  childProcess.on('message', (message) => {
    logger.info(message);
  });
  childProcess.on('error', (error) => {
    logger.info(error.stack)
  });
  childProcess.on('exit', () => {
    logger.info(filename + ' done.');
  });

  if (filename) {
    childProcess.send({
      dirname: dirname,
      filename: filename
    });
  }
};

const buildResponseAndReturn = ({ res, data, error, module = Cuadro }) => {
  let code = error ? 400 : 200;
  if (error) {
    logger.error(error);
  }
  if (data && Array.isArray(data)) {
    data = data.map(d => module.toDTO(d));
  } else if (data) {
    data = module.toDTO(data);
  }
  return res.status(code).json({
    data: data || {},
    error: error ? error.message : null,
  })
};

const updateCuadro = (id, updateData) => {
  return new Promise((resolve, reject) => {
    Cuadro.findOne({ _id: id }).exec((err, cuadro) => {
      if (err) {
        reject(err);
      }
      if (!cuadro) {
        reject(new Error('Cuadro does not exist!'))
      }

      if (!updateData || updateData.length <= 0) {
        // formData is empty, do nothing
        reject(new Error('No data provided. Nothing happened.'));
      }

      // Cuadro object from json data

      // Iterate through data
      for (let key in updateData) {
        cuadro[key] = updateData[key]
      }

      cuadro.save((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  });
};

module.exports = router;
