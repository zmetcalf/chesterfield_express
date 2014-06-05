var assert = require('chai').assert,
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
    user = require('../../../controllers/user/index');

mockgoose(mongoose);

describe('Unique User', function() {

  var model = require('../../../controllers/user/models/models');

  it('should create a default user', function() {
    model.User.findOne({ 'username': 'user' }, 'username',
      function(err, user) {
          if(err) return console.log(err);
          assert.equal(user.first_name, 'Test');
    });
  });
});
