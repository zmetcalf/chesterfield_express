var assert = require('chai').assert,
    async = require('async'),
    mongoose = require('mongoose'),
    db_opts = require('../../../../config/db'),
    user_model = require('../../../../controllers/user/models/models'),
    studio_model = require('../../../../controllers/studio/models/models'),
    model = require('../../../../controllers/content/models/models');


describe('Is Unique Slug', function() {

  beforeEach(function(done) {

    if(!mongoose.connection.readyState) {
      mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
    }

    user_model.User.create({
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

          model.Content.create({
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
          model.Content.create({
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

        function(callback) {
          studio_model.Studio.create({
            title: 'Title',
            summary: 'Summary',
            content: 'Content',
            _author: user._id,
            published: true,
            seo_keywords: 'seo_key',
            seo_description: 'seo_descript',
            url_slug: 'foobar'
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
    var q = model.Content.remove({});
    q.exec();
    q = user_model.User.remove({});
    q.exec();
    q = studio_model.Studio.remove({});
    q.exec();
  });

  it('should return false - duplicate slug', function(done) {
    model.Content.findOne({ 'url_slug': 'bar' }, '_id', function(err, content_id) {
      model.Content.is_unique_slug('foo', String(content_id), function(err, is_unique) {
        if(err) return console.log(err);
        assert.isFalse(is_unique);
        done();
      });
    });
  });

  it('should return false - duplicate slug - other model', function(done) {
    model.Content.findOne({ 'url_slug': 'foobar' }, '_id', function(err, content_id) {
      model.Content.is_unique_slug('foo', String(content_id), function(err, is_unique) {
        if(err) return console.log(err);
        assert.isFalse(is_unique);
        done();
      });
    });
  });

  it('should return true - same content', function(done) {
    model.Content.findOne({ 'url_slug': 'foo' }, '_id', function(err, content) {
      model.Content.is_unique_slug('foo', String(content._id), function(err, is_unique) {
        if(err) return console.log(err);
        assert.isTrue(is_unique);
        done();
      });
    });
  });

  it('should return true - new content', function(done) {
    model.Content.is_unique_slug('goo', '', function(err, is_unique) {
      if(err) return console.log(err);
      assert.isTrue(is_unique);
      done();
    });
  });
});
