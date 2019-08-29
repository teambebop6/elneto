/**
 * Created by Henry Huang on 2019/8/29.
 */
const logger = require('../lib/logger');

// 1. find order >

/**
 * a and b should has order field
 * @param a
 * @param b
 */
const swap = (a, b) => {

  const orderForA = a.order;
  const orderForB = b.order;

  logger.info(`swap order ${a._id}.${orderForA} <=> ${b._id}.${orderForB}`);

  a.order = orderForB;
  b.order = orderForA;

};

/**
 * @param object the object which be change order
 * @param model mongoose Schema which has order field
 * @param toLarger true if make the object's order to larger
 */
module.exports = (object, model, toLarger) => {

  return new Promise((resolve, reject) => {

    const order = object.order;

    const findCond = {};
    const sortCond = {};
    if (toLarger) {
      Object.assign(findCond, {
        order: {
          $gt: order
        }
      });
      Object.assign(sortCond, {
        order: 1
      })
    } else {
      Object.assign(findCond, {
        order: {
          $lt: order
        }
      });
      Object.assign(sortCond, {
        order: -1
      })
    }

    model.find(findCond).sort(sortCond).limit(1).exec((error, objects) => {
      if (error) {
        reject(error);
      }
      if (objects && objects[0]) {
        const other = objects[0];
        swap(object, other);
        // save both
        Promise.all([object.save(), other.save()])
          .then(resolve)
          .catch(reject)
      }
      // do not need swap
    })

  })

};
