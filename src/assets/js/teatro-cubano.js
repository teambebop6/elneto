var app = require('./globals');

// load gallery style
//var galeryLess = require('../vendor/justifiedGallery/dist/css/justifiedGallery.css');
//var photoSwipeCss = require('../vendor/photoswipe/dist/default-skin/default-skin.css');
//var photoSwipeCss = require("../vendor/photoswipe/dist/photoswipe.css");

app.then(function(){
  
  var justifiedGallery = require(['justifiedGallery'], function(){
    console.log("loaded justified galery");

    $('#albumList').justifiedGallery({
      rowHeight : 230,
      lastRow : 'nojustify',
      maxRowHeight: 380,
      randomize: true,
      margins : 30
    });
  });

  // Search API
  $('.ui.search.teatro-cubano, .teatre-search').search({
    apiSettings: {
      onResponse: function(res) {
        var response = {
          results : [] 
        };

        // translate API response to work with search
        $.each(res.results, function(index, item) {
          var maxResults = 20;

          if(index >= maxResults) {
            return false;
          }

          // add result to category
          response.results.push({
            title: item.work + " (" + item.year + ")",
            description: "<span>Dirige: " + (item.author || "-") +"</span> \
              <span class='year'>Anio: " + (item.year || "") +"</span> \
              <span class='conductedBy'>Dirige: "+ (item.conductedBy || "") +"</span> \
              <span class='author'>Author(es)" + ": "+ (item.author || "") +"</span>" ,
          });
        });
        return response;
      }, 
      url: '/api/search?q={query}',
    },
    minCharacters : 3,
    onSelect: function(selectedItem){
      if(selectedItem){
        console.log(selectedItem.title)
        $('#search-query').val(selectedItem.title);
        $('#search-form').submit();
      }
    },
  });
});
