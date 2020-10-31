var app = require('./globals');

app.then(function () {
  console.log("Loaded globals.");

  // Delete poem
  $(".deletePoem").click(function () {
    var id = $(this).data("id");
    console.log("Deleting: " + id);

    deletePoem(id);
  });

  // Delete poem collection
  $(".deletePoemCollection").click(function () {
    var id = $(this).data("id");
    console.log("Deleting: " + id);

    deletePoemCollection(id);
  });

  var deletePoem = function (id) {
    var confirmDelete = $('#deleteModalTemplate').clone().html(
      $('#deleteModalTemplate').html().replace(/###placeholder###/g,
        "this poem"));

    confirmDelete.modal({
      onApprove: function () {
        $.ajax({
          method: 'DELETE',
          url: '/admin/poems',
          data: { id: id },
          success: function () {
            $('#poem_' + id).hide();
          },
          error: function ({ error }) {
            console.error(error);
          }
        })
      }
    })
      .modal('show');
  };

  var deletePoemCollection = function (id) {
    var confirmDelete = $('#deleteModalTemplate').clone().html(
      $('#deleteModalTemplate').html().replace(/###placeholder###/g,
        "this poem collection"));

    confirmDelete.modal({
      onApprove: function () {
        $.ajax({
          method: 'DELETE',
          url: '/admin/poems/collection',
          data: { id: id },
          success: function () {
            $('#poem_collection_' + id).hide();
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
      url: '/admin/poems/visible',
      data: { id, visible },
      success: function (result) {
        console.log(result.message);
        // if (result.success) {
        //   $('#poem_' + id + '_visible').checkbox(visible ? 'check' : 'uncheck');
        // }
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

