require('../less/main.less');
require('../vendor/semantic/dist/semantic.min.css');
require('../less/galery.less');
require('../less/jcarousel.basic.less');

const common = new Promise(function(resolve, reject){
  require(['jquery'], function($){

    jQuery = $;
    window.jQuery = jQuery;
    window.$ = $;

    // Semantic js
    require('../vendor/semantic/dist/semantic.min.js');

    // Resolve promise
    resolve();
  });
});

module.exports = common;
