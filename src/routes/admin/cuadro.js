/**
 * Created by Henry Huang on 2019-07-08.
 */
const express = require('express');
const router = express.Router();
const db = require('../../mongodb/db');
const logger = require('../../lib/logger');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const sort = require('../../utils/sort');
const RemoteUpload = require('../../utils/RemoteUpload');
const dateUtils = require('../../utils/dateUtils');

const Cuadro = db.Cuadro;
const YonnyFoto = db.YonnyFoto;

const reCreateIndex = (model) => {

  logger.info(
    `start re-create index for ${model.collection.name} at backend ...`);

  setTimeout(() => {
    model.collection.dropIndexes();

    model.collection.createIndex({
      "$**": "text"
    }, {
      default_language: 'spanish',
      background: true
    }, (err) => {
      if (err) {
        logger.error(
          `re-create index for ${model.collection.name} collection failed`);
        logger.error(err);
      }
    });
  }, 2000)

};

const getType = (req) => {

  if (req.query.m) {
    return req.query.m;
  }

  if (req.baseUrl === '/admin/cuadros') {
    return 'c';
  } else if (req.baseUrl === '/admin/yonny-fotos') {
    return 'yf';
  }

  return null;

};

const model = (name) => {
  if (name === 'c') {
    return Cuadro;
  } else if (name === 'yf') {
    return YonnyFoto;
  }
};

const active = (m, other) => {
  const active = {
    [m === 'c' ? 'list_cuadros' : 'list_yonny_fotos']: true,
  };
  if (other) {
    Object.assign(active, other);
  }
  return active;
};

const str = (m, c, yf) => {
  return m === 'c' ? c : yf;
};

const mergePhotoInfo = (pre, { title, size, technik, comments }) => {
  Object.assign(pre, {
    title,
    size,
    technik,
    comments: comments ? comments.trim() : null
  });
};

router.get('/getThumbTemplate', (req, res, next) => {
  const link = req.query.link;
  const id = req.query.id;
  const m = getType(req) || 'c';

  if (!link) {
    return next();
  }

  const file = m === 'c' ? '/partials/admin/cuadro-thumb-element.handlebars'
    : '/partials/admin/yonny-foto-thumb-element.handlebars';
  fs.readFile(path.join(req.config.VIEW_FOLDER, file), 'utf8',
    function (err, content) {
      const template = handlebars.compile(content);
      res.write(template({
        id,
        link,
      }));
      res.end();
    });
});

router.get('/modify/:id', (req, res, next) => {

  const { id } = req.params;
  const m = getType(req) || 'c';

  logger.debug(`Load view for item update with id = ${id} with model ${m}`);

  model(m).findOne({ _id: id }, (err, item) => {
    if (err) {
      return next(err);
    }
    if (!item) {
      return next(Error(`Cannot find item with id = ${id}`));
    }

    const dto = model(m).toDTO(item);

    res.render(str(m, 'admin/modify_cuadro', 'admin/modify_yonny_foto'), {
      title: str(m, 'Update cuadro', 'Update Yonny Foto'),
      [m === 'c' ? 'cuadro' : 'yonnyFoto']: dto,
      body_scripts: str(m, 'modify-cuadro.bundle', 'modify-yonny-foto.bundle'),
      active: active(m, {
        modify: true
      }),
    });

  });
});

router.get('/new', (req, res) => {

  const m = getType(req) || 'c';

  res.render(str(m, 'admin/new_cuadro', 'admin/new_yonny_foto'), {
    title: str(m, 'Create new cuadro', 'Create new Yonny Foto'),
    body_scripts: str(m, 'new-cuadro.bundle', 'new-yonny-foto.bundle'),
    active: active(m, {
      create: true
    }),
  });
});

router.get('/', (req, res) => {

  const m = getType(req) || 'c';

  model(m).find({}).sort({ order: 'desc' }).exec((err, items) => {
    if (err) {
      logger.info(err);
      return;
    }

    const itemObjects = items.map((item) => {
      const t = item.toObject();
      t['creationDate'] = dateUtils.format(item.creationDate);
      return t;
    });

    res.render(str(m, 'admin/list_cuadros', 'admin/list_yonny_fotos'), {
      title: str(m, 'Manage Cuadros', 'Manage Yonny Fotos'),
      [m === 'c' ? 'cuadros' : 'yonnyFotos']: items,
      active: active(m),
      body_scripts: str(m, 'list-cuadros.bundle', 'list-yonny-fotos.bundle')
    });
  });

});

router.post('/modify/:id', (req, res) => {

  const m = getType(req) || 'c';
  const module = model(m);
  module.findOne({ _id: req.params.id }, (err, item) => {
    if (err) {
      res.json({ success: false, message: err.message });
      return;
    }
    if (!item) {
      res.json({ success: false, message: "Item does not exist!" });
      return;
    }

    const data = req.body;

    // UPDATE Cuadro photos
    if (data.action === "updateCuadroPhotos" || data.action
      === "updateYonnyFotoPhotos") {

      if (data.formData == null || data.formData.length <= 0) {
        // formData is empty, do nothing
        return res.json({
          success: true, message: "No data provided. Nothing happened."
        });
      }

      // Parse object from json data
      const photosData = JSON.parse(data.formData);

      const photos = [];
      photosData.forEach(pd => {
        item.photos.forEach((p) => {
          if (p.id === pd.id) {
            mergePhotoInfo(p, pd);
            photos.push(p);
          }
        });
      });
      item.photos = photos;

      item.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }

        reCreateIndex(module);
      });

      return res.json({ success: true });
    }

    // UPDATE CUADRO INFO
    else if (data.action === "updateCuadroInfo" || data.action
      === "updateYonnyFotoInfo") {

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
        if (item[key] !== 'undefined') {
          item[key] = formData[key]
        }
      }

      item.save((err) => {
        if (err) {
          return res.json({ success: false, message: err.message });
        }
        reCreateIndex(module);
      });

      return res.json({ success: true });
    }

    return res.json({ success: false, message: "Nothing happened." });
  });
});

