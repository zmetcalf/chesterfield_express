var model = require('../user/models/models'),
    hash = require('pwd').hash,
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    bootstrap_field = require('../../lib/forms').bootstrap_field;

exports.before = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

exports.list = function(req, res, next) {
  res.render('update', {
    form: update_form.toHTML(bootstrap_field),
    csrf_token: req.csrfToken(),
    user: req.session.user
  });
}

exports.update = function(req, res, next) {
  update_form.handle(req, {
    success: function(form) {
      hash(req.body.password, function(err, _salt, _hash) {
        if (err) return console.log(err);

        model.User.findOneAndUpdate({ username: req.session.user.username },
        {
          salt: _salt,
          hash: _hash
        },  function(err, user) {
          if(err) return console.log(err);
          res.message('Information updated!');
          res.redirect('/settings');
        });
      });
    },

    error: function(form) {
      res.render('update', {
        form: form.toHTML(bootstrap_field),
        user: req.session.user,
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/settings');
    }
  });
}

var update_form = forms.create({
  password: fields.password({
    required: validators.required('Please enter your password'),
  }),
  confirm_password: fields.password({
    required: validators.required('Please confirm your password'),
    validators: [ validators.matchField('password') ]
  })
});
