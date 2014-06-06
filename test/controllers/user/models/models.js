var assert = require('chai').assert,
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
    user = require('../../../../controllers/user/index');

mockgoose(mongoose);

describe('Generate Users', function() {

  var model = require('../../../../controllers/user/models/models');

  it('should create a default user', function() {
    model.User.findOne({ 'username': 'user' }, 'username',
      function(err, user) {
          if(err) return console.log(err);
          assert.equal(user.first_name, 'Test');
    });
  });
});

describe('Is Unique User', function() {

  var model = require('../../../../controllers/user/models/models');

  model.User.create({
    first_name: "Foo",
    last_name: "Bar",
    username: 'foobar',
    is_staff: false,
    hash: '',
    salt: ''
  }, function(err, new_user) {
    if(err) return console.log(err);
  });

  it('should return false - duplicate username', function() {
    model.User.is_unique_user('foobar', function(err, is_unique) {
      if(err) return console.log(err);
      assert.isFalse(is_unique);
    });
  });

  it('should return true', function() {
    model.User.is_unique_user('barfoo', function(err, is_unique) {
      if(err) return console.log(err);
      assert.isTrue(is_unique);
    });
  });
});
