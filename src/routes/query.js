/**
 * Created by Henry Huang on 2019/7/6.
 */
const express = require('express');
const router = express.Router({});
const db = require('../mongodb/db');
const logger = require('../lib/logger');

const convertNullIfLenghtIsZeo = (array) => array ? array.length > 0 ? array : null : null;

const buildResponse = ({ res, data, error, errorCode }) => {
  let code = errorCode || error ? 400 : 200;
  if (error) {
    logger.error(error);
  }
  return res.status(code).json({
    data: {
      galleries: convertNullIfLenghtIsZeo(data.galleries),
      cuadros: convertNullIfLenghtIsZeo(data.cuadros),
      yonnyFotos: convertNullIfLenghtIsZeo(data.yonnyFotos),
    },
    error: error ? error.message : null,
  })
};

const fetchObjects = ({ model, cond, keyword }) => {
  return new Promise((resolve) => {

    logger.info(
      `search ${model.collection.name} by keyword = ${keyword}`);

    const condition = {};
    if (cond) {
      Object.assign(condition, cond);
    }

    if (!keyword) {
      model.find(condition)
        .sort({
          order: 'desc'
        })
        .limit(5)
        .exec((error, results) => {
          if (error) {
            logger.error(
              `search ${model.collection.name} by keyword = ${keyword} failed`);
            logger.error(error);
            resolve([]);
          }
          resolve(results);
        })
    } else {

      Object.assign(condition, {
        $text: {
          $search: keyword,
          $caseSensitive: false
        }
      });

      model.find(condition, { score: { $meta: "textScore" } }).sort({
        score: { $meta: "textScore" }
      }).exec((error, results) => {
        if (error) {
          logger.error(
            `search ${model.collection.name} by keyword = ${keyword} failed`);
          logger.error(error);
          resolve([]);
        }
        resolve(results);
      });

    }
  })
};

const query = ({ req, res, next, plain = true }) => {

  const keyword = req.query.q;

  const ps = [];
  ps.push(fetchObjects({
    model: db.Galery,
    cond: {
      isActive: true
    },
    keyword,
  }));
  ps.push(fetchObjects({
    model: db.Cuadro,
    cond: {
      visible: true
    },
    keyword,
  }));
  ps.push(fetchObjects({
    model: db.YonnyFoto,
    cond: {
      visible: true
    },
    keyword,
  }));

  Promise
    .all(ps)
    .then(([galleries, cuadros, yonnyFotos]) => {
      const galleryObjects = !galleries ? null : galleries.map((g) => db.Galery.toDTO(g));
      const cuadroObjects = !cuadros ? null : (
        cuadros
          .filter(c => c.photos && c.photos.length > 0)
          .map((c) => {
            const dto = db.Cuadro.toDTO(c);
            if (!dto.titlePicture) {
              dto.titlePicture = dto.photos[0].link;
            }
            return dto;
          })
      );
      const yonnyFotoObjects = !yonnyFotos ? null : (
        yonnyFotos
          .filter(c => c.photos && c.photos.length > 0)
          .map((c) => {
            const dto = db.YonnyFoto.toDTO(c);
            if (!dto.titlePicture) {
              dto.titlePicture = dto.photos[0].link;
            }
            return dto;
          })
      );

      if (plain) {
        buildResponse({
          res,
          data: {
            galleries: galleryObjects,
            cuadros: cuadroObjects,
            yonnyFotos: yonnyFotoObjects
          },
        });
      } else {
        res.render('search-galleries', {
          title: 'Search Galleries',
          init: !keyword,
          keyword,
          data: {
            galleries: galleryObjects,
            cuadros: cuadroObjects,
            yonnyFotos: yonnyFotoObjects
          },
          scripts: 'search-galleries.bundle',
        });
      }
    })
    .catch((error) => {
      if (plain) {
        buildResponse({
          res,
          error,
        });
      } else {
        if (error) {
          return next(error);
        }
      }
    });
};

router.get('/', (req, res, next) => {
  query({
    req,
    res,
    next,
    plain: false
  })
});

router.get('/plain', (req, res, next) => {
  query({
    req,
    res,
    next,
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
