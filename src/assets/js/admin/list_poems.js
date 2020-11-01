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
        "Are you sure to delete this poem?").replace(/###subPlaceholder###/g,
        ""));

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
        "The operation will delete the poems which collection is this!").replace(/###subPlaceholder###/g,
        "Are you sure to delete this poem collection?"));

    confirmDelete.modal({
      onApprove: function () {
        $.ajax({
          method: 'DELETE',
          url: '/admin/poems/collection',
          data: { id: id },
          success: function (data) {
            window.location.href = '/admin/poems'
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
    $.ajax({
      method: 'PATCH',
      url: '/admin/poems/visible',
      data: { id, visible },
      error: function (xhr) {
        console.error(xhr.status + " " + xhr.statusText);
      }
    })
  };

  var switchCollectionVisible = function (id, visible) {
    $.ajax({
      method: 'PATCH',
      url: '/admin/poems/collection/visible',
      data: { id, visible },
      error: function (xhr) {
        console.error(xhr.status + " " + xhr.statusText);
      }
    })
  };

  $('.ui.checkbox.poemVisible').checkbox({
    onChecked: function () {
      switchVisible($(this).data('id'), true);
    },
    onUnchecked: function () {
      switchVisible($(this).data('id'), false);
    }
  });

  $('.ui.checkbox.poemCollectionVisible').checkbox({
    onChecked: function () {
      switchCollectionVisible($(this).data('id'), true);
    },
    onUnchecked: function () {
      switchCollectionVisible($(this).data('id'), false);
    }
  });

});

