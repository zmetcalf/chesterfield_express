var model = require('./models/models'),
    gen_password = require('../../lib/utils').gen_password,
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
        if (!user) return next('route');
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
      res.render('list', {
        'users': users,
        message: res.locals.message
      });
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
  res.render('show', {
    user: req.user,
    message: res.locals.message
  });
}

exports.delete = function(req, res, next) {
  model.User.findByIdAndRemove(req.user._id, function(err) {
    if(err) return console.log(err);
    req.session.error = 'User Deleted';
    res.redirect('/users');
  });
}

exports.update = function(req, res, next) {
  update_form(req.user).handle(req, {
    success: function(form) {
      var update_fields = {};
      _.each(['first_name', 'last_name', 'is_staff'], function(field) {
        if(req.body[field]) {
          update_fields[field] = req.body[field];
        }
      });

      model.User.findOneAndUpdate({ username: req.user.username }, update_fields,
        function(err, user) {
          if (err) return console.log(err);
          req.session.success = 'User updated';
          res.redirect('/user/' + req.user.username);
      });
    },

    error: function(form) {
      res.render('edit', {
        form: form.toHTML(bootstrap_field),
        user: req.user,
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/user/' + req.user.username + '/edit');
    }
  });
}

exports.add = function(req, res, next) {
  res.render('create', {
    form: create_form.toHTML(bootstrap_field),
    csrf_token: req.csrfToken()
  });
}

exports.create = function(req, res, next) {
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
            if(err) return console.log(err);
            req.session.success = 'New Password is: ' + password;
            res.redirect('/user/' + req.body.username);
          });
        });
      });
    },

    error: function(form) {
      res.render('create', {
        form: form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/create_user');
    }
  });
}

function update_form(user) {
  return forms.create({
    first_name: fields.string({
      widget: widgets.text(),
      errorAfterField: true,
      value: user.first_name,
      required: true
    }),

    last_name: fields.string({
      widget: widgets.text(),
      errorAfterField: true,
      value: user.last_name,
      required: true
    }),

    is_staff: fields.boolean({
      widget: widgets.select(),
      choices: {
        true: "Yes",
        false: "No"
      },
      errorAfterField: true,
      value: String(user.is_staff),
      required: true
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
  model.User.is_unique_user(field.data, function(err, is_unique) {
    if (err) return console.log(err);
    if(is_unique) {
      return callback();
    } else {
      return callback('Username is already taken');
    }
  });
}
