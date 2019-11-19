var app = require('./globals');

var utils = require('../../../lib/helpers');

app.then(function(){

  $('.ui.checkbox').checkbox();

  // Refresh rollover events for thumbnails
  var refreshThumb = function(thumb){

    // Hide hidden content of yonny-foto thumbs
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
    var yonny_foto_id = $('#yonny-foto-id').val();

    console.log(yonny_foto_id);

    $('#fileupload').fileupload({
      dataType: 'json',
      formData: {yonny_foto_id: yonny_foto_id },
      sequentialUploads: true,
      disableImageResize: false,
      imageMaxWidth: 1177,
      imageMaxHeight: 1177,
      send: function (e, data) {
        console.log('before send');
        var tempId = utils.create_UUID();
        // 1. gen thumb html with temp id AND append to container
        var tempHtml = `<div id="${tempId}"></div>`;
        $('#sortable-yonny-foto-images').append(tempHtml);
        // 2. set temp id in header to backend
        data.headers = {
          tempId: tempId
        };
        console.log(`TempId from front-end ${tempId}`);
        return true;
      },
      done: function(e, data){

        console.log(data.result);
        var tempId = data.result.tempId;
        console.log(`from backend tempId is ${tempId}`);

        $.get("/admin/yonny-fotos/getThumbTemplate?link=" + data.result.thumbUrl + "&id=" + data.result.id, function(data){
          var thumb = $('<div/>').html(data).find('> div');
          refreshThumb(thumb); // Bind mouseover events
          // thumb.appendTo($('.images-list'));
          $(`#${tempId}`).replaceWith(thumb);
        });

        $('.ui.progress').hide();
        $('.no-images-yet-message').hide();
      },
      // stop: function(e){
      //   d = new Date();
      //   $.each($('.images-list').find('.image-thumb'), function(index, element){
      //     var path = $(element).attr("id").substr(12); // cut off image-thumb- in order to get path
      //     var imgElement = $(element).find('img');
      //     imgElement.attr("src", '/uploads/thumbs/' + path + "?t=" + d.getTime());
      //   });
      // },
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

      var yonny_id = $('#yonny-foto-id').val();
      confirmDelete.modal({
        onApprove : function() {
          $.ajax({
            method: 'POST',
            url: '/admin/yonny-fotos/delete-photo/' + yonny_id,
            data: { id: id },
            success : function(data, textStatus, xhr){
              if(xhr.status === 200){
                console.log('#yonny-foto-thumb-' + String(id));
                $('#yonny-foto-thumb-' + String(id)).hide();
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

    // Delete single yonny-foto
    $('.deletePicture').click(function(){
      deletePicture($(this).data("id"));
    });

    $('#form-yonny-foto-info').submit(function(e){
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
      var yonnyFotoInfoData = JSON.stringify($("#form-yonny-foto-info").serializeObject());

      var imagesArray = [];

      $.each($('#form-images').find('.yonny-foto-thumb-element'), function(i, yf_el){
        var el = { id: $(yf_el).data("id") };
        console.log(el);
        $.extend(el, $(yf_el).find("input,textarea").serializeObject());
        imagesArray.push(el);
      });

      console.log(JSON.stringify(imagesArray, null, 2));

      var yf_id = $('#yonny-foto-id').val();

      $.ajax({
        url: '/admin/yonny-fotos/modify/' + yf_id,
        type: 'POST',
        data: {
          formData: yonnyFotoInfoData,
          action: 'updateYonnyFotoInfo'
        },
        success: function(data){
          if(data.success){
            $.ajax({
              url: '/admin/yonny-fotos/modify/' + yf_id,
              type: 'POST',
              data: {
                formData: JSON.stringify(imagesArray),
                action: 'updateYonnyFotoPhotos'
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
      var el = document.getElementById('sortable-yonny-foto-images');
      var sortable = Sortable.create(el);
    });

  });
});


