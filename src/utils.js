var tv4 = require('tv4');

//format uri  
var validUrl = require('valid-url');
tv4.addFormat('uri', function (data, schema) {

  if (typeof data == 'string') {
    //modified to accept query strings
    var val = data.split('?');

    if (validUrl.isUri(val[0])) {
      //No errors
      return null;
    }
  }
  // return error message
  return 'value must be a URI';
});

module.exports.tv4 = tv4;