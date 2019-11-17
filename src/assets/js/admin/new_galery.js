var app = require('./globals');

require('../../vendor/datepicker/dist/datepicker.css');

var moment = require('moment');

app.then(function () {
  // Initialize UI
  $('.ui.dropdown').dropdown({
    allowAdditions: true,
  });
  $('.ui.error.message').hide();

  // Closing messages
  $('.message .close').on('click', function () {
    $(this)
      .closest('.message')
      .transition('fade');
  });

  require(['datepicker'], function () {
    console.log("loaded datepicker.");
    // Datepicker
    var picker = $('#date_of_play_string');

    var dateFormat = "DD/MM/YYYY";

    picker.datepicker({
      format: 'dd/mm/yyyy',
      date:  new Date(),
    });
    $(picker).on('pick.datepicker', function (e) {
      $('#date_of_play').val(moment(e.date).format(dateFormat));
    });

  });

  require(['jquery.inputmask'], function () {
    console.log('Loaded inputmask');
    $('#date_of_play_string').inputmask("99/99/9999", {
      alias: "dd/mm/yyyy",
      oncomplete: function () {
        $('#date_of_play').val($('#date_of_play_string').val())
      }
    });
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
            url: '/admin/galery/new',
            data: $('#form-new').serialize(),
            success: function (result) {
              if (result.success) {
                window.location.href = "/admin/galery/" + result.galery_id
                  + "/modify";
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

