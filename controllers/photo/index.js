var models = require('../../models'),
    async = require('async'),
    fs = require('fs'),
    sanitize_html = require('sanitize-html'),
    forms = require('forms'),
    fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets,
    path = require('path'),
    fs = require('fs'),
    busboy = require('connect-busboy'),
    qt = require('quickthumb'),
    bootstrap_field = require('../../lib/forms').bootstrap_field;


exports.before = function(req, res, next) {
  if ((req.route.path === '/photo/:photo_id' && req.route.method==='get') ||
      req.session.user && req.session.user.is_staff) {
    var slug = req.params.photo_id;
    if (!slug) return next();

    models.Photo.findOne({ '_id': slug }, function(err, photo) {
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
      models.Photo.find({}, '_id post_date title _author studios',
        function(err, photos) {
          if (err) return console.log(err);
          return callback(null,  photos);
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
    header: 'Edit Photo',
    action_url: '/photo/' + req.photo._id + '?_method=put&_csrf=' + req.csrfToken(),
    form: photo_form(req.photo).toHTML(bootstrap_field),
    photo: req.photo.path,
    slug: req.photo._id.toString(),
    exists: true,
    csrf_token: req.csrfToken()
  });
}


exports.show = function(req, res, next) {
  res.render('show', {
    message: res.locals.message,
    photo: req.photo,
    photo_path: req.photo.path,
  });
}


exports.delete = function(req, res, next) {
  // TODO Add removal of file from file system
  models.Photo.findByIdAndRemove(req.photo._id, function(err) {
    if(err) return console.log(err);
    req.session.error = 'Photo Deleted';
    res.redirect('/photos');
  });
}


exports.update = function(req, res, next) {
  photo_form().handle(req, {
    success: function(form) {
      models.Photo.findOneAndUpdate({ _id: req.photo._id }, {
        title: sanitize_html(req.body.title),
        post_date: req.body.post_date,
        description: sanitize_html(req.body.description),
        published: req.body.published,
      }, function(err, photo) {
          if(err) return console.log(err);
          req.session.success = 'Photo Updated';
          res.redirect('/photo/' + photo._id.toString() + '/edit');
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
    action_url: '/photo?_csrf=' + req.csrfToken(),
    form: photo_form().toHTML(bootstrap_field),
    csrf_token: req.csrfToken()
  });
}


exports.create = function(req, res, next) {
  req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    if (filename === '') {
      file.resume();
    }
    if (fieldname === 'image_upload') {
      if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
        // TODO add prevention of overwriting files
        var save_to = path.join(__dirname, '../../media/', filename);
        file.pipe(fs.createWriteStream(save_to));
        req.image = { path: save_to }
      }
    }
  });

  req.busboy.on('field', function(fieldname, val, fieldnamTruncated, valTruncated) {
    req.body[fieldname] = val;
  });

  req.busboy.on('finish', function() {
    photo_form().handle(req, {
      success: function(form) {
        async.waterfall([
          function(callback) {
            qt.convert({
              src: req.image.path,
              dst: path.dirname(req.image.path) + '/thumbnails/' + path.basename(req.image.path),
              width: 269,
              height: 204
            }, function(err, thumbpath) {
              if(err) return callback(err);
              callback(null);
            });
          },

          function(callback) {
            models.Photo.create({
              title: sanitize_html(req.body.title),
              post_date: req.body.post_date,
              description: sanitize_html(req.body.description),
              published: req.body.published,
              _author: req.session.user._id,
              path: path.basename(req.image.path),
            }, function(err, photo) {
              if (err) return callback(err);
              callback(null, photo);
            });
          },
        ],

        function(err, result) {
          if (err) {
            req.session.error = 'Photo Not Created';
          } else {
            req.session.success = 'Photo Created';
          }
          res.redirect('/photo/' + result._id.toString() + '/edit');
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
