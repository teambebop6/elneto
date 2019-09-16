/**
 * Created by Henry Huang on 2019-07-07.
 */
let db = require('../mongodb/db');
let logger = require('./logger');

const Category = db.Category;

const buildKey = (title) => {
  return title.toLowerCase();
};

const addCategory = (title) => {

  const category = {
    title,
  };

  return new Promise((resolve, reject) => {
    logger.debug(`create category ${JSON.stringify(category)}`);

    try {
      Category.validate(category);
    } catch (e) {
      reject(e);
    }

    db.Counter.findOne({ _id: 'category' }, (error, counter) => {

      if (error) {
        reject(error);
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
          reject(err);
        }

        const key = buildKey(category.title);
        Category.find({ key: key }).exec((err, result) => {
          if (err) {
            reject(err);
          }
          if (result && result.length > 0) {
            logger.debug(
              `Category with key = ${key} is existing, will update lastModifiedDate`);
            // update lastModifiedDate
            Category.update({ key: key }, { lastModifiedDate: new Date() },
              (err) => {
                if (err) {
                  reject(err);
                }
                resolve();
              });
          } else {
            const categoryToDb = new Category({
              _id: counter.seq,
              title: category.title,
              key: key,
              creationDate: new Date()
            });

            categoryToDb.save((err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            })
          }
        });

      })
    });
  })

};

const getLastCategories = (limit = 10) => {
  return new Promise((resolve, reject) => {
    Category.find({}).limit(limit).sort({ lastModifiedDate: -1 }).exec(
      (error, categories) => {
        if (error) {
          reject(error);
        }
        resolve(categories)
      });
  })
};

const addCategories = (titles) => {
  if (Array.isArray(titles)) {
    let p = Promise.resolve();
    titles.forEach((title) => {
      p = p.then(() => addCategory(title))
    });
  } else {
    addCategory(titles)
  }
};

module.exports = {
  addCategories,
  getLastCategories,
};