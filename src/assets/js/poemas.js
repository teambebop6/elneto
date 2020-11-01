/**
 * Created by Henry Huang on 2019-07-08.
 */
var app = require("./globals");

var savePoemCollection = function (poemCollection) {
  $("#poemCollection").val(poemCollection)
}

var removePoemCollection = function () {
  $("#poemCollection").val("")
}

var savePoemGroup = function (poemGroup) {
  $("#poemGroup").val(poemGroup)
}

var removePoemGroup = function () {
  $("#poemGroup").val("")
}

var savePoemDetail = function (poemDetail) {
  $("#poemDetail").val(poemDetail)
}

var removePoemDetail = function () {
  $("#poemDetail").val("")
}

var changeDisplay = function (showPoemList) {
  if (showPoemList) {
    $('#yonny_poem_wrapper').show();
    $('#yonny_poem_wrapper_detail').hide();
  } else {
    $('#yonny_poem_wrapper').hide();
    $('#yonny_poem_wrapper_detail').show();
  }
  var scroll = $('#nav.menuBar.poemas').offset().top - 30;
  $('body, html').scrollTop(scroll);
};

app.then(function () {

  require('./yonny');

  var poemGroups = JSON.parse($('#poemGroups').val())

  var onPoemCollectionClick = function (poemCollection) {
    let poemGroup = []
    if (poemGroups && poemGroups.length > 0) {
      for (let i = 0; i < poemGroups.length; i++) {
        if (poemGroups[i]._id === poemCollection) {
          poemGroup = poemGroups[i].poems
          break
        }
      }
    }
    let poemGroupHTML = `<ul><li class="poemCollectionBackLink"><a>${poemCollection}</a></li>`
    poemGroup.forEach(p => {
      var poemHTML = `
      <li
          class="poemLink">
          <a 
             data-data="${escape(JSON.stringify(p))}"
          >
            ${p.title}
          </a>
        </li>
    `
      poemGroupHTML = poemGroupHTML + poemHTML
    })
    poemGroupHTML = poemGroupHTML + '</ul>'
    $('#poemList').html(poemGroupHTML)
    $('#poemCollections').toggle()
    $('#poemList').toggle()
    savePoemCollection(poemCollection)
    savePoemGroup(JSON.stringify(poemGroup))
    bindPoemsEvents();
  }

  var onPoemCollectionAClick = function () {
    const poemCollection = $(this).data('id')
    onPoemCollectionClick(poemCollection)
  }

  var onPoemCollectionABackLick = function () {
    $('#poemCollections').show()
    $('#poemList').hide()
    removePoemCollection()
    removePoemGroup()
  }

  var onPoemAClick = function (e) {
    e.preventDefault();
    var poemDetailData = $(this).data('data')
    var poemDetailUnEscaped = unescape(poemDetailData)
    var poemDetail = JSON.parse(poemDetailUnEscaped)

    savePoemDetail(poemDetailUnEscaped)

    $('#poemDetailTitle').text(poemDetail.title);
    $('#poemDetailContent').html(poemDetail.content);
    $('#poemDetailYear').text(poemDetail.year);
    $('#poemDetailAuthor').text(poemDetail.author);

    changeDisplay(false);
  }

  var bindPoemsEvents = function () {

    $('.poemCollectionBackLink a').on('click', onPoemCollectionABackLick)
    $('#yonny_poem_wrapper #poemList li.poemLink a').on('click', onPoemAClick);

    $('#backLink').on('click', function () {
      removePoemDetail();
      changeDisplay(true);
    })
  }

  $("#poemCollections a").on('click', onPoemCollectionAClick)

});
