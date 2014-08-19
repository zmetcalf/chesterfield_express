var assert = require('chai').assert,
    async = require('async'),
    mongoose = require('mongoose'),
    models = require('../../models'),
    db_opts = require('../../config/db'),
    utils = require('../../lib/utils');

describe('Generates Passwords', function() {
  it('should create regular passwords', function() {
    utils.gen_password(function(err, password) {
      assert.isTrue(RegExp('[a-zA-Z0-9]').test(password));
    });
  });
});

describe('Routes Cool Urls', function() {
  beforeEach(function(done) {

    if(!mongoose.connection.readyState) {
      mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
    }

    models.User.create({
      first_name: 'Test',
      last_name: 'User',
      username: 'content_user',
      is_staff: true,
      hash: '',
      salt: ''
    }, function(err, user) {
      if(err) return console.log(err);

      async.parallel([
        function(callback) {

          models.Content.create({
            title: 'Title',
            summary: 'Summary',
            content: 'Content',
            published: true,
            _author: user._id,
            seo_keywords: 'seo_key',
            seo_description: 'seo_descript',
            url_slug: 'foo'
          }, function(err, content) {
            if(err) return console.log(err);
            callback(null);
          });
        },

        function(callback) {
          models.Studio.create({
            title: 'Title',
            summary: 'Summary',
            content: 'Content',
            _author: user._id,
            published: true,
            seo_keywords: 'seo_key',
            seo_description: 'seo_descript',
            url_slug: 'bar'
          }, function(err, content) {
            if(err) return console.log(err);
            callback(null);
          });
        },
      ],

      function(err, results) {
        done();
      });
    });
  });

  afterEach(function() {
    var q = models.Content.remove({});
    q.exec();
    q = models.User.remove({});
    q.exec();
    q = models.Studio.remove({});
    q.exec();
  });

  it('should get cool url in content', function(done) {
    utils.get_cool_url('foo', function(err, controller) {
      assert.deepEqual(controller, 'Content');
      done();
    });
  });

  it('should get cool url in studio', function(done) {
    utils.get_cool_url('bar', function(err, controller) {
      assert.deepEqual(controller, 'Studio');
      done();
    });
  });

  it('should fail to get cool url', function(done) {
    utils.get_cool_url('foobar', function(err, controller) {
      assert.isUndefined(controller);
      done();
    });
  });
});
