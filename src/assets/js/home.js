var app = require('./globals');


app.then(function(){

  require(['../vendor/jcarousel/jcarousel.basic.css']);

  require(['../vendor/jcarousel/jquery.jcarousel.min', '../vendor/jcarousel/jcarousel.basic'], function(){
  });
});
