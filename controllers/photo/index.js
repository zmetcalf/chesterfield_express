var model = require('./models/models'),
    async = require('async'),
    fs = require('fs'),
    user_model = require('../user/models/models'),
    sanitize_html = require('sanitize-html'),
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    bootstrap_field = require('../../lib/forms').bootstrap_field;


exports.before = function(req, res, next) {
  if ((req.route.path === '/photo/:photo_id' && req.route.method==='get') ||
      req.session.user && req.session.user.is_staff) {
    var slug = req.params.photo_id;
    if (!slug) return next();

    model.Photo.findOne({ '_id': slug }, function(err, photo) {
      req.photo = photo;
      if (err) return console.log(err);
      if (!photo) return next('route');
      next();
    });
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}


exports.list = function(req, res, next) {
  async.parallel({
    photos: function(callback) {
      model.Photo.find({}, '_id post_date title _author studios',
        function(err, photos) {
          if (err) return console.log(err);
          return callback(null,  photos);
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
    header: 'Edit Photo',
    action_url: '/photo/' + req.photo._id + '?_method=put',
    form: photo_form(req.photo).toHTML(bootstrap_field),
    slug: req.photo._id,
    exists: true,
    csrf_token: req.csrfToken()
  });
}


exports.show = function(req, res, next) {
  res.render('show', {
    message: res.locals.message,
    photo: req.photo,
  });
}


exports.delete = function(req, res, next) {
  // TODO Add removal of file from file system
  model.Photo.findByIdAndRemove(req.photo._id, function(err) {
    if(err) return console.log(err);
    req.session.error = 'Photo Deleted';
    res.redirect('/photos');
  });
}


exports.update = function(req, res, next) {
  photo_form().handle(req, {
    success: function(form) {
      model.Photo.findOneAndUpdate({ _id: req.photo.url_slug }, {
        title: sanitize_html(req.body.title),
        post_date: req.body.post_date,
        description: sanitize_html(req.body.description),
        published: req.body.published,
      }, function(err, photo) {
          if(err) return console.log(err);
          req.session.success = 'Photo Updated';
          res.redirect('/photo/' + photo._id + '/edit');
      });
    },

    error: function(form) {
      res.render('update', {
        header: 'Edit Photo',
        form: form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/create_photo');
    }
  });
}


exports.add = function(req, res, next) {
  res.render('update', {
    header: 'Create Photo',
    action_url: '/photo',
    form: photo_form().toHTML(bootstrap_field),
    csrf_token: req.csrfToken()
  });
}


exports.create = function(req, res, next) {
  photo_form().handle(req, {
    success: function(form) {
      var photo_path = '';

      async.series([
        function(callback) {
          model.Photo.create({
            title: sanitize_html(req.body.title),
            post_date: req.body.post_date,
            description: sanitize_html(req.body.description),
            published: req.body.published,
            _author: req.session.user._id,
          }, function(err, photo_content) {
            if (err) return callback(err);
            photo_path = photo_content._id
            callback(null, photo_content)
          });
        },

        function(callback) {
          fs.readFile(req.body.image_upload.path, function(err, image_file) {
            photo_path = __dirname + "/media/photos/" + photo_path;
            fs.writeFile(photo_path, image_file,
              function(err) {
                if(err) return callback(err);
                callback(null, photo_path);
            });
          });
        }
      ],

      function(err, results) {
        if(err) return console.log(err);
        model.Photo.findOneAndUpdate({ _id: results[0]._id }, {
          path: photo_path,
        }, function(err, photo) {
          if(err) return console.log(err);
          req.session.success = 'Photo Created';
          res.redirect('/photo/' + photo._id + '/edit');
        });
      });
    },

    error: function(form) {
      res.render('update', {
        header: 'Create Photo',
        form: form.toHTML(bootstrap_field),
        csrf_token: req.csrfToken()
      });
    },

    empty: function(form) {
      res.redirect('/create_photo');
    }
  });
}


function photo_form(photo) {
  photo = photo || {};
  photo.published = photo.published || 'false';

  return forms.create({
    title: fields.string({
      widget: widgets.text(),
      required: true,
      errorAfterField: true,
      value: photo.title
    }),

    post_date: fields.date({
      widget: widgets.date(),
      required: true,
      errorAfterField: true,
      value: photo.post_date
    }),

    description: fields.string({
      widget: widgets.textarea(),
      value: photo.description
    }),

    published: fields.boolean({
      widget: widgets.select(),
      required: true,
      choices: {
        true: "Yes",
        false: "No"
      },
      errorAfterField: true,
      value: String(photo.published)
    }),

    id: fields.string({
      widget: widgets.hidden(),
      value: photo._id,
    }),
  });
}
