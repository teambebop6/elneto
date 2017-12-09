webpackJsonp([6],{

/***/ 18:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(28);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(24)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./jcarousel.basic.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/less-loader/dist/cjs.js!./jcarousel.basic.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 28:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)(undefined);
// imports


// module
exports.push([module.i, ".jcarousel-wrapper {\n  margin: 0 auto 0;\n  position: relative;\n  width: 540px;\n}\n.jcarousel-wrapper .photo-credits {\n  position: absolute;\n  right: 15px;\n  bottom: 0;\n  font-size: 13px;\n  color: #fff;\n  text-shadow: 0 0 1px rgba(0, 0, 0, 0.85);\n  opacity: .66;\n}\n.jcarousel-wrapper .photo-credits a {\n  color: #fff;\n}\n/** Carousel **/\n.jcarousel {\n  position: relative;\n  overflow: hidden;\n  height: 100%;\n}\n.jcarousel ul {\n  width: 20000em;\n  position: relative;\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n.jcarousel ul li img {\n  width: 540px;\n}\n.jcarousel li {\n  float: left;\n}\n/** Carousel Controls **/\n.jcarousel-control-prev,\n.jcarousel-control-next {\n  position: absolute;\n  top: 200px;\n  width: 30px;\n  height: 30px;\n  text-align: center;\n  background: #4E443C;\n  color: #fff !important;\n  text-decoration: none;\n  text-shadow: 0 0 1px #000;\n  font: 24px/27px Arial, sans-serif;\n  -webkit-border-radius: 30px;\n  -moz-border-radius: 30px;\n  border-radius: 30px;\n  -webkit-box-shadow: 0 0 2px #999;\n  -moz-box-shadow: 0 0 2px #999;\n  box-shadow: 0 0 2px #999;\n}\n.jcarousel-control-prev {\n  left: -50px;\n}\n.jcarousel-control-next {\n  right: -50px;\n}\n.jcarousel-control-prev:hover span,\n.jcarousel-control-next:hover span {\n  display: block;\n}\n.jcarousel-control-prev.inactive,\n.jcarousel-control-next.inactive {\n  opacity: .5;\n  cursor: default;\n}\n/** Carousel Pagination **/\n.jcarousel-pagination {\n  position: absolute;\n  bottom: 0;\n  left: 15px;\n  margin-bottom: 1rem !important;\n}\n.jcarousel-pagination a {\n  text-decoration: none;\n  display: inline-block;\n  font-size: 11px;\n  line-height: 14px;\n  min-width: 20px;\n  background: #fff;\n  color: #4E443C;\n  border-radius: 14px;\n  padding: 3px;\n  text-align: center;\n  margin-right: 2px;\n  opacity: .75;\n}\n.jcarousel-pagination a.active {\n  background: #4E443C;\n  color: #fff;\n  opacity: 1;\n  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.75);\n}\n", ""]);

// exports


/***/ })

});