router.post('/change-order/:id', (req, res) => {

  const m = getType(req) || 'c';

  const { direction } = req.body;
  const id = req.params.id;

  model(m).findOne({ _id: id }).exec((err, item) => {
    if (err) {
      return res.json({ success: false, message: err.message });
    }
    sort(item, model(m), direction === 'up')
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        return res.status(500).json({ success: false, message: err.message });
      })
  })

});

router.post('/delete-photo/:id', (req, res) => {

  const m = getType(req) || 'c';

  const itemId = req.params.id;
  const postData = {
    [m === 'c' ? 'cuadroId' : 'yonnyFotoId']: itemId,
    photoId: req.body.id,
  };

  logger.debug(postData);

  if (!postData.photoId) {
    return res.status(400).json();
  }
  const module = model(m);

  module.findOne({ _id: itemId }, (err, item) => {
    if (err) {
      return err;
    }

    let photoToRemove = null;
    if (item.photos) {
      item.photos = item.photos.filter((el) => {
        if (el.id === postData.photoId) {
          photoToRemove = el;
        }
        return el.id !== postData.photoId;
      });
    }

    if (photoToRemove) {
      deleteImage2(req.config, [photoToRemove.link], [photoToRemove.linkThumb]);
    }
    item.save((err) => {
      if (err) {
        return err;
      }
      reCreateIndex(module);
      res.status(200).json({});
    });
  });
});

router.post('/', (req, res) => {

  const m = getType(req) || 'c';
  const module = model(m);

  const body = req.body;
  const { id } = body;

  if (id) {
    logger.debug(`update item (id=${id}, m=${m}) ${JSON.stringify(body)}`);
  } else {
    logger.debug(`create item (m=${m}) ${JSON.stringify(body)}`);
  }

  try {
    module.validate(body);
  } catch (e) {
    return buildResponseAndReturn({
      res,
      error: e,
      module
    })
  }

  if (id) {
    // update

    updateItem(id, body, module)
      .then(() => buildResponseAndReturn({ res, module }))
      .catch((error) => buildResponseAndReturn({ res, error, module }));

  } else {
    // create

    const _id = m === 'c' ? 'cuadro' : 'yonnyFoto';

    db.Counter.findOne({ _id }, (error, counter) => {

      if (error) {
        return buildResponseAndReturn({
          res,
          error,
          module
        })
      }

      // Autoincrement of id
      if (!counter) {
        counter = new db.Counter({
          _id,
          seq: 0
        });
      }
      counter.seq++;
      counter.save((err) => {

        if (err) {
          return buildResponseAndReturn({
            res,
            error: err,
            module
          })
        }

        const now = new Date();
        const item = new module({
          _id: counter.seq,
          title: body.title,
          visible: body.visible,
          order: now.getTime()
        });

        item.save((err, { _doc: p }) => {
          if (err) {
            return buildResponseAndReturn({
              res,
              error: err,
              module
            })
          }
          reCreateIndex(module);
          return buildResponseAndReturn({
            res,
            data: p,
            module
          });
        })
      })
    });
  }
});

router.delete('/', (req, res) => {

  const m = getType(req) || 'c';
  const module = model(m);

  if (!req.body.id) {
    return res.status(400).json({ message: "Missing cuadro id." });
  }

  module.findOne({ _id: req.body.id }, (err, item) => {

    if (err) {
      return res.json(err)
    }

    if (!item) {
      return res.status(400).json({ message: "Item does not exist!" });
    }

    item.remove((err) => {

      if (err) {
        return res.status(500).json(err);
      }

      reCreateIndex(module);

      res.status(200).json(
        { success: true, message: "Item deleted successfully!" });
    });

    // Delete associated images
    logger.info(item.photos.length + " photos to delete...");

    if (item.photos) {
      const fileUrls = [];
      const thumbFileUrls = [];
      item.photos.forEach((photo) => {
        fileUrls.push(photo.link);
        thumbFileUrls.push(photo.linkThumb);
      });
      deleteImage2(req.config, fileUrls, thumbFileUrls)
    }
  });
});

router.patch('/visible', (req, res) => {

  const m = getType(req) || 'c';
  const module = model(m);

  const { id, visible } = req.body;
  updateItem(id, { visible }, module)
    .then(() => {
      return buildResponseAndReturn({
        res,
        module
      })
    })
    .catch((e) => {
      return buildResponseAndReturn({
        res,
        error: e,
        module
      })
    })
});

const deleteImage2 = (config, fileUrls, thumbFileUrls) => {
  logger.info(`Deleting at backend: ${JSON.stringify(fileUrls)}`);
  logger.info(`Deleting at backend:  ${JSON.stringify(thumbFileUrls)}`);
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

const updateItem = (id, updateData, model) => {
  return new Promise((resolve, reject) => {
    model.findOne({ _id: id }).exec((err, item) => {

      if (err) {
        reject(err);
      }
      if (!item) {
        reject(new Error('Item does not exist!'))
      }

      if (!updateData || updateData.length <= 0) {
        // formData is empty, do nothing
        reject(new Error('No data provided. Nothing happened.'));
      }

      // Item object from json data

      // Iterate through data
      for (let key in updateData) {
        item[key] = updateData[key]
      }

      item.save((err) => {
        if (err) {
          reject(err);
        }
        reCreateIndex(model);
        resolve();
      });
    });
  });
};

module.exports = router;
