/**
 * Created by Henry Huang on 2019/7/6.
 */
let express = require('express');
let router = express.Router({});
let db = require('../mongodb/db');
let logger = require('../lib/logger');

const Poem = db.Poem;

const buildResponse = ({ res, data, error, module = Poem }) => {
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

router.get('/:id', (req, res) => {

  const { id } = req.params;
  const cond = { _id: id };
  logger.debug(`search poem by id ${id}`);

  Poem.find(cond).exec((error, poems) => {
    return buildResponse({
      res,
      error,
      data: poems,
    });
  });

});

router.get('/', (req, res) => {

  const cond = { visible: true };
  const { limit = 8, mode = 'full' } = req.query;
  logger.debug(`get last ${limit} poems, mode is ${mode}`);

  Poem.find(cond).limit(Number(limit)).sort({ lastModifiedDate: -1 }).exec(
    (error, poems) => {
      let data;
      if (mode === 'simple') {
        data = poems.map(p => ({
          _id: p._id,
          title: p.title
        }))
      } else {
        data = poems;
      }
      return buildResponse({
        res,
        error,
        data: data,
      });
    });

});

module.exports = router;