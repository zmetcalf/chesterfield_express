var model = require('./models/models'),
    crypto = require('crypto'),
    hash = require('pwd').hash,
    _ = require('underscore'),
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    bootstrap_field = require('../../lib/forms').bootstrap_field;

exports.before = function(req, res, next) {
  if (req.session.user && req.session.user.is_staff) {
    var username = req.params.user_id;
    if (!username) return next();

    model.User.findOne({ 'username': username },
      'first_name last_name is_staff username',
      function(err, user) {
        req.user = user;
        if (err) return console.log(err);
        if (!user) return next(new Error('User not found'));
        next();
    });
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

exports.list = function(req, res, next) {
  model.User.find({}, 'first_name last_name is_staff username',
    function(err, users) {
      if (err) return console.log(err);
      res.render('list', { 'users': users });
    });
}

exports.edit = function(req, res, next) {
  res.render('edit', {
    form: update_form(req.user).toHTML(bootstrap_field),
    user: req.user,
    csrf_token: req.csrfToken()
  });
}

exports.show = function(req, res, next) {
  res.render('show', { user: req.user });
}

exports.update = function(req, res, next) {
  var update_fields = {};
  _.each(['first_name', 'last_name', 'is_staff'], function(field) {
    if(req.body[field]) {
      update_fields[field] = req.body[field];
    }
  });

  model.User.findOneAndUpdate({ username: req.user.username }, update_fields,
    function(err, user) {
      if (err) return console.log(err);
      res.message('Information updated!');
      res.redirect('/user/' + req.user.username);
  });
}

exports.create = function(req, res, next) {
  res.render('create', {
    form: create_form.toHTML(bootstrap_field),
    csrf_token: req.csrfToken()
  });
}

exports.add = function(req, res, next) {
  create_form.handle(req, {
    success: function(form) {
      gen_password(function(err, password) {
        if (err) return console.log(err);
        hash(password, function(err, _salt, _hash) {
          if (err) return console.log(err);

          model.User.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            is_staff: req.body.is_staff,
            hash: _hash,
            salt: _salt
          }, function(err, new_user) {
            if(err) return handleError(err);
            res.message('New Password is: ' + password);
            res.redirect('/user/' + req.body.username);
          });
        });
      });
    },

    error: function(form) {
      res.render('create', {
        form: create_form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.render('create', {
        form: create_form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    }
  });
}

function update_form(user) {
  return forms.create({
    first_name: fields.string({
      widget: widgets.text(),
      errorAfterField: true,
    }),

    last_name: fields.string({
      widget: widgets.text(),
      errorAfterField: true,
    }),

    is_staff: fields.boolean({
      widget: widgets.select(),
      choices: {
        true: "Yes",
        false: "No"
      },

      errorAfterField: true,

      value: user.is_staff
    })
  });
}

var create_form = forms.create({
  first_name: fields.string({
    widget: widgets.text(),
    required: true,
    errorAfterField: true,
  }),

  last_name: fields.string({
    widget: widgets.text(),
    required: true,
    errorAfterField: true,
  }),

  username: fields.string({
    widget: widgets.text(),
    required: true,
    errorAfterField: true,
    validators: [ unique_user ],
  }),

  is_staff: fields.boolean({
    widget: widgets.select(),
    choices: {
      true: "Yes",
      false: "No"
    },
    required: true,
    errorAfterField: true,
    value: "false"
  })
});

function unique_user(form, field, callback) {
  model.User.find({}, 'username', function(err, users) {
    if (err) return console.log(err);

    if(!!_.find(users, function(user) { return field.data == user; })) {
      return callback('Username already taken.');
    } else {
      return callback();
    }
  });
}

function gen_password(callback) {
  crypto.randomBytes(10, function(err, buf) {
    if(err) return console.log(err);
    buf.toString('base64')
    .slice(0, 10)
    .replace(/\+/g, '0')
    .replace(/\//g, '0');
    return callback(buf);
  });
}
