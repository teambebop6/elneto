/**
 * Created by Henry Huang on 2019-07-08.
 */
var app = require("./globals");

app.then(function () {

  require('./yonny');

  var changePoemStatus = function () {
    $('#yonny_poem_wrapper').toggle();
    $('#yonny_poem_wrapper_detail').toggle();
    var scroll = $('#nav.menuBar.poemas').offset().top - 30;
    $('body, html').scrollTop(scroll);
  };

  $('#yonny_poem_wrapper a').on('click', function (e) {
    e.preventDefault();
    var id = $(this).data('id');
    var title = $(this).data('title');
    var content = $(this).data('content');
    var year = $(this).data('year');
    var author = $(this).data('author');

    console.log(id);
    $('#poemDetailTitle').text(title);
    $('#poemDetailContent').html(content);
    $('#poemDetailYear').text(year);
    $('#poemDetailAuthor').text(author);

    changePoemStatus();
  });

  $('#backLink').on('click', function (e) {
    e.preventDefault();
    changePoemStatus();
  })

});