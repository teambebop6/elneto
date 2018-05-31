var app = require('./globals');

app.then(function(){
  console.log("Loaded globals.");

  $('#new-galery').click(function(){
    window.location.replace("/admin/galery/new");
  });

  var modifyGalery = function(id){
    window.location.replace('/admin/galery/' + id + '/modify');
  }

  var getSelectedGaleries = function(){
    var selectedGaleries = [];
    $('.galery-listing').each(function(){
      var id = $(this).get(0).id;
      var checkbox = $(this).find('.checkbox').first();

      if(checkbox.hasClass("checked")){
        selectedGaleries.push(String(id));
      }
    });

    return selectedGaleries;
  }

  // Delete selected galeries
  $('#deleteSelected').click(function(){
    var confirmDelete = $('#deleteModalTemplate').clone().html($('#deleteModalTemplate').html().replace(/###placeholder###/g, "all selected galeries"));

    confirmDelete.modal({
      onApprove : function() {
        var galeries = getSelectedGaleries();

        galeries.forEach(function(galery_id){

          var id = galery_id;

          if(id.substring(0,7) == "galery_"){
            id = id.substring(7, id.length);
          }

          console.log("Deleting galery " + id);

          id = parseInt(id);
          $.ajax({
            method: 'POST',
            url: '/admin/galery/delete',
            data: { id: id },
            success : function(result){
              console.log(result.message);

              if(result.success){ 
                $('#galery_' + id).hide();
              }
            },
            error : function(xhr){
              console.log(xhr.status + " " + xhr.statusText);
            }
          })


        });
      }
    })
    .modal('show');	

  });

  // Delete single galery
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
              $('#galery_' + id).hide();
            }
          },
          error : function(xhr){
            console.log(xhr.status + " " + xhr.statusText);
          }
        })
      }
    })
    .modal('show');	

  }

  $('.ui.checkbox').checkbox();

});

