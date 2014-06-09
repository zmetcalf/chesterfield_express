var assert = require('chai').assert,
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose');

mockgoose(mongoose);

describe('Is Unique Slug', function() {

  var user_model = require('../../../../controllers/user/models/models');
  var model = require('../../../../controllers/content/models/models');

  user_model.User.create({
    first_name: 'Test',
    last_name: 'User',
    username: 'content_user',
    is_staff: true,
    hash: '',
    salt: ''
  }, function(err, user) {
    if(err) return console.log(err);

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
    });

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
    });
  });

  it('should return false - duplicate slug', function(done) {
    model.Content.findOne({ 'url_slug': 'bar' }, '_id', function(err, content_id) {
      model.Content.is_unique_slug('foo', content_id, function(err, is_unique) {
        if(err) return console.log(err);
        assert.isFalse(is_unique);
        done();
      });
    });
  });

  it('should return true - same content', function(done) {
    model.Content.findOne({ 'url_slug': 'foo' }, '_id', function(err, content) {
      model.Content.is_unique_slug('foo', content._id, function(err, is_unique) {
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
