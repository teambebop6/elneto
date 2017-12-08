webpackJsonp([12],{

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

app = __webpack_require__(2);

app.then(function(){
  // Initialize UI
  $('.ui.dropdown').dropdown();
  $('.ui.error.message').hide();

  // Closing messages
  $('.message .close').on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade');
  });

  __webpack_require__.e/* require */(6).then(function() { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [__webpack_require__(5)]; ((function(){
    // Datepicker
    $( "input[id='date_of_play_string']" ).datepicker({
      changeMonth: true,
      changeYear: true,
      altFormat: "yy-mm-dd",
      dateFormat:"DD, d. MM, yy",
      altField: "#date_of_play",
      onSelect: function(dateText) {
        //$('#form-new').valid();
      }
    });

    $.datepicker.setDefaults($.datepicker.regional["de"]);
  }).apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));}).catch(__webpack_require__.oe);
});


__webpack_require__.e/* require */(3).then(function() { var __WEBPACK_AMD_REQUIRE_ARRAY__ = [__webpack_require__(4), __webpack_require__(23)]; ((function(){
  $('#form-new').validate({
    lang: 'de',
    rules: {
      title : {
        required: true
      }
    },
    submitHandler : function(form, event){
      event.preventDefault();

      $('button[type="submit"]').addClass('loading');
      $('button[type="submit"]').addClass('disabled');

      $.ajax({
        type: 'POST',
        url: '/admin/galery/new',
        data : $('#form-new').serialize(),
        success: function(result){
          if(result.success){
            window.location.href = "/admin/galery/" + result.galery_id + "/modify";
          }else{	
            $('.ui.error.message .message').html(result.message);
            $('.ui.error.message .header').html(result.header || "Error!");
            $('.ui.error.message').show();
            $('button[type="submit"]').removeClass('loading');
            $('button[type="submit"]').removeClass('disabled');
          }
        },
        error: function(err){
          $('.ui.error.message .message').html(err);
          $('.ui.error.message').show();
          $('button[type="submit"]').removeClass('loading');
          $('button[type="submit"]').removeClass('disabled');
        }
      });
    }
  });
}).apply(null, __WEBPACK_AMD_REQUIRE_ARRAY__));}).catch(__webpack_require__.oe);


/***/ })

},[17]);