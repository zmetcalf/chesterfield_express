var mongoose = require('mongoose');

var cms_schema = mongoose.Schema({
  title: String,
  content_post_date: { type: Date, default: Date.now },
  content: String,
  summary: String,
  published: Boolean,
  author: { type: Number, ref: 'User' },
  seo_keywords: String,
  seo_description: String,
  url_slug: String,
});

var Content = exports.Content = mongoose.model('Content', cms_schema);
