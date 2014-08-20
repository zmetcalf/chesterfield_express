var assert = require('chai').assert,
    async = require('async'),
    mongoose = require('mongoose'),
    db_opts = require('../config/db'),
    models = require('../models');

describe('Is Unique User', function() {

  beforeEach(function(done) {

    if(!mongoose.connection.readyState) {
      mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
    }

    models.User.create({
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
    var q = models.User.remove({});
    q.exec();
  });

  it('should return false - duplicate username', function(done) {
    models.User.is_unique_user('foobar', function(err, is_unique) {
      if(err) return console.log(err);
      assert.isFalse(is_unique);
      done();
    });
  });

  it('should return true', function(done) {
    models.User.is_unique_user('barfoo', function(err, is_unique) {
      if(err) return console.log(err);
      assert.isTrue(is_unique);
      done();
    });
  });
});


describe('Is Unique Slug', function() {

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
          models.Content.create({
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
          models.Studio.create({
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
    var q = models.Content.remove({});
    q.exec();
    q = models.User.remove({});
    q.exec();
    q = models.Studio.remove({});
    q.exec();
  });

  it('should return false - duplicate slug', function(done) {
    models.Content.findOne({ 'url_slug': 'bar' }, '_id', function(err, content_id) {
      models.Content.is_unique_slug('foo', String(content_id), function(err, is_unique) {
        if(err) return console.log(err);
        assert.isFalse(is_unique);
        done();
      });
    });
  });

  it('should return false - duplicate slug - other model', function(done) {
    models.Content.findOne({ 'url_slug': 'foobar' }, '_id', function(err, content_id) {
      models.Content.is_unique_slug('foo', String(content_id), function(err, is_unique) {
        if(err) return console.log(err);
        assert.isFalse(is_unique);
        done();
      });
    });
  });

  it('should return true - same content', function(done) {
    models.Content.findOne({ 'url_slug': 'foo' }, '_id', function(err, content) {
      models.Content.is_unique_slug('foo', String(content._id), function(err, is_unique) {
        if(err) return console.log(err);
        assert.isTrue(is_unique);
        done();
      });
    });
  });

  it('should return true - new content', function(done) {
    models.Content.is_unique_slug('goo', '', function(err, is_unique) {
      if(err) return console.log(err);
      assert.isTrue(is_unique);
      done();
    });
  });
});
