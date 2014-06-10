var assert = require('chai').assert,
    async = require('async'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    cheerio = require('cheerio'),
    user_model = require('../../../controllers/user/models/models'),
    model = require('../../../controllers/content/models/models');
    db_opts = require('../../../config/db');

if(!mongoose.connection.readyState) {
  mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
}

// DO NOT MOVE - WILL DELETE PRODUCTION DB
var app = require('../../../index');

describe('Content Authentication', function() {
  beforeEach(function(done) {
    user_model.User.create({
      first_name: 'Test',
      last_name: 'User',
      username: 'auth_user',
      is_staff: true,
      hash: 'fpIO7HOtq3FsYAOW9giPQAqfm0QXhB1tR7RDv9RVrch2wKURPlUJUg4YZmfISdXW1nzUP+P1ZXA6xIxQLrHldAC2WVfj7HrAOeERleGmIRxc4Jb0hCE9ObKLQa9rQZKfGJf9EhW+vunWAujXdt+bfAqj2px7oIhqFdPCN1guIhg=',
      salt: 'WlSDOruUy6E+o3KPr/QbzHaAGa4+25+07TzIyhZj5tkANxal0Slx47CpLZo9FbvH59lys4SOqyDQwjbtbVstMqzcLkcoaMD/2tr51CIlkjsy5Wr38W7aNx8PXPT/JcV31cZBBBs95MeOBXeJc6FKuuqTU55U3p0gOp4MzUKeReg='
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
      .send({ title: 'tiTLE'})
      .expect(500, done)
    });

    it('should fail to POST', function(done) {
      request(app)
      .put('/content/blog')
      .send({ title: 'tiTLE'})
      .expect(500, done)
    });

    it('should fail to DELETE', function(done) {
      request(app)
      .delete('/content/blog')
      .expect(500, done)
    });
  });

  describe('Authenticated', function() {
    var server = request.agent(app);
    var csrf = '';

    beforeEach(function(done) {
      async.series([
        function(callback) {
          server
            .get('/login')
            .end(function(err, res) {
              if(err) console.log(err);
              var $ = cheerio.load(res.text);
              csrf = $('input[name="_csrf"]').val();
              callback(null);
          });
        },

        function(callback) {
          server
            .post('/login')
            .send({ username: 'auth_user', password: 'foobar', _csrf: csrf })
            .end(function(err, res) {
              if(err) console.log(err);
              callback(null);
            });
        },
      ],

      function(err, results) {
        done();
      });
    });

    afterEach(function(done) {
      server
      .post('/logout')
      .end(function(err, res) {
        if(err) console.log(err);
        done();
        });
    });

    it('should redirect to /login from /contents', function(done) {
      server
      .get('/contents')
      .expect(200, done)
    });

    it('should show /content/blog', function(done) {
      server
      .get('/content/blog')
      .expect(200, done);
    });

    it('should redirect to /login from /content/blog/edit', function(done) {
      server
      .get('/content/blog/edit')
      .expect(200, done)
    });

    it('should redirect to /login from /create_content', function(done) {
      server
      .get('/create_content')
      .expect(200, done)
    });

    it('should PUT', function(done) {
      async.series([
        function(callback) {
          server
            .get('/content/blog/edit')
            .end(function(err, res) {
              if(err) console.log(err);
              var $ = cheerio.load(res.text);
              csrf = $('input[name="_csrf"]').val();
              callback(null);
          });
        },
        function(callback) {
          server
          .put('/content/blog')
          .send({ title: 'tiTLE', _csrf: csrf })
          .expect(302)
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
        }
      ],
      function(err, results) {
        done();
      });
    });

    it('should POST', function(done) {
      async.series([
        function(callback) {
          server
            .get('/content/blog/edit')
            .end(function(err, res) {
              if(err) console.log(err);
              var $ = cheerio.load(res.text);
              csrf = $('input[name="_csrf"]').val();
              callback(null);
          });
        },
        function(callback) {
          server
          .put('/content/blog')
          .send({ title: 'tiTLE', _csrf: csrf})
          .expect(302)
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
        }
      ],
      function(err, results) {
        done();
      });
    });

    it.skip('should DELETE', function(done) {
      request(app)
      .delete('/content/blog')
      .expect(302, done)
    });
  });
});
