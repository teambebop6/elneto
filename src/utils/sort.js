/**
 * Created by Henry Huang on 2019/8/29.
 */
const logger = require('../lib/logger');

// 1. find order >

/**
 * a and b should has order field
 * @param object
 * @param anotherObject
 * @param toLarger
 */
const swap = (object, anotherObject, toLarger = true) => {

  let orderForA = object.order;
  let orderForB = anotherObject.order;

  if (!orderForA) {
    orderForA = new Date().getTime();
  }
  if (!orderForB) {
    if (toLarger) {
      orderForB = orderForA + 1;
    } else {
      orderForB = orderForA - 1;
    }
  }

  logger.info(`swap order ${object._id}.${orderForA} <=> ${anotherObject._id}.${orderForB}`);

  object.order = orderForB;
  anotherObject.order = orderForA;

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
        swap(object, other, toLarger);
        // save both
        Promise.all([object.save(), other.save()])
          .then(resolve)
          .catch(reject)
      } else {
        // if cannot find object, it on the top/bottom, means need back to bottom/top
        // find the bottom/top object, -1 or + 1
        model.find().sort({
          order: toLarger ? 1 : -1
        }).limit(1).exec((error2, objects2) => {
          if (error2) {
            reject(error);
          }
          if (objects2 && objects2[0]) {
            const refObject = objects2[0]
            object.order = toLarger ? refObject.order - 1 : refObject.order + 1
            object.save().then(resolve).catch(reject)
          }
        })
      }
    })

  })

};
