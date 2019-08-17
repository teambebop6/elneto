var app = require('./globals');

app.then(function () {
  console.log("Loaded globals.");

  // Delete cuadro
  $(".deleteCuadro").click(function () {
    var id = $(this).data("id");
    console.log("Deleting: " + id);

    deleteCuadro(id);
  });

  var deleteCuadro = function (id) {
    var confirmDelete = $('#deleteModalTemplate').clone().html(
      $('#deleteModalTemplate').html().replace(/###placeholder###/g,
        "this cuadro"));

    confirmDelete.modal({
      onApprove: function () {
        $.ajax({
          method: 'DELETE',
          url: '/admin/cuadros',
          data: { id: id },
          success: function () {
            $('#cuadro_' + id).hide();
          },
          error: function ({ error }) {
            console.error(error);
          }
        })
      }
    })
      .modal('show');
  };

  var switchVisible = function (id, visible) {
    console.log(id, visible);

    $.ajax({
      method: 'PATCH',
      url: '/admin/cuadros/visible',
      data: { id, visible },
      success: function (result) {
        console.log(result.message);
      },
      error: function (xhr) {
        console.error(xhr.status + " " + xhr.statusText);
      }
    })

  };

  $('.ui.checkbox').checkbox({
    onChecked: function () {
      switchVisible($(this).data('id'), true);
    },
    onUnchecked: function () {
      switchVisible($(this).data('id'), false);
    }
  });

});

