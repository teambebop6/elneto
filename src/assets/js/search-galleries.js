var app = require('./globals');

app.then(function () {

  if ($('#init').val()) {
    $('#search-query').focus();
  }

  var bindGalleriesEvents = function () {

    require(['justifiedGallery'], function () {
      console.log("loaded justified galery");

      $('#albumList, #albumListCuadros, #albumListYonnyFotos').justifiedGallery(
        {
          rowHeight: 230,
          lastRow: 'nojustify',
          maxRowHeight: 380,
          randomize: false,
          margins: 30
        });

    });

  };

  bindGalleriesEvents();

  var resetGalleriesHtml = function (data) {

    var noResultHtml = '<h5 class="ui inverted header querySectionTitle" style="margin-bottom: 50px !important;">sin resultados</h5>';

    let html = '<h3 class="ui inverted header querySectionTitle querySectionTitleNoResult">Galeries</h3>';
    if (data.galleries) {
      html = html
        + '<div class="albums_wrapper justified-gallery" id="albumList">';
      data.galleries.forEach(function (gallery) {
        html = html + (
          `
                <a href="/galery/${gallery._id}" data-id="${gallery._id}">
        <img alt="${gallery.title}" src="${gallery.titlePicture}"/>
      </a>
          `
        )
      });
    } else {
      html = html + noResultHtml;
    }
    html = html + '</div>';
    $('#galeryContainer').html(html);

    let htmlCuadros = '<h3 class="ui inverted header querySectionTitle querySectionTitleNoResult">Sus Cuadros</h3>';
    if (data.cuadros) {
      htmlCuadros = htmlCuadros
        + '<div class="albums_wrapper justified-gallery" id="albumListCuadros">';
      data.cuadros.forEach(function (cuadro) {
        htmlCuadros = htmlCuadros + (
          `
                <a href="/yonny#id=cuadros_${cuadro.id}" data-id="${cuadro.id}">
        <img alt="${cuadro.title}" src="${cuadro.titlePicture}"/>
      </a>
          `
        )
      });
    } else {
      htmlCuadros = htmlCuadros + noResultHtml;
    }
    htmlCuadros = htmlCuadros + '</div>';
    $('#cuadrosContainer').html(htmlCuadros);

    let htmlYonnyFotos = '<h3 class="ui inverted header querySectionTitle">Yonny En Fotos</h3>';
    if (data.yonnyFotos) {
      htmlYonnyFotos = htmlYonnyFotos
        + '<div class="albums_wrapper justified-gallery" id="albumListYonnyFotos">';
      data.yonnyFotos.forEach(function (cuadro) {
        console.log(cuadro);
        htmlYonnyFotos = htmlYonnyFotos + (
          `
                <a href="/yonny/en-fotos#id=en_fotos_${cuadro.id}" data-id="${cuadro.id}">
        <img alt="${cuadro.title}" src="${cuadro.titlePicture}"/>
      </a>
          `
        )
      });
    } else {
      htmlYonnyFotos = htmlYonnyFotos + noResultHtml;
    }
    htmlYonnyFotos = htmlYonnyFotos + '</div>';
    $('#yonnyFotosContainer').html(htmlYonnyFotos);

    bindGalleriesEvents();
  };

  $('#searchButton').on('click', function () {
    var keyword = $('#search-query').val();
    if (keyword) {
      window.location.href = `/query?q=${keyword}`;
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
        url: `/query/plain${qCond}`,
        success: function (result) {
          resetGalleriesHtml(result.data);
        },
        error: function (xhr) {
          console.error(xhr.status + " " + xhr.statusText);
        }
      })

    }, 500);
  });

});
