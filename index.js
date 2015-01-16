'use strict';

var twig    = require('twig').twig;
var through = require('through2');
var minify  = require('html-minifier').minify;

var ext = /\.(twig)$/;

var minifyDefaults = {
  removeComments: true,
  collapseWhitespace: true
};

function compile(str) {
  var minified = minify(str, minifyDefaults);

  var template = twig({ data: minified });

  var tokens = JSON.stringify(template.tokens)

  return 'twig({ data:' + tokens + ', precompiled: true })';
}

function process(source) {
  return (
    'var twig = require(\'twig\');\n' +
    'module.exports = function(data) { return ' + source + '.render(data) };\n'
  );
}

function twigify(file) {
  if (!ext.test(file)) return through();

  var buffers = [];

  function push(chunk, enc, next) {
    buffers.push(chunk);
    next();
  }

  function end(next) {
    var str = Buffer.concat(buffers).toString();
    var compiledTwig;

    try {
      compiledTwig = compile(str);
    } catch(e) {
      return this.emit('error', e);
    }

    this.push(process(compiledTwig));
    next();
  }

  return through(push, end);
}

module.exports = twigify;
module.exports.compile = compile;
