var assert = require('chai').assert,
    async = require('async'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    user_model = require('../../../controllers/user/models/models'),
    model = require('../../../controllers/studio/models/models');

if(!mongoose.connection.readyState) {
  mongoose.connect('mongodb://localhost/chest_test/', db_opts.options);
}

// DO NOT MOVE - WILL DELETE PRODUCTION DB
var app = require('../../../index');
var server = request.agent(app);
var csrf = '';

describe.skip('Studio Photo Selector', function() {
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
});
