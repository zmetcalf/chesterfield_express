var assert = require('chai').assert,
    utils = require('../../lib/utils');

describe('Generates Passwords', function() {
  it('should create regular passwords', function() {
    utils.gen_password(function(err, password) {
      assert.isTrue(RegExp('[a-zA-Z0-9]').test(password));
    });
  });
});
