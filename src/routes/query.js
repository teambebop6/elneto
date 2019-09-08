/**
 * Created by Henry Huang on 2019/7/6.
 */
const express = require('express');
const router = express.Router({});
const db = require('../mongodb/db');
const logger = require('../lib/logger');

const Gallery = db.Galery;

const getModel = (type) => {
  // TODO only support galery now
  if (type === 'galery') {
    return db.Galery;
  } else if (type === 'poem') {
    return db.Poem;
  } else if (type === 'cuadro') {
    return db.Cuadro;
  } else if (type === 'yonny-foto') {
    return db.YonnyFoto
  } else {
    return db.Galery;
  }
};

const getDefaultCond = (type) => {
  if (type === 'galery') {
    return {
      isActive: true
    }
  } else {
    // TODO
    return {}
  }
};

const buildResponse = ({ res, data, error, module = Gallery, errorCode }) => {
  let code = errorCode || error ? 400 : 200;
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

const query = ({ req, res, next, model = Gallery, cond = {}, plain = true }) => {

  const keyword = req.query.q;
  logger.debug(
    `search ${model.collection.name} by keyword = ${keyword}, type = ${req.params.type}`);

  if (!keyword) {
    model.find(cond).sort({
      order: 'desc',
    }).limit(5).exec((error, galleries) => {
      if (plain) {
        buildResponse({
          res,
          data: galleries,
          error
        });
      } else {
        if (error) {
          return next(error);
        }
        res.render('search-galleries', {
          title: 'Search Galleries',
          init: true,
          galleries: galleries,
          scripts: 'search-galleries.bundle',
        });
      }
    });
  } else {

    Gallery.find({
        $text: {
          $search: keyword,
          $caseSensitive: false
        }
      },
      { score: { $meta: "textScore" } }).sort({
      score: { $meta: "textScore" }
    }).exec((error, galleries) => {
      if (plain) {
        buildResponse({
          res,
          data: galleries,
          error
        });
      } else {
        if (error) {
          return next(error);
        } else {
          res.render('search-galleries', {
            title: 'Search Galleries',
            galleries: galleries,
            keyword: keyword,
            scripts: 'search-galleries.bundle',
          });
        }
      }
    });
  }

};

router.get('/:type', (req, res, next) => {
  const type = req.params.type;
  query({
    req,
    res,
    next,
    model: getModel(type),
    cond: getDefaultCond(type),
    plain: false
  })
});

router.get('/plain/:type', (req, res, next) => {
  const type = req.params.type;
  query({
    req,
    res,
    next,
    model: getModel(type),
    cond: getDefaultCond(type),
    plain: true
  })
});

router.get('/', (req, res) => {
  buildResponse({
    res,
    errorCode: 404,
    error: Error('Not found.')
  })
});

module.exports = router;
