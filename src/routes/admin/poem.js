/**
 * Created by Henry Huang on 2019-07-08.
 */
const express = require('express');
const router = express.Router();
const db = require('../../mongodb/db');
const logger = require('../../lib/logger');
const dateUtils = require('../../utils/dateUtils');

const Poem = db.Poem;
const PoemCollection = db.PoemCollection;

const buildResponseAndReturn = ({ res, data, error, module = Poem }) => {
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

const updatePoem = (id, updateData) => {
  return new Promise((resolve, reject) => {
    Poem.findOne({ _id: id }).exec((err, poem) => {
      if (err) {
        reject(err);
      }
      if (!poem) {
        reject(new Error('Poem does not exist!'))
      }

      if (!updateData || updateData.length <= 0) {
        // formData is empty, do nothing
        reject(new Error('No data provided. Nothing happened.'));
      }

      // Parse object from json data

      // Iterate through data
      for (let key in updateData) {
        poem[key] = updateData[key]
      }

      poem.save((err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  });
};

const updatePoemCollection = (id, updateData) => {
  return new Promise((resolve, reject) => {
    PoemCollection.findOne({ _id: id }).exec((err, poemCollection) => {
      if (err) {
        reject(err);
      }
      if (!poemCollection) {
        reject(new Error('Poem collection does not exist!'))
      }

      if (!updateData || updateData.length <= 0) {
        // formData is empty, do nothing
        reject(new Error('No data provided. Nothing happened.'));
      }

      var oldTitle = poemCollection.title
      var newTitle = updateData.title

      // Parse object from json data

      // Iterate through data
      for (let key in updateData) {
        poemCollection[key] = updateData[key]
      }

      poemCollection.save((err) => {
        if (err) {
          reject(err);
        }

        // if title is updated, need update all related poems
        // !newTitle === true, means it is non-title-change operaition, like change visible
        if (newTitle && oldTitle !== newTitle) {
          Poem.update(
            {poemCollection: oldTitle},
            {$set:{poemCollection: newTitle}},
            {multi: true}, (err) => {
              if (err) {
                reject(err);
              }
              resolve();
          });
        } else {
          resolve();
        }
      });
    });
  });
};

router.get('/', function (req, res) {

  Poem.find({}).sort({ order: 'desc' }).exec(
    function (err, poems) {
      if (err) {
        console.log(err);
        return;
      }

      const poemObjects = poems.map((poem) => {
        const t = poem.toObject();
        t['creationDate'] = dateUtils.format(poem.creationDate);
        return t;
      });

      PoemCollection.find({}).sort({order: 'desc'}).exec((err2, poemCollections) => {

        if (err2) {
          console.log(err2);
          return;
        }

        const poemCollectionObjects = poemCollections.map((poem) => {
          const t = poem.toObject();
          t['creationDate'] = dateUtils.format(poem.creationDate);
          return t;
        });

        res.render('admin/list_poems', {
          title: 'Manage Poems',
          custom_js: 'admin/list-poems.bundle',
          poems: poemObjects,
          poemCollections: poemCollectionObjects,
          active: { list_poems: true },
          body_scripts: 'list-poems.bundle',
        });

      })

    });

});

router.get('/modify/:id', (req, res, next) => {

  const { id } = req.params;
  logger.debug(`Load view for poem update with id = ${id}`);

  Poem.findOne({ _id: id }, (err, poem) => {
    if (err) {
      return next(err);
    }
    if (!poem) {
      return next(Error(`Cannot find poem with id = ${id}`));
    }

    PoemCollection.find({}).exec((error, collections) => {
      if (error) {
        return buildResponseAndReturn({
          res,
          error
        })
      }
      res.render('admin/new_poem', {
        title: 'Update poem',
        poem: Poem.toDTO(poem),
        collections: collections.map(c => c.title),
        body_scripts: 'new-poem.bundle',
        active: { list_poems: true, modify: true },
        css: ['new-poem'],
      });
    })

  });

});

router.post('/', (req, res) => {

  const body = req.body;
  const { id } = body;

  if (id) {
    logger.debug(`update poem (id=${id}) ${JSON.stringify(body)}`);
  } else {
    logger.debug(`create poem ${JSON.stringify(body)}`);
  }

  try {
    Poem.validate(body);
  } catch (e) {
    return buildResponseAndReturn({
      res,
      error: e
    })
  }

  if (id) {
    // update

    updatePoem(id, body)
      .then(() => buildResponseAndReturn({ res }))
      .catch((error) => buildResponseAndReturn({ res, error }));

  } else {
    // create

    db.Counter.findOne({ _id: 'poem' }, (error, counter) => {

      if (error) {
        return buildResponseAndReturn({
          res,
          error
        })
      }

      // Autoincrement of id
      if (!counter) {
        counter = new db.Counter({
          _id: "poem",
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
        const poem = new Poem({
          _id: counter.seq,
          title: body.title,
          poemCollection: body.poemCollection,
          content: body.content,
          visible: body.visible,
          year: body.year || now.getFullYear(),
          author: body.author || 'yonny',
          order: now.getTime()
        });

        poem.save((err, { _doc: p }) => {
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

router.patch('/visible', (req, res) => {
  const { id, visible } = req.body;
  updatePoem(id, { visible })
    .then(() => {
      return buildResponseAndReturn({ res })
    })
    .catch((e) => {
      return buildResponseAndReturn({ res, error: e })
    })
});

router.patch('/collection/visible', (req, res) => {
  const { id, visible } = req.body;
  updatePoemCollection(id, { visible })
    .then(() => {
      return buildResponseAndReturn({ res })
    })
    .catch((e) => {
      return buildResponseAndReturn({ res, error: e })
    })
});

router.post('/change-order', (req, res) => {
  // TODO
});

router.get('/new', (req, res) => {
  PoemCollection.find({}).exec((error, collections) => {
    if (error) {
      return buildResponseAndReturn({
        res,
        error
      })
    }
    res.render('admin/new_poem', {
      title: 'Create new poem',
      collections: collections.map(c => c.title),
      body_scripts: 'new-poem.bundle',
      active: { list_poems: true, create: true },
      css: ['new-poem'],
    });
  })
});

router.delete('/', (req, res) => {

  const { id } = req.body;
  if (!id) {
    return buildResponseAndReturn({ res, error: Error("Missing poem id.") });
  }

  Poem.remove({ _id: id }, (err) => {
    return buildResponseAndReturn({ res, error: err });
  })

});

router.get('/collection/new', (req, res) => {
  res.render('admin/new_poem_collection', {
    title: 'New Poem Collection',
    body_scripts: 'new-poem-collection.bundle',
    active: { list_poems: true, create: true },
    css: ['new-poem'],
  });
});

router.post('/collection', (req, res) => {
  const body = req.body;
  const { id } = body;

  if (id) {
    logger.debug(`update poem collection (id=${id}) ${JSON.stringify(body)}`);
  } else {
    logger.debug(`create poem collection ${JSON.stringify(body)}`);
  }

  try {
    PoemCollection.validate(body);
  } catch (e) {
    return buildResponseAndReturn({
      res,
      error: e
    })
  }

  if (id) {
    // update

    updatePoemCollection(id, body)
      .then(() => buildResponseAndReturn({ res }))
      .catch((error) => buildResponseAndReturn({ res, error }));

  } else {
    // create

    db.Counter.findOne({ _id: 'poem-collection' }, (error, counter) => {

      if (error) {
        return buildResponseAndReturn({
          res,
          error
        })
      }

      // Autoincrement of id
      if (!counter) {
        counter = new db.Counter({
          _id: "poem-collection",
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
        const poemCollection = new PoemCollection({
          _id: counter.seq,
          title: body.title,
          visible: body.visible,
          order: now.getTime()
        });

        poemCollection.save((err, { _doc: p }) => {
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

})

router.get('/collection/modify/:id', (req, res) => {

  const { id } = req.params;
  logger.debug(`Load view for poem collection update with id = ${id}`);

  PoemCollection.findOne({ _id: id }, (err, poemCollection) => {
    if (err) {
      return next(err);
    }
    if (!poemCollection) {
      return next(Error(`Cannot find poem collection with id = ${id}`));
    }

    res.render('admin/new_poem_collection', {
      title: 'Update poem collection',
      poemCollection: PoemCollection.toDTO(poemCollection),
      body_scripts: 'new-poem-collection.bundle',
      active: { list_poems: true, modify: true },
      css: ['new-poem'],
    });

  });

});

router.delete('/collection', (req, res) => {

  const { id } = req.body;
  if (!id) {
    return buildResponseAndReturn({ res, error: Error("Missing poem collection id.") });
  }

  PoemCollection.findOne({_id: id}).exec((error, poemCollection) => {
    if (error) {
      return buildResponseAndReturn({ res, error});
    }
    if (!poemCollection) {
      return buildResponseAndReturn({ res, error: Error("Cannot find the poem collection") });
    }
    const title = poemCollection.title
    Poem.deleteMany({poemCollection: title}, (error2) => {
      if (error2) {
        return buildResponseAndReturn({ res, error2});
      }
      PoemCollection.remove({ _id: id }, (err) => {
        return buildResponseAndReturn({ res, error: err });
      })
    })
  })

});

module.exports = router;
