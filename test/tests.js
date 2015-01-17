var should  = require('should'),
    twigify = require('../twigify'),
    twig    = require('twig').twig;

/**
 * use this in the tests to render the returned string from Twigify into a Twig
 * rendered string, with optionally your Object containing the variables that your
 * Twig template requires
 * @param  {String} twigifyRender       String that Twigify returns, that you need
 *                                      to render still
 * @param  {Object} twigVars            (Optional) Any variables within an Object that your
 *                                      template requires
 * @return {String}                     rendered Twig template as a string
 */
var render = function(twigifyRender, twigVars) {
  // Create an empty object if we're passed no twigVars
  twigVars = twigVars || {};

  // eval the Twigify string and then use Twig to render it
  return eval(twigifyRender).render(twigVars);
};

describe('Twigify', function() {
  describe('#twigify()', function() {
    it('should describe what the function does', function() {
      twigify();
    });
  });

  describe('#process()', function() {
    it('should describe what the function does', function() {
    });
  });

  describe('#twigify()', function() {
    it ('should be a function', function() {
      twigify.should.be.an.instanceOf(Function);
    });
    it('should render templates minified', function() {
      var testMe = twigify.compile('a       bc');
      testMe = render(testMe);

      testMe.should.equal('a bc');
    });

  });

  describe('#compile()', function() {
    it('should return a minified version of the input', function() {

    });
  });
});
