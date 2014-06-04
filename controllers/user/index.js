var model = require('./models/models'),
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    bootstrap_field = require('../../lib/forms').bootstrap_field,
    _ = require('underscore');

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

exports.create function(req, res, next) {

}

exports.add = function(req, res, next) {

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
  }),

  is_staff: fields.boolean({
    widget: widgets.select(),
    choices: {
      true: "Yes",
      false: "No"
    },
    required: true,
    errorAfterField: true,
    value: false
  })
});
