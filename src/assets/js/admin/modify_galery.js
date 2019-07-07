var app = require('./globals');

var utils = require('../../../lib/helpers');

var moment = require('moment');

require('../../vendor/datepicker/dist/datepicker.min.css');

app.then(function(){

  $('#categories').dropdown({
    allowAdditions: true,
  });

  var catString = $('#galery-categories').val();
  var categories = catString.split(",");
  $('#categories').dropdown('set selected', categories);

  // Datepicker
  require(['datepicker'], function(){
    console.log("loaded datepicker.");
    // Datepicker
    var picker = $('#date_of_play_string');

    var dateofplay = $('#date_of_play').val();

    console.log(dateofplay);

    dateFormat = "DD | MM | yyyy";

    picker.datepicker({
      format: dateFormat,
      date: moment.utc(dateofplay).format(),
    });
    $(picker).on('pick.datepicker', function (e) {
      $('#date_of_play').val(moment(e.date).format('L'));
    });
  });


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

        console.log(data.result.files)

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

      var imagesArray = [];

      $.each($('#form-images').find('.galery-thumb-element'), function(i, galery_el){
        var el = { id: $(galery_el).data("id") };
        $.extend(el, $(galery_el).find("input").serializeObject());
        imagesArray.push(el);
      });

      console.log(imagesArray);

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
                formData: JSON.stringify(imagesArray),
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



    // Initialize Dropdown
    $('.ui.dropdown.tags').dropdown();

    // Load tags
    var tagsString = $('#galery-tags').val();
    var tags = tagsString.split(",");
    $('.ui.dropdown.tags').dropdown('set selected', tags);


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

    // Initialize checkboxes
    if($('#is-active').val() == "true"){
      $('.ui.checkbox.isActive').checkbox('check');
    }
    if($('#is-favorite').val() == "true"){
      $('.ui.checkbox.isFavorite').checkbox('check');
    }

    // Add checkbox events
    $('.ui.checkbox.isFavorite')
      .checkbox({
        onChecked: function(){
          console.log("Checked event called/")
          var galery_id = $('#galery-id').val();
          $.ajax({
            method: 'post',
            url: '/admin/galery/'+galery_id+'/setFavorite',
            success: function(data){
              $('.ui.checkbox.isFavorite label').text("Displayed on home page");
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
              $('.ui.checkbox.isFavorite label').text("Not displayed on home page");
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
              $('.ui.checkbox.isActive label').text("Active");
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
              $('.ui.checkbox.isActive label').text("Inactive");
            },
            error: function(err){
              $('.ui.checkbox.isActive').prop('checked', true);
              console.log(err);
            }
          });
        }
      });

    require(['sortable'], function(Sortable){
      var el = document.getElementById('sortable-galery-images');
      var sortable = Sortable.create(el);
    });

  });
});


