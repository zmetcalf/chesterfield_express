var assert = require('chai').assert,
    mongoose = require('mongoose'),
    db_opts = require('../../../../config/db'),
    model = require('../../../../controllers/user/models/models');

describe('Is Unique User', function() {

  beforeEach(function(done) {

    if(!mongoose.connection.readyState) {
      mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
    }

    model.User.create({
      first_name: "Foo",
      last_name: "Bar",
      username: 'foobar',
      is_staff: false,
      hash: '',
      salt: ''
    }, function(err, new_user) {
      if(err) return console.log(err);
      done();
    });
  });

  afterEach(function() {
    var q = model.User.remove({});
    q.exec();
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
