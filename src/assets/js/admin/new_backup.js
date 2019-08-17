var app = require('./globals');

app.then(function () {
  // Initialize UI
  $('.ui.dropdown').dropdown();
  $('.ui.error.message').hide();

  // Closing messages
  $('.message .close').on('click', function () {
    $(this)
      .closest('.message')
      .transition('fade');
  });

  require(['jquery.validate', '../../../utils/locales/messages_de.js'],
    function () {
      $('#form-new').validate({
        lang: 'de',
        rules: {
          title: {
            required: true
          }
        },
        submitHandler: function (form, event) {
          event.preventDefault();

          $('button[type="submit"]').addClass('loading');
          $('button[type="submit"]').addClass('disabled');

          $.ajax({
            type: 'POST',
            url: '/admin/backup/new',
            data: $('#form-new').serialize(),
            success: function (result) {
              if (result.success) {
                window.location.href = "/admin/backup";
              } else {
                $('.ui.error.message .message').html(result.message);
                $('.ui.error.message .header').html(result.header || "Error!");
                $('.ui.error.message').show();
                $('button[type="submit"]').removeClass('loading');
                $('button[type="submit"]').removeClass('disabled');
              }
            },
            error: function (err) {
              $('.ui.error.message .message').html(err);
              $('.ui.error.message').show();
              $('button[type="submit"]').removeClass('loading');
              $('button[type="submit"]').removeClass('disabled');
            }
          });
        }
      });
    });
});
