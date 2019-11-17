var app = require('./globals');

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
      $('#cuadro-form').validate({
        lang: 'de',
        rules: {
          title: {
            required: true
          }
        },
        highlight: function (element) {
          if (element.name === 'content') {
            $(element).parent().addClass('editor-error');
            $(element).parents('.field').addClass('error');
          } else {
            $(element).parent().addClass('error');
          }
        },
        unhighlight: function (element) {
          if (element.name === 'content') {
            $(element).parent().removeClass('editor-error');
            $(element).parents('.field').removeClass('error');
          } else {
            $(element).parent().removeClass('error');
          }
        },
        errorLabelContainer: "#errorMsgBox",
        wrapper: "p",
        submitHandler: function (form, event) {
          event.preventDefault();

          $('button[type="submit"]').addClass('loading');
          $('button[type="submit"]').addClass('disabled');

          $.ajax({
            type: 'POST',
            url: '/admin/cuadros',
            data: $('#cuadro-form').serialize(),
            success: function (res) {
              window.location.href = "/admin/cuadros/modify/" + res.data.id;
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

