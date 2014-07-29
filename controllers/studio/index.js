var model = require('./models/models'),
    user_model = require('../user/models/models'),
    _ = require('underscore'),
    async = require('async'),
    sanitize_html = require('sanitize-html'),
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    bootstrap_field = require('../../lib/forms').bootstrap_field;


exports.before = function(req, res, next) {
  if ((req.route.path === '/studio/:studio_id' && req.route.method==='get') ||
      req.session.user && req.session.user.is_staff) {
    var slug = req.params.studio_id;
    if (!slug) return next();

    model.Studio.findOne({ 'url_slug': slug }, function(err, studio) {
      req.studio = studio;
      if (err) return console.log(err);
      if (!studio) return next('route');
      next();
    });
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


exports.list = function(req, res, next) {
  async.parallel({
    studios: function(callback) {
      model.Studio.find({}, 'url_slug post_date title _author',
        function(err, studios) {
          if (err) return console.log(err);
          return callback(null,  studios);
      });
    },

    users: function(callback) {
      user_model.User.find({}, 'first_name last_name _id',
        function(err, users) {
          if (err) return console.log(err);
          return callback(null, users);
      });
    },
  },

  function(err, results) {
    res.render('list', results);
  });
}


exports.edit = function(req, res, next) {
  res.render('update', {
    header: 'Edit Studio',
    action_url: '/studio/' + req.studio.url_slug + '?_method=put',
    form: studio_form(req.studio).toHTML(bootstrap_field),
    slug: req.studio.url_slug,
    exists: true,
    csrf_token: req.csrfToken()
  });
}


exports.show = function(req, res, next) {
  res.render('show', {
    message: res.locals.message,
    studio: req.studio,
  });
}


exports.delete = function(req, res, next) {
  model.Studio.findByIdAndRemove(req.studio._id, function(err) {
    if(err) return console.log(err);
    req.session.error = 'Studio Deleted';
    res.redirect('/studios');
  });
}


exports.update = function(req, res, next) {
  studio_form().handle(req, {
    success: function(form) {
      model.Studio.findOneAndUpdate({ url_slug: req.studio.url_slug }, {
        title: sanitize_html(req.body.title),
        post_date: req.body.post_date,
        description: sanitize_html(req.body.description),
        published: req.body.published,
        seo_keywords: sanitize_html(req.body.seo_keywords),
        seo_description: sanitize_html(req.body.seo_description),
        url_slug: clean_slug(req.body.url_slug)
      }, function(err, studio) {
          if(err) return console.log(err);
          req.session.success = 'Studio Updated';
          res.redirect('/studio/' + clean_slug(req.body.url_slug) + '/edit');
      });
    },

    error: function(form) {
      res.render('update', {
        header: 'Edit Studio',
        form: form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/create_studio');
    }
  });
}


exports.add = function(req, res, next) {
  res.render('update', {
    header: 'Create Studio',
    action_url: '/studio',
    form: studio_form().toHTML(bootstrap_field),
    csrf_token: req.csrfToken()
  });
}


exports.create = function(req, res, next) {
  studio_form().handle(req, {
    success: function(form) {
      model.Studio.create({
        title: sanitize_html(req.body.title),
        post_date: req.body.post_date,
        description: sanitize_html(req.body.description),
        published: req.body.published,
        _author: req.session.user._id,
        seo_keywords: sanitize_html(req.body.seo_keywords),
        seo_description: sanitize_html(req.body.seo_description),
        url_slug: clean_slug(req.body.url_slug)
      }, function(err, studio) {
          if(err) return console.log(err);
          req.session.success = 'Studio Created';
          res.redirect('/studio/' + clean_slug(req.body.url_slug) + '/edit');
      });
    },

    error: function(form) {
      res.render('update', {
        header: 'Create Studio',
        form: form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/create_studio');
    }
  });
}


function studio_form(studio) {
  studio = studio || {};
  studio.published = studio.published || 'false';

  return forms.create({
    title: fields.string({
      widget: widgets.text(),
      required: true,
      errorAfterField: true,
      value: studio.title
    }),

    post_date: fields.date({
      widget: widgets.date(),
      required: true,
      errorAfterField: true,
      value: studio.post_date
    }),

    description: fields.string({
      widget: widgets.textarea(),
      value: studio.description
    }),

    published: fields.boolean({
      widget: widgets.select(),
      required: true,
      choices: {
        true: "Yes",
        false: "No"
      },
      errorAfterField: true,
      value: String(studio.published)
    }),

    url_slug: fields.string({
      widget: widgets.text(),
      required: true,
      errorAfterField: true,
      validators: [ unique_slug ],
      value: studio.url_slug
    }),

    seo_keywords: fields.string({
      widget: widgets.text(),
      value: studio.seo_keywords,
    }),

    seo_description: fields.string({
      widget: widgets.text(),
      value: studio.seo_description,
    }),

    id: fields.string({
      widget: widgets.hidden(),
      value: studio._id,
    }),
  });
}


function unique_slug(form, field, callback) {
  studio_id = form.data.id || '';
  model.Studio.is_unique_slug(field.data, studio_id,
    function(err, is_unique) {
      if (err) return console.log(err);
      if(is_unique) {
        return callback();
      } else {
        return callback('URL already in use.');
      }
  });
}


function clean_slug(slug) {
  return sanitize_html(slug.replace(/\//g, '')).toLowerCase();
}
