var swig = require('swig'),
    _ = require('underscore');

swig.setFilter('get_author', function(users, author_id) {
  var author = _.find(users, function(user) {
    return user._id.equals(author_id);
  });

  if(author) {
    return author.first_name + ' ' + author.last_name;
  } else {
    return 'Unknown';
  }
});

swig.setFilter('get_copyright', function() {
  return '\u00A9' + new Date().getFullYear();
});
