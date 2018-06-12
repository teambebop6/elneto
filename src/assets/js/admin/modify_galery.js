var app = require('./globals');

app.then(function(){

  require(['jquery.fileupload'], function(){
    // Fileupload
    var galery_id = $('#galery-id').val();
    $('#fileupload').fileupload({
      dataType: 'json',
      formData: {galery_id: galery_id },
      sequentialUploads: true,
      disableImageResize: false,
      imageMaxWidth: 1177,
      imageMaxHeight: 1177,
      done: function(e, data){
        $.each(data.result.files, function(index, file){

          $.get("/admin/galery/getThumbTemplate?src=" + file.name, function(data){
            var thumb = $('<div/>').html(data).find('> div');

            refreshThumb(thumb); // Bind mouseover events
            thumb.appendTo($('.images-list'));
          });
        });

        $('.ui.progress').hide();
        $('.no-images-yet-message').hide();	
      },
      stop: function(e){
        d = new Date();
        $.each($('.images-list').find('.image-thumb'), function(index, element){
          var path = $(element).attr("id").substr(12); // cut off image-thumb- in order to get path
          var imgElement = $(element).find('img');
          imgElement.attr("src", '/static/images/galery/thumbs/' + path + "?t=" + d.getTime()); 
        });
      },
      progressall: function (e, data) {

        $('.ui.progress').show();
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.ui.progress .bar').css(
          'width',
          progress + '%'
        );
        $('.ui.progress .bar .progress').html(progress + '%');
      }
    });
  });

  require(['jquery.validate', 'jquery-ui'], function(){

    // Serialize Array
    $.fn.serializeObject = function()
    {
      var o = {};
      var a = this.serializeArray();
      $.each(a, function() {
        if (o[this.name]) {
          if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
        } else {
          o[this.name] = this.value || '';
        }
      });
      return o;
    };    

    // Refresh rollover events for thumbnails
    var refreshThumb = function(thumb){		

      // Hide hidden content of galery thumbs
      thumb.find('.info .actions').hide();

      var actionsButton = thumb.find('.info .actions .button').first();
      var icon = actionsButton.find('i').first();	

      actionsButton.mouseover(function(){
        icon.removeClass("square outline");
        icon.addClass("checkmark box");
      });
      actionsButton.mouseout(function(){
        icon.addClass("square outline");
        icon.removeClass("checkmark box");
      });

      //Show actions and hide states on rollover 
      thumb.mouseover(function(){
        var actions = thumb.find('.info .actions').first();
        actions.show();
      });
      thumb.mouseout(function(){
        thumb.find('.actions').hide();
      });
    }

    $('.image-thumb').each(function(){
      refreshThumb($(this));
    });


    var deletePicture = function(id){
      var confirmDelete = $('#confirmDeleteModal').clone()
        .html($('#confirmDeleteModal').html().replace(/###placeholder###/g, 
          "this picture")
        );

      var galery_id = $('#galery-id').val();
      confirmDelete.modal({
        onApprove : function() {
          $.ajax({
            method: 'POST',
            url: '/admin/galery/'+galery_id+'/deletePicture',
            data: { id: id },
            success : function(data, textStatus, xhr){
              if(xhr.status == 200){ 
                $('#galery-thumb-' + String(id).replace(/\./g, "\\.")).hide();
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

    // Delete single galery
    $('.deletePicture').click(function(){
      deletePicture($(this).data("id"));
    })

    // Set title picture of galery
    var setTitlePicture = function(imgSrc){
      var galery_id = $('#galery-id').val();
      $.ajax({
        type: "post",
        url: "/admin/galery/"+galery_id+"/modify",
        data: {
          action: "setTitlePicture",
          titlePicture: imgSrc
        },
        success: function(data){
          if(data.success){

            // Remove existing labels
            $('.isTitlePicture').remove();

            var info = $('#image-thumb-' + String(imgSrc).replace(/\./g, "\\.")).find('.info');
            var isTitleElement = $('<p class="isTitlePicture">').html('<i class="icon checkmark box"></i>Current title picture');
            console.log(isTitleElement);
            isTitleElement.appendTo(info.find('.states').first());
          }else{
            console.log(data.message);
          }
        }
      });
    }

    // Delete single galery
    $('.setTitlePicture').click(function(){
      setTitlePicture($(this).data("id"));
    })


    $('#form-galery-info').submit(function(e){
      e.preventDefault();
    }).validate({
      submitHandler: function(form){
        submitFormData();
      }
    });
    // Validation of second form
    $('#form-images').submit(function(e){
      e.preventDefault();
    }).validate({
      submitHandler: function(form){	
        submitFormData();
      }
    });


    var submitFormData= function(){
      // Serialize data of all forms
      var galeryInfoData = JSON.stringify($("#form-galery-info").serializeObject());
      var imagesData = JSON.stringify($("#form-images").serializeObject());

      var galery_id = $('#galery-id').val();

      $.ajax({
        url: '/admin/galery/'+galery_id+'/modify',
        type: 'post',
        data: {
          formData: galeryInfoData,
          action: 'updateGaleryInfo'
        },
        success: function(data){
          if(data.success){
            $.ajax({
              url: '/admin/galery/'+galery_id+'/modify',
              type: 'post',
              data: {
                formData: imagesData,
                action: 'updateGaleryImages'
              },
              success: function(data){
                if(data.success){
                  $('.save.success.message')
                    .transition('fade right', '500ms')
                    .transition('fade right', '3000ms');
                }
                else{
                  $(".save.error.message")
                    .transition('fade right', '500ms')
                    .transition('fade right', '3000ms');
                }
              }
            });

          }else{
            $(".save.error.message")
              .transition('fade right', '500ms')
              .transition('fade right', '3000ms');
          }
        }
      });	
    }

    // Datepicker
    $( "input[id='date_of_play_string']" ).datepicker({
      changeMonth: true,
      changeYear: true,
      yearRange: '1997:'+(new Date).getFullYear(),
      altFormat: "yy-mm-dd",
      dateFormat:"DD, d. MM, yy",
      altField: "#date_of_play",
      onSelect: function(dateText) {
        //$('#form-new').valid();
      }
    });

    $.datepicker.setDefaults($.datepicker.regional["de"]);


    // Load tags
    var tagsString = $('#galery-tags').val();
    if(tagsString){
      $('.ui.dropdown').dropdown('set selected', tagsString); 
    }


    $(window).scroll(function() {

      // sticky save-changes segment
      if($('.images-list').offset().top + $('.images-list').height() > ($(window).scrollTop() + $(window).height()-$('#save-changes').outerHeight())){
        $('#save-changes').addClass("fixed");
        $('#save-changes').removeClass("basic");
      }else{
        $('#save-changes').addClass("basic");
        $('#save-changes').removeClass("fixed");
      }
    });


    // Hide progress bar initially
    $('.ui.progress').hide();



    // Initialize tab
    $('.menu .item').tab();

    // Initialize Dropdown
    $('.ui.dropdown').dropdown();

    // Initialize isfavorite toggle
    $('.ui.checkbox.isFavorite')
      .checkbox({
        onChecked: function(){
          var galery_id = $('#galery-id').val();
          $.ajax({
            method: 'post',
            url: '/admin/galery/'+galery_id+'/setFavorite',
            success: function(data){
              $('.ui.checkbox.isFavorite label').text("Show on home page");
            },
            error: function(err){
              $('.ui.checkbox.isFavorite').prop('checked', false);	
              console.log(err);
            }
          });
        },
        onUnchecked: function(){
          var galery_id = $('#galery-id').val();

          $.ajax({
            method: 'post',
            url: '/admin/galery/'+galery_id+'/unsetFavorite',
            success: function(data){
              $('.ui.checkbox.isFavorite label').text("Don't show on home page");
            },
            error: function(err){
              $('.ui.checkbox.isFavorite').prop('checked', true);	
              console.log(err);
            }
          });
        }
      });

    // Initialize isActive toggle
    $('.ui.checkbox.isActive')
      .checkbox({
        onChecked: function(){
          var galery_id = $('#galery-id').val();

          $.ajax({
            method: 'post',
            url: '/admin/galery/modify',
            data: {
              galeryId: galery_id,
              action: 'setActive'	
            },
            success: function(data){
              $('.ui.checkbox.isActive label').text("Currently active");
            },
            error: function(err){
              $('.ui.checkbox.isActive').prop('checked', false);	
              console.log(err);
            }
          });
        },
        onUnchecked: function(){
          var galery_id = $('#galery-id').val();

          $.ajax({
            method: 'post',
            url: '/admin/galery/modify',
            data: {
              galeryId: galery_id,
              action: 'setInactive'	
            },
            success: function(data){
              $('.ui.checkbox.isActive label').text("Currently inactive");
            },
            error: function(err){
              $('.ui.checkbox.isActive').prop('checked', true);	
              console.log(err);
            }
          });
        }
      });

    // Initialize checkbox
    if($('#is-active').val()){
      $('.ui.checkbox.isActive').checkbox('check');

    }else{

      $('.ui.checkbox.isFavorite').checkbox('check');
    }
  });
});


