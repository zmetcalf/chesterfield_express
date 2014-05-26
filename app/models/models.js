var cms_schema = mongoose.Schema({
  title: String,
  content_post_date: { type: Date, default: Date.now }),
  content: String,
  summary: String,
  published: Boolean,
  author: { type: Number, ref: 'User' },
  seo_keywords: String,
  seo_description: String,
  url_slug: String,
});

var user_schema = mongoose.Schema({
  _id: Number,
  first_name: String,
  last_name: String,
  username: String,
  password: String,
});

var User = mongoose.model('User', user_schema);
var CMS = mongoose.model('CMS', cms_schema);
