var path = require('path');
var fs = require('fs');

var maskedKeys = ['SESSION_SECRET', 'ADMIN_PASSWORD', 'SMTP_PW']

var hide = function(key){
  var unmasked = ""
  if(key.length > 4){
    unmasked = key.substr(-2);
  }else if(key.length > 2){
    unmasked = key.substr(-2);
  }
  return "***" + unmasked
}

var printMasked = function(obj, indent="  "){
  Object.keys(obj).forEach(function(key){
    var value = maskedKeys.indexOf(key) > -1 ? hide(obj[key]) : obj[key];
    if(typeof(value) === "object"){
      console.log(indent+key + ": {");
      printMasked(value, indent+"  ");
      console.log(indent+"}");
    }else{
      console.log(indent+key + ": " + value + ", ");
    }
  })
}

exports.printMaskedConfig = function(config){
  console.log("\n-----");
  console.log("App config: \n");
  console.log("{");

  printMasked(config);

  console.log("}");
  console.log("-----\n");
}

