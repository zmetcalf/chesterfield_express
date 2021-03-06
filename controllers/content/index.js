var models = require('../../models'),
    async = require('async'),
    sanitize_html = require('sanitize-html'),
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    bootstrap_field = require('../../lib/forms').bootstrap_field;


exports.before = function(req, res, next) {
  if ((req.route.path === '/content/:content_id' && req.route.method==='get') ||
      req.session.user && req.session.user.is_staff) {
    var slug = req.params.content_id;
    if (!slug) return next();

    models.Content.findOne({ 'url_slug': slug }, function(err, content) {
      req.content = content;
      if (err) return console.log(err);
      if (!content) return next('route');
      next();
    });
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


exports.list = function(req, res, next) {
  async.parallel({
    contents: function(callback) {
      models.Content.find({}, 'url_slug post_date title _author',
        function(err, contents) {
          if (err) return console.log(err);
          return callback(null,  contents);
      });
    },

    users: function(callback) {
      models.User.find({}, 'first_name last_name _id',
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
    header: 'Edit Content',
    action_url: '/content/' + req.content.url_slug + '?_method=put',
    form: content_form(req.content).toHTML(bootstrap_field),
    slug: req.content.url_slug,
    exists: true,
    csrf_token: req.csrfToken()
  });
}


exports.show = function(req, res, next) {
  // When using cool URLs, the template must be called more explicitly
  res.render(__dirname + '/views/show', {
    message: res.locals.message,
    content: req.content,
  });
}


exports.delete = function(req, res, next) {
  models.Content.findByIdAndRemove(req.content._id, function(err) {
    if(err) return console.log(err);
    req.session.error = 'Content Deleted';
    res.redirect('/contents');
  });
}


exports.update = function(req, res, next) {
  content_form().handle(req, {
    success: function(form) {
      models.Content.findOneAndUpdate({ url_slug: req.content.url_slug }, {
        title: sanitize_html(req.body.title),
        post_date: req.body.post_date,
        summary: sanitize_html(req.body.summary),
        content: sanitize_html(req.body.content),
        published: req.body.published,
        seo_keywords: sanitize_html(req.body.seo_keywords),
        seo_description: sanitize_html(req.body.seo_description),
        url_slug: clean_slug(req.body.url_slug)
      }, function(err, content) {
          if(err) return console.log(err);
          req.session.success = 'Content Updated';
          res.redirect('/content/' + clean_slug(req.body.url_slug) + '/edit');
      });
    },

    error: function(form) {
      res.render('update', {
        header: 'Edit Content',
        form: form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/create_content');
    }
  });
}


exports.add = function(req, res, next) {
  res.render('update', {
    header: 'Create Content',
    action_url: '/content',
    form: content_form().toHTML(bootstrap_field),
    csrf_token: req.csrfToken()
  });
}


exports.create = function(req, res, next) {
  content_form().handle(req, {
    success: function(form) {
      models.Content.create({
        title: sanitize_html(req.body.title),
        post_date: req.body.post_date,
        summary: sanitize_html(req.body.summary),
        content: sanitize_html(req.body.content),
        published: req.body.published,
        _author: req.session.user._id,
        seo_keywords: sanitize_html(req.body.seo_keywords),
        seo_description: sanitize_html(req.body.seo_description),
        url_slug: clean_slug(req.body.url_slug)
      }, function(err, content) {
          if(err) return console.log(err);
          req.session.success = 'Content Created';
          res.redirect('/content/' + clean_slug(req.body.url_slug) + '/edit');
      });
    },

    error: function(form) {
      res.render('update', {
        header: 'Create Content',
        form: form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/create_content');
    }
  });
}


function content_form(content) {
  content = content || {};
  content.published = content.published || 'false';

  return forms.create({
    title: fields.string({
      widget: widgets.text(),
      required: true,
      errorAfterField: true,
      value: content.title
    }),

    post_date: fields.date({
      widget: widgets.date(),
      required: true,
      errorAfterField: true,
      value: content.post_date
    }),

    summary: fields.string({
      widget: widgets.textarea(),
      value: content.summary
    }),

    content: fields.string({
      widget: widgets.textarea(),
      required: true,
      errorAfterField: true,
      value: content.content
    }),

    published: fields.boolean({
      widget: widgets.select(),
      required: true,
      choices: {
        true: "Yes",
        false: "No"
      },
      errorAfterField: true,
      value: String(content.published)
    }),

    url_slug: fields.string({
      widget: widgets.text(),
      required: true,
      errorAfterField: true,
      validators: [ unique_slug ],
      value: content.url_slug
    }),

    seo_keywords: fields.string({
      widget: widgets.text(),
      value: content.seo_keywords,
    }),

    seo_description: fields.string({
      widget: widgets.text(),
      value: content.seo_description,
    }),

    id: fields.string({
      widget: widgets.hidden(),
      value: content._id,
    }),
  });
}


function unique_slug(form, field, callback) {
  content_id = form.data.id || '';
  models.Content.is_unique_slug(field.data, content_id,
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
