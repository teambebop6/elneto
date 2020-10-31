var app = require('./globals');

app.then(function () {
  console.log("Loaded globals.");

  var resetButtonsState = function () {
    // $(".changeOrderUp").removeClass("disabled");
    // $(".changeOrderDown").removeClass("disabled");
    // $(".changeOrderUp:first").addClass("disabled");
    // $(".changeOrderDown:last").addClass("disabled");
  };
  resetButtonsState();

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
            $('#cuadro_' + id).remove();
            resetButtonsState();
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


  var sort = function (id, direction) {

    $.ajax({
      method: 'POST',
      url: '/admin/cuadros/change-order/' + id,
      data: { direction },
      success: function (result) {
        window.location.href = "/admin/cuadros/";
      },
      error: function (xhr) {
        console.log(xhr.status + " " + xhr.statusText);
      }
    })

  };

  $(".changeOrderUp").click(function () {
    var id = $(this).data("id");
    sort(id, 'up')
  });

  $(".changeOrderDown").click(function () {
    var id = $(this).data("id");
    sort(id, 'down')
  })

  $('#adjustSequence').on('click', function() {
    if (confirm('Confirm to adjust all cuadros sequence?')) {
      console.log('adjust cuadros sequence');
      $.ajax({
        method: 'post',
        url: '/admin/cuadros/adjust-sequence',
        success: function () {
          window.location.href = "/admin/cuadros/";
        },
        error: function (err) {
          console.error(err);
        }
      });
    }
  })

});

