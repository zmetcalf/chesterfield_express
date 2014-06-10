var assert = require('chai').assert,
    request = require('supertest'),
    mongoose = require('mongoose'),
    user_model = require('../../../controllers/user/models/models'),
    model = require('../../../controllers/content/models/models');
    db_opts = require('../../../config/db');

if(!mongoose.connection.readyState) {
  mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
}

var app = require('../../../');

describe('Content Authentication', function() {
  beforeEach(function(done) {
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
        url_slug: 'blog'
      }, function(err, content) {
        if(err) return console.log(err);
        done();
      });
    });
  });

  afterEach(function() {
    var q = model.Content.remove({});
    q.exec();
    q = user_model.User.remove({});
    q.exec();
  });

  describe('Unauthenticated', function() {
    it('should redirect to /login from /contents', function(done) {
      request(app)
      .get('/contents')
      .expect('Location', '/login')
      .expect(302, done)
    });

    it('should show /content/blog', function(done) {
      request(app)
      .get('/content/blog')
      .expect(200, done);
    });

    it('should redirect to /login from /content/blog/edit', function(done) {
      request(app)
      .get('/content/blog/edit')
      .expect('Location', '/login')
      .expect(302, done)
    });

    it('should redirect to /login from /create_content', function(done) {
      request(app)
      .get('/create_content')
      .expect('Location', '/login')
      .expect(302, done)
    });

    it('should fail to PUT', function(done) {
      request(app)
      .put('/content/blog')
      .send({ title: 'tiTLE' })
      .expect(500, done)
    });

    it('should fail to POST', function(done) {
      request(app)
      .put('/content/blog')
      .send({ title: 'tiTLE' })
      .expect(500, done)
    });

    it('should fail to DELETE', function(done) {
      request(app)
      .delete('/content/blog')
      .expect(500, done)
    });
  });
});
