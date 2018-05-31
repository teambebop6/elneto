require('../../vendor/semantic/dist/semantic.min.css');
require('../../less/admin.less');

var common = new Promise(function(resolve, reject){
  require(['jquery'], function($){

    jQuery = $;
    window.jQuery = jQuery;
    window.$ = $;

    // Semantic js
    require('../../vendor/semantic/dist/semantic.min.js');

    // Resolve promise
    resolve();
  });
});

module.exports = common;

