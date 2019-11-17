/**
 * Created by Henry Huang on 2019/9/8.
 */
const moment = require('moment');

exports.format = (date, pattern = 'HH:mm:ss DD/MM/YYYY') => {
  if (!date) {
    return '';
  }
  return moment(date).format(pattern);
};

exports.parse = (dateString, pattern) => {
  if (!dateString || !pattern) {
    return null;
  }
  return moment(dateString, pattern).toDate();
};
