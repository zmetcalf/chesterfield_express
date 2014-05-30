exports.index = function(req, res) {
  var page_content = {
    "content_heading": "Welcome to Chesterfield Beans!",
    "content": "Here is the place for some things node.",
    "call_to_action" : {
      "link": "#",
      "name": "Click Here for More!"
    }
  }

  res.render('index', page_content);
}
