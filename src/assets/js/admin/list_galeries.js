const app = require('./globals');
const changeOrder = require('../change-order');

app.then(function(){
  console.log("Loaded globals.");

  // Delete galery
  $(".deleteGalery").click(function(){
    var id = $(this).data("id");
    console.log("Deleting: " + id);

    deleteGalery(id);
  });

  var deleteGalery = function(id){
    var confirmDelete = $('#deleteModalTemplate').clone().html($('#deleteModalTemplate').html().replace(/###placeholder###/g, "this galery"));

    confirmDelete.modal({
      onApprove : function() {
        $.ajax({
          method: 'POST',
          url: '/admin/galery/delete',
          data: { id: id },
          success : function(result){
            console.log(result.message);

            if(result.success){
              $('#galery_' + id).remove();
            }
          },
          error : function(xhr){
            console.log(xhr.status + " " + xhr.statusText);
          }
        })
      }
    })
      .modal('show');
  };

  $('.ui.checkbox').checkbox();

  var sort = function (id, direction) {

    $.ajax({
      method: 'POST',
      url: '/admin/galery/change-order/' + id,
      data: { direction },
      success: function (result) {
        // window.location.href = "/admin/galery/";
        changeOrder(`galery_${id}`, direction === 'up');
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



  // Add checkbox events
  $('.ui.checkbox.isFavorite')
    .checkbox({
      onChecked: function () {
        console.log("isFavorite checked");
        var id = $(this).data('id');
        $.ajax({
          method: 'post',
          url: '/admin/galery/' + id + '/setFavorite',
          success: function () {
            console.log('setFavorite for gallery ' + id);
          },
          error: function (err) {
            $('gallery_' + id + '_displayed').prop('checked', false);
            console.log(err);
          }
        });
      },
      onUnchecked: function () {
        console.log("isFavorite unchecked");

        var id = $(this).data('id');
        $.ajax({
          method: 'post',
          url: '/admin/galery/' + id + '/unsetFavorite',
          success: function () {
            console.log('unsetFavorite for gallery ' + id);
          },
          error: function (err) {
            $('gallery_' + id + '_displayed').prop('checked', true);
            console.log(err);
          }
        });
      }
    });

  // Initialize isActive toggle
  $('.ui.checkbox.isActive')
    .checkbox({
      onChecked: function () {
        console.log("isActive checked");
        var id = $(this).data('id');
        $.ajax({
          method: 'post',
          url: '/admin/galery/modify',
          data: {
            galeryId: id,
            action: 'setActive'
          },
          success: function () {
            console.log('Check isActive for gallery ' + id);
            // $('#gallery_' + id + '_inactive_icon').html('<i class="eye icon" title="Inactive"></i>');
          },
          error: function (err) {
            $('#gallery_' + id + '_active').prop('checked', false);
            console.log(err);
          }
        });
      },
      onUnchecked: function () {
        console.log(console.log("isActive unchecked"));
        var id = $(this).data('id');
        $.ajax({
          method: 'post',
          url: '/admin/galery/modify',
          data: {
            galeryId: id,
            action: 'setInactive'
          },
          success: function () {
            console.log('Check setInactive for gallery ' + id);
            // $('#gallery_' + id + '_inactive_icon').html('<i class="eye slash outline icon" title="Inactive"></i>');
          },
          error: function (err) {
            $('#gallery_' + id + '_active').prop('checked', true);
            console.log(err);
          }
        });
      }
    });

  $('#adjustSequence').on('click', function() {
    if (confirm('Confirm to adjust all galleries sequence?')) {
      console.log('adjust galleries sequence');
      $.ajax({
        method: 'post',
        url: '/admin/galery/adjust-sequence',
        success: function () {
          window.location.href = "/admin/galery/";
        },
        error: function (err) {
          console.error(err);
        }
      });
    }
  })

});

