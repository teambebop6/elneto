/**
 * Created by Henry Huang on 2019/9/5.
 */
var app = require('./globals');

app.then(function () {
  console.log("Loaded globals.");

  $('.message .close')
    .on('click', function () {
      $(this)
        .closest('.message')
        .transition('fade')
      ;
    });

  var showMessage = function (success, header, content) {
    $("#message").addClass(success ? "positive" : "negative");
    $("#message .header").text(header);
    if (content) {
      $("#message .content").text(content);
    }
    $("#message").show();
  };

  $("#restore").click(function () {
    if (confirm("Are you sure to restore this backup?")) {
      $("#restore").addClass("loading disabled");
      var id = $("#restore").data("id");
      console.log(id);
      $.ajax({
        method: 'POST',
        url: '/admin/backup/' + id + '/restore',
        data: { id: id },
        success: function (data, textStatus, xhr) {
          showMessage(true, 'Restored successfully!');
          setTimeout(function () {
            window.location = '/admin/backup/';
          }, 1500);
        },
        error: function (xhr) {
          showMessage(false, 'Restored unsuccessfully!', xhr.statusText)
        }
      })
    }
  });

});
