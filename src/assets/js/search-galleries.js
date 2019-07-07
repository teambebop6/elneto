var app = require('./globals');

app.then(function () {

  if ($('#init').val()) {
    $('#search-query').focus();
  }

  var justifiedGallery = require(['justifiedGallery'], function () {
    console.log("loaded justified galery");

    $('#albumList').justifiedGallery({
      rowHeight: 230,
      lastRow: 'nojustify',
      maxRowHeight: 380,
      randomize: false,
      margins: 30
    });
  });

  $('#searchButton').on('click', function () {
    var keyword = $('#searchField').val();
    if (keyword) {
      var url = `/categories/search-galleries/${keyword}`;
      window.location.href = url;
    }
  });

  $('.ui.search.teatro-cubano, .teatre-search').search({
    apiSettings: {
      onResponse: function(res) {

        $('#noResult').hide();

        var response = {
          results : []
        };

        // translate API response to work with search
        if (res.data) {
          $.each(res.data, function(index, item) {
            var maxResults = 20;

            if(index >= maxResults) {
              return false;
            }

            // add result to category
            response.results.push({
              title: item.title
            });
          });
        }
        return response;
      },
      url: '/categories/search?keyword={query}',
    },
    minCharacters : 1,
    onSelect: function(selectedItem){
      if(selectedItem){
        console.log(selectedItem.title)
        var url = `/categories/search-galleries/${selectedItem.title}`;
        window.location.href = url;
      }
    },
  });

});
