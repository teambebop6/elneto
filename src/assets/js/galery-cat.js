var app = require('./globals');

// load gallery style
//var galeryLess = require('../vendor/justifiedGallery/dist/css/justifiedGallery.css');
//var photoSwipeCss = require('../vendor/photoswipe/dist/default-skin/default-skin.css');
//var photoSwipeCss = require("../vendor/photoswipe/dist/photoswipe.css");

app.then(function(){
  console.log("loaded app.");
  // load gallery js

  var justifiedGallery = require(['justifiedGallery'], function(){
    console.log("loaded justified galery");

    $('#albumList').justifiedGallery({
      rowHeight : 280,
      lastRow : 'nojustify',
      maxRowHeight: 380,
      randomize: true,
      margins : 30
    });
  });
});
