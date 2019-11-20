/**
 * Adjust model's all objects order
 *
 * Created by Henry Huang on 2019/11/20.
 */
const logger = require('../lib/logger');

/**
 * @param model mongoose Schema which has order field
 */
module.exports = (model) => {

  logger.debug(`Start adjust orders for model ${model.name}`);

  return new Promise((resolve, reject) => {

    model.find().sort({ order: 'asc' }).exec((error, objects) => {
      if (error) {
        reject(error);
      } else if (objects && objects.length > 0) {

        let order = new Date().getTime();
        const ps = [];
        objects.forEach((object) => {
          object.order = order;
          ps.push(object.save());
          order = order + 1;
        });

        Promise.all(ps)
          .then(resolve)
          .catch(reject)

      } else {
        resolve();
      }
    })
  });

};
