var app = require('./globals');

app.then(function () {
  console.log("Loaded globals.");

  // Delete galery
  $(".deleteBackup").click(function () {
    var id = $(this).data("id");
    console.log("Deleting: " + id);

    deleteBackup(id);
  });

  var deleteBackup = function (id) {
    var confirmDelete = $('#deleteModalTemplate').clone().html(
      $('#deleteModalTemplate').html().replace(/###placeholder###/g,
        "this backup"));

    confirmDelete.modal({
      onApprove: function () {
        $.ajax({
          method: 'POST',
          url: '/admin/backup/delete',
          data: { id: id },
          success: function (result) {
            console.log(result.message);

            if (result.success) {
              $('#backup_' + id).hide();
            }
          },
          error: function (xhr) {
            console.log(xhr.status + " " + xhr.statusText);
          }
        })
      }
    })
      .modal('show');
  };

  $('.ui.checkbox').checkbox();

});

