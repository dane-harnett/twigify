'use strict';

var twig    = require('twig').twig;
var through = require('through2');
var minify  = require('html-minifier').minify;

var ext = /\.(twig)$/;

var minifyDefaults = {
  removeComments: true,
  collapseWhitespace: true
};

function compileToObject(id, str) {
  var minified = minify(str, minifyDefaults);

  var template = twig({
    id: id,
    data: minified
  });

  var tokens = JSON.stringify(template.tokens);

  // the id will be the filename and path relative to the require()ing module
  return '{ id: __filename, path: __dirname, data:' + tokens + ', precompiled: true, allowInlineIncludes: true }';
}

function process(source, opts) {
  return (
    'var twig = require(\'twig\').twig;\n' +
    'var transform = ' + (opts.transform || 'function(x) { return x; }') + ';\n' +
    'module.exports = twig(transform(' + source + '));\n'
  );
}

function compile(id, str) {
  return 'twig(' + compileToObject(id, str) + ')';
}

function twigify(file, opts) {
  if (!ext.test(file)) return through();
  if (!opts) opts = {};

  var id = file;
  // @TODO: pass a path via CLI to use for relative file paths
  //opts.path ? file.replace(opts.path, '') : file;

  var buffers = [];

  function push(chunk, enc, next) {
    buffers.push(chunk);
    next();
  }

  function end(next) {
    var str = Buffer.concat(buffers).toString();
    var compiledTwig;

    try {
      compiledTwig = compileToObject(id, str);
    } catch(e) {
      return this.emit('error', e);
    }

    this.push(process(compiledTwig, opts));
    next();
  }

  return through(push, end);
}

module.exports = twigify;
module.exports.compile = compile;
