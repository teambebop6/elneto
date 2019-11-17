/**
 * Created by Henry Huang on 2019/7/6.
 */
const express = require('express');
const router = express.Router({});
const db = require('../mongodb/db');
const logger = require('../lib/logger');

const Category = db.Category;
const Gallery = db.Galery;

const buildResponse = ({ res, data, error, module = Category }) => {
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

const buildKey = (title) => {
  return title.toLowerCase();
};

router.get('/search-galleries/:keyword?', (req, res) => {

  const cond = {
    // TODO only actives can be shown?
    isActive: true
  };
  const { keyword } = req.params;
  logger.debug(`search galleries by category = ${keyword}`);
  if (keyword) {
    cond.categories = {
      $regex: keyword
    };
  } else {
    return res.render('search-galleries', {
      title: 'Search Galleries',
      init: true,
      keyword: keyword,
      scripts: 'search-galleries.bundle',
    });
  }

  Gallery.find(cond).sort({
    order: 'desc',
  }).exec((error, galleries) => {
    res.render('search-galleries', {
      title: 'Search Galleries',
      galleries: galleries,
      keyword: keyword,
      scripts: 'search-galleries.bundle',
    });
  });

});

router.get('/search', (req, res) => {

  const { keyword } = req.query;
  const cond = {};
  logger.debug(`search categories by ${keyword}`);
  if (keyword) {
    cond.key = {
      $regex: keyword.toLowerCase()
    };
  }

  Category.find(cond).exec((error, categories) => {
    return buildResponse({
      res,
      error,
      data: categories,
    });
  });

});

router.get('/', (req, res) => {

  const cond = {};
  const { limit = 10, title } = req.query;
  logger.debug(`get last ${limit} categories with title = ${title}`);
  if (title) {
    cond.title = title;
  }

  Category.find(cond).limit(Number(limit)).sort({ lastModifiedDate: -1 }).exec(
    (error, categories) => {
      return buildResponse({
        res,
        error,
        data: categories,
      });
    });

});

router.delete('/', (req, res) => {

  const { title } = req.body;
  if (!title) {
    return buildResponse({
      res,
      error: new Error('Title cannot be empty!')
    })
  }

  logger.debug(`delete category by title = ${title}`);

  const cond = {
    title,
  };

  Category.remove(cond).exec((error) => {
    return buildResponse({
      res,
      error,
    });
  });

});

router.post('/', (req, res) => {

  const body = req.body;
  logger.debug(`create category ${JSON.stringify(body)}`);

  try {
    Category.validate(body);
  } catch (e) {
    return buildResponse({
      res,
      error: e
    })
  }

  db.Counter.findOne({ _id: 'category' }, (error, counter) => {

    if (error) {
      return buildResponse({
        res,
        error
      })
    }

    // Autoincrement of id
    if (!counter) {
      counter = new db.Counter({
        _id: "category",
        seq: 0
      });
    }
    counter.seq++;
    counter.save((err) => {

      if (err) {
        return buildResponse({
          res,
          error: err
        })
      }

      const category = new Category({
        _id: counter.seq,
        title: body.title,
        key: buildKey(body.title),
        creationDate: new Date()
      });

      category.save((err, { _doc: cat }) => {
        if (err) {
          return buildResponse({
            res,
            error: err
          })
        }
        return buildResponse({ res, data: cat });
      })
    })
  });
});

module.exports = router;
