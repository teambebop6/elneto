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

        console.log(results)
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
      // List all general conditions here
      isActive: true,
      tags: "ming-classics"
    },
    keyword,
  }));

  Promise
    .all(ps)
    .then(([galleries]) => {
      const galleryObjects = !galleries ? null : galleries.map((g) => db.Galery.toDTO(g));    

      if (plain) {
        buildResponse({
          res,
          data: {
            galleries: galleryObjects,
          },
        });
      } else {
        res.render('search-ming-classics', {
          title: 'Search Ming Classics',
          
          init: !keyword,
          keyword,
          data: {
            galleries: galleryObjects,
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

router.get('/*', function (req, res, next) {
  req.app.locals.layout = 'ming-classics';
  next(); // pass control to the next handler
});

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