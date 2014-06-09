var swig = require('swig'),
    _ = require('underscore');

swig.setFilter('get_author', function(users, author_id) {
  var author = _.find(users, function(user) {
    return user._id == author_id;
  });

  if(author) {
    return author.first_name + ' ' + author.last_name;
  } else {
    return 'Unknown';
  }
});