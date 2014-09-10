var assert = require('chai').assert,
    async = require('async'),
    request = require('supertest'),
    hash = require('pwd').hash,
    mongoose = require('mongoose'),
    models = require('../../../models'),
    db_opts = require('../../../config/db');

if(!mongoose.connection.readyState) {
  mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
}

// DO NOT MOVE - WILL DELETE PRODUCTION DB
var app = require('../../../index');
var server = request.agent(app);
var csrf = '';

describe('Content Authentication', function() {
  beforeEach(function(done) {
    var user = null;
    var local_hash = '';
    var local_salt = '';

    async.series([
      function(callback) {
        hash('foobar', function(err, _salt, _hash) {
          if(err) return console.log(err);
          local_hash = _hash;
          local_salt = _salt;
          callback(null);
        });
      },

      function(callback) {
        models.User.create({
          first_name: 'Test',
          last_name: 'User',
          username: 'auth_user',
          is_staff: true,
          hash: local_hash,
          salt: local_salt
        }, function(err, new_user) {
          if(err) return console.log(err);
          user = new_user;
          callback(null, user);
        });
      },

      function(callback) {
        models.Content.create({
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
          callback(null, content);
        });
      },
    ], function(err, results) { done(); });
  });

  afterEach(function(done) {
    async.series([
      function(callback) {
        models.Content.remove({}).exec(callback);
      },
      function(callback) {
        models.User.remove({}).exec(callback);
      }
    ], function (err, results) { done(); });
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

    it('should redirect to /login after PUT', function(done) {
      async.series([
        function(callback) {
          server
            .get('/login')
            .end(function(err, res) {
              if(err) console.log(err);
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },
        function(callback) {
          server
          .put('/content/blog')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ title: 'tiTLE', _csrf: csrf })
          .expect('Location', '/login')
          .expect(302)
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
        }
      ],
      function(err, results) {
        done(err);
      });
    });

    it('should redirect to /login after POST', function(done) {
      async.series([
        function(callback) {
          server
            .get('/login')
            .end(function(err, res) {
              if(err) console.log(err);
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },
        function(callback) {
          server
          .put('/content/blog')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ title: 'tiTLE', _csrf: csrf })
          .expect('Location', '/login')
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

    it('should redirect to /login after DELETE', function(done) {
      async.series([
        function(callback) {
          server
            .get('/login')
            .end(function(err, res) {
              if(err) console.log(err);
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },
        function(callback) {
          server
          .delete('/content/blog')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ _csrf: csrf })
          .expect('Location', '/login')
          .expect(302)
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
        }
      ],
      function(err, results) {
        done(err);
      });
    });
  });

  describe('Authenticated', function() {
    beforeEach(function(done) {
      async.series([
        function(callback) {
          server
            .get('/login')
            .end(function(err, res) {
              if(err) console.log(err);
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },

        function(callback) {
          server
            .post('/login')
            .set('Content-Type', 'application/x-www-form-urlencoded')
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

    it('should get /contents', function(done) {
      server
      .get('/contents')
      .expect(200, done)
    });

    it('should get /content/blog', function(done) {
      server
      .get('/content/blog')
      .expect(200, done);
    });

    it('should get /content/blog/edit', function(done) {
      server
      .get('/content/blog/edit')
      .expect(200, done)
    });

    it('should get /create_content', function(done) {
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
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },
        function(callback) {
          server
          .put('/content/blog')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ title: 'tiTLE', _csrf: csrf })
          .expect(200, /tiTLE/)
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
        }
      ],
      function(err, results) {
        done(err);
      });
    });

    it('should POST', function(done) {
      async.series([
        function(callback) {
          server
            .get('/content/blog/edit')
            .end(function(err, res) {
              if(err) console.log(err);
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },
        function(callback) {
          server
          .put('/content/blog')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ title: 'tiTLE', _csrf: csrf })
          .expect(200, /tiTLE/)
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

    it('should DELETE', function(done) {
      async.series([
        function(callback) {
          server
            .get('/content/blog/edit')
            .end(function(err, res) {
              if(err) console.log(err);
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },
        function(callback) {
          server
          .delete('/content/blog')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ _csrf: csrf })
          .expect('Location', '/contents')
          .expect(302)
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
        }
      ],
      function(err, results) {
        done(err);
      });
    });

    it('should not edit with erroneous boolean', function(done) {
      // Confirming that mongoose validates before updating
      async.series([
        function(callback) {
          server
            .get('/content/blog/edit')
            .end(function(err, res) {
              if(err) console.log(err);
              csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1])
              callback(null);
          });
        },
        function(callback) {
          server
          .put('/content/blog')
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ title: 'tiTLE', published: 'tiTLE', _csrf: csrf })
          .expect(200, /Title/)
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
        }
      ],
      function(err, results) {
        models.Content.findOne({ url_slug: 'blog' }, 'published title',
          function(err, content) {
            if(err) return console.log(err);
            assert.equal(content.title, 'Title');
            assert.isTrue(content.published);
            done(err);
        });
      });
    });
  });

  describe('Cool URLs', function() {
    it('should get /blog', function(done) {
      server
      .get('/blog')
      .expect(200, done);
    });

    it('should still 404', function(done) {
      server
      .get('/badblog')
      .expect(404, done);
    });

    it('should still 404 with additional params', function(done) {
      server
      .get('/bad/blog')
      .expect(404, done);
    });
  });
});
