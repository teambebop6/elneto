var constants = require('../utils/constants');

exports.menuItems = (active) => constants.tags.filter((tag) => tag.type === 'ming-classics').map((tag) => {
  return {
    name: tag.name,
    url: "/ming-classics/" + tag.id,
    active: tag.id === active,
  }
});