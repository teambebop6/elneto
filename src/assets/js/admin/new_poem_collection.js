var app = require('./globals');

require('../../vendor/trumbowyg/ui/trumbowyg.min.css');

app.then(function () {

  // Initialize UI
  $('.ui.dropdown').dropdown();
  $('.ui.checkbox').checkbox();
  $('.ui.error.message').hide();

  // Closing messages
  $('.message .close').on('click', function () {
    $(this)
      .closest('.message')
      .transition('fade');
  });

  require(['jquery.validate', '../../../utils/locales/messages_de.js'],
    function () {
      $('#poem-collection-form').validate({
        lang: 'de',
        rules: {
          title: {
            required: true
          }
        },
        highlight: function (element) {
          $(element).parent().addClass('error');
        },
        unhighlight: function (element) {
          $(element).parent().removeClass('error');
        },
        errorLabelContainer: "#errorMsgBox",
        wrapper: "p",
        submitHandler: function (form, event) {
          event.preventDefault();

          $('button[type="submit"]').addClass('loading');
          $('button[type="submit"]').addClass('disabled');

          $.ajax({
            type: 'POST',
            url: '/admin/poems/collection',
            data: $('#poem-collection-form').serialize(),
            success: function () {
              window.location.href = "/admin/poems";
            },
            error: function (err) {
              console.error(err);
              $('.ui.error.message .message').html(err.responseJSON.error);
              $('.ui.error.message').show();
              $('button[type="submit"]').removeClass('loading');
              $('button[type="submit"]').removeClass('disabled');
            }
          });
        }
      });
    });

});

