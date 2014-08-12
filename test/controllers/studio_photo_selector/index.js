var assert = require('chai').assert,
    async = require('async'),
    hash = require('pwd').hash,
    cheerio = require('cheerio'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    db_opts = require('../../../config/db'),
    user_model = require('../../../controllers/user/models/models'),
    photo_model = require('../../../controllers/photo/models/models'),
    model = require('../../../controllers/studio/models/models');

if(!mongoose.connection.readyState) {
  mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
}

// DO NOT MOVE - WILL DELETE PRODUCTION DB
var app = require('../../../index');
var server = request.agent(app);
var csrf = '';

describe('Studio Photo Selector', function() {
  var photo_one = null;
  var photo_two = null;

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
        user_model.User.create({
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
        photo_model.Photo.create({
          title: 'Photo One',
          description: 'Desc1',
          published: true,
          path: 'asdf',
          _author: user
        }, function(err, photo) {
          if(err) return console.log(err);
          photo_one = photo;
          callback(null, photo);
        });
      },

      function(callback) {
        photo_model.Photo.create({
          title: 'Photo Two',
          description: 'Desc2',
          published: true,
          path: 'qwer',
          _author: user
        }, function(err, photo) {
          if(err) return console.log(err);
          photo_two = photo;
          callback(null, photo);
        });
      },

      function(callback) {
        model.Studio.create({
          title: 'Title',
          description: 'Description',
          published: true,
          _author: user._id,
          seo_keywords: 'seo_key',
          seo_description: 'seo_descript',
          url_slug: 'studio',
          _photos: [ photo_one, photo_two ]
        }, function(err, content) {
          if(err) return console.log(err);
          callback(null, content);
        });
      },

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
          .set('Content-Type', 'application/x-www-form-urlencoded')
          .send({ username: 'auth_user', password: 'foobar', _csrf: csrf })
          .end(function(err, res) {
            if(err) console.log(err);
            callback(null);
          });
      },
    ], function(err, results) { done(); });
  });

  afterEach(function(done) {
    async.series([
      function(callback) {
        model.Studio.remove({}).exec(callback);
      },
      function(callback) {
        user_model.User.remove({}).exec(callback);
      },
      function(callback) {
        photo_model.Photo.remove({}).exec(callback);
      },
      function(callback) {
        server
        .post('/logout')
        .end(function(err, res) {
          if(err) console.log(err);
          callback(null);
        });
      }
    ], function (err, results) { done(); });
  });

  it('should return assigned photos', function(done) {
    model.Studio.findOne({ url_slug: 'studio' }, function(err, studio) {
      if (err) return console.log(err);
      server
        .get('/studio_photo_selector/' + studio._id.toString())
        //.expect('[\n  "' + photo_one._id.toString() + '",\n  "' +
        //        photo_two._id.toString() + '"\n]') // Non-angular JSON
        .expect(")]}',\n[" + photo_one._id.toString() + ',' +
          photo_two._id.toString() +  ']')
        .expect(200, done);
    });
  });
});
