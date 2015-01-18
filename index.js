'use strict';

var twig    = require('twig').twig;
var through = require('through2');
var minify  = require('html-minifier').minify;

var ext = /\.(twig)$/;

var minifyDefaults = {
  removeComments: true,
  collapseWhitespace: true
};

function compile(id, str) {
  var minified = minify(str, minifyDefaults);

  var template = twig({ id: id, data: minified });

  var tokens = JSON.stringify(template.tokens)

  var includes = [];

  // create a list of includes
  for (var i = template.tokens.length - 1; i >= 0; i--) {
    if (template.tokens[i].type === 'logic') {
      if (template.tokens[i].token.type === 'Twig.logic.type.include') {
        // includes at this level must be relative to the current template file path
        includes.push(template.tokens[i].token.stack[0].value.replace('/templates/', './'));
      }
    }
  }

  return {
    includes: includes,
    // the id will be the filename and path relative to the require()ing module
    source: 'twig({ id: __filename,  data:' + tokens + ', precompiled: true, allowInlineIncludes: true })'
  };
}

function process(tpl) {
  // build a string that require()s all the sub templates
  var includeString = '';
  for (var i = tpl.includes.length - 1; i >= 0; i--) {
    includeString += 'require(\'' + tpl.includes[i] + '\');\n';
  }

  return (
    'var twig = require(\'twig\').twig;\n' +
    includeString +
    'module.exports = ' + tpl.source + ';\n'
  );
}

function twigify(file, opts) {
  if (!ext.test(file)) return through();
  if (!opts) opts = {};

  var id = file;
  // might pass a path via CLI to use for relative file paths
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
      compiledTwig = compile(id, str);
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
