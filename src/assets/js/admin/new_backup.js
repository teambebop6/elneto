var app = require('./globals');

app.then(function () {
  // Initialize UI
  $('.ui.dropdown').dropdown();
  $('.ui.error.message').hide();

  $("#progress").progress({
    percent: 1
  });

  setInterval(function () {
    $("#progress").progress('increment');
  }, 1000);

});

