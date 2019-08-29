var app = require('./globals');

var utils = require('../../../lib/helpers');

var moment = require('moment');

app.then(function(){

  $('.ui.checkbox').checkbox();

  // Refresh rollover events for thumbnails
  var refreshThumb = function(thumb){

    // Hide hidden content of cuadro thumbs
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
  };

  $('.image-thumb').each(function(){
    refreshThumb($(this));
  });

  require(['jquery.fileupload'], function(){
    // Fileupload
    var cuadro_id = $('#cuadro-id').val();

    console.log(cuadro_id);
    console.log("asdasd");

    $('#fileupload').fileupload({
      dataType: 'json',
      formData: {cuadro_id: cuadro_id },
      sequentialUploads: true,
      disableImageResize: false,
      imageMaxWidth: 1177,
      imageMaxHeight: 1177,
      sequentialUploads: true,
      done: function(e, data){

        console.log(data.result.files);

        $.each(data.result.files, function(index, file){

          $.get("/admin/cuadros/getThumbTemplate?link=" + file.name, function(data){
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
          imgElement.attr("src", '/uploads/thumbs/' + path + "?t=" + d.getTime());
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

    var deletePicture = function(id){
      var confirmDelete = $('#confirmDeleteModal').clone()
        .html($('#confirmDeleteModal').html().replace(/###placeholder###/g,
          "this picture")
        );

      var cuadro_id = $('#cuadro-id').val();
      confirmDelete.modal({
        onApprove : function() {
          $.ajax({
            method: 'POST',
            url: '/admin/cuadros/delete-photo/' + cuadro_id,
            data: { id: id },
            success : function(data, textStatus, xhr){
              if(xhr.status === 200){
                $('#cuadro-thumb-' + String(id).replace(/\./g, "\\.")).hide();
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

    // Delete single cuadro
    $('.deletePicture').click(function(){
      deletePicture($(this).data("id"));
    });

    $('#form-cuadro-info').submit(function(e){
      e.preventDefault();
      console.log("???!!!")
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
      var cuadroInfoData = JSON.stringify($("#form-cuadro-info").serializeObject());

      var imagesArray = [];

      $.each($('#form-images').find('.cuadro-thumb-element'), function(i, cuadro_el){
        var el = { id: $(cuadro_el).data("id") };
        $.extend(el, $(cuadro_el).find("input,textarea").serializeObject());
        imagesArray.push(el);
      });

      console.log(imagesArray);

      var cuadro_id = $('#cuadro-id').val();

      $.ajax({
        url: '/admin/cuadros/modify/' + cuadro_id,
        type: 'POST',
        data: {
          formData: cuadroInfoData,
          action: 'updateCuadroInfo'
        },
        success: function(data){
          if(data.success){
            $.ajax({
              url: '/admin/cuadros/modify/' + cuadro_id,
              type: 'POST',
              data: {
                formData: JSON.stringify(imagesArray),
                action: 'updateCuadroPhotos'
              },
              success: function(data){
                if(data.success){
                  $('.save.success.message')
                    .transition('fade right', '500ms')
                    .transition('fade right', '3000ms');
                } else{
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
    };


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

    require(['sortable'], function(Sortable){
      var el = document.getElementById('sortable-cuadro-images');
      var sortable = Sortable.create(el);
    });

  });
});


