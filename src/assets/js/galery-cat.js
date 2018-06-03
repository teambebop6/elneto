var app = require('./globals');

// load gallery style
var galeryLess = require('../vendor/justifiedGallery/dist/css/justifiedGallery.css');

app.then(function(){
  console.log("loaded app.");
  // load gallery js

  //var jquery = $;
  var justifiedGallery = require(['justifiedGallery'], function(){
    console.log("loaded justified galery");

    $('#basicExample').justifiedGallery({
      rowHeight : 280,
      lastRow : 'nojustify',
      maxRowHeight: 380,
      randomize: true,
      margins : 20
    });
  });
});
