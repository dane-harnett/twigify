twigify
=======

`twigify` is a [Browserify](https://github.com/substack/node-browserify) transform for creating modules of pre-compiled [Twig.js](https://github.com/justjohn/twig.js) templates.

### Installation ###
With [`npm`](http://npmjs.org/) as a local development dependency:

```bash
npm install --save-dev twigify
```

### Usage ###

In `templates/test.twig`:
```html+twig
<h1>{{ title }}</h1>
```

In `test.js`:
```js
var template = require('./templates/test.twig');
var body = template.render({
  title: 'Main Page'
});
$('body').html(body);
```

Including sub templates:

In `templates/main.twig`:
```html+twig
<h1>{{ title }}</h1>
{% include 'body.twig' %}
```

In `main.js`:
```js
// need to require() this so that it is available for main.twig
var bodyTemplate = require('./templates/body.twig');
var mainTemplate = require('./templates/main.twig');

var page = mainTemplate.render({
  title: 'Main Page'
});
$('body').html(page);
```

#### Transforming with the command-line ####

```bash
browserify test.js -t twigify > test-bundle.js
```
