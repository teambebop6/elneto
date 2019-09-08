var app = require('./globals');

app.then(function () {

  if ($('#init').val()) {
    $('#search-query').focus();
  }

  var bindGalleriesEvents = function () {

    require(['justifiedGallery'], function () {
      console.log("loaded justified galery");

      $('#albumList').justifiedGallery({
        rowHeight: 230,
        lastRow: 'nojustify',
        maxRowHeight: 380,
        randomize: false,
        margins: 30
      });
    });

  };

  bindGalleriesEvents();

  var resetGalleriesHtml = function (galleries) {

    let html = '';
    if (galleries) {
      galleries.forEach(function (gallery) {
        html = html + (
          `
                <a href="/galery/${gallery._id}" data-id="${gallery._id}">
        <img alt="${gallery.title}" src="${gallery.titlePicture}"/>
      </a>
          `
        )
      })
    }

    $('#albumList').html(html);
    bindGalleriesEvents();
  };

  $('#searchButton').on('click', function () {
    var keyword = $('#search-query').val();
    if (keyword) {
      window.location.href = `/query/galery?q=${keyword}`;
    }
  });

  // use timeout to avoid search too frequently
  var triggerOnChangeEvent;
  $('#search-query').on('input', function () {
    if (triggerOnChangeEvent) {
      clearTimeout(triggerOnChangeEvent);
    }
    var query = $(this).val();
    var qCond = query ? `?q=${query}` : '';
    triggerOnChangeEvent = setTimeout(function () {
      $.ajax({
        method: 'GET',
        url: `/query/plain/galery${qCond}`,
        success : function(result){
          resetGalleriesHtml(result.data);
        },
        error : function(xhr){
          console.error(xhr.status + " " + xhr.statusText);
        }
      })

    }, 500);
  });

});
