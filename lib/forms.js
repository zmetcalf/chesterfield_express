// Bootstrap version of fields
exports.bootstrap_field = function(name, object) {
  object.widget.classes = object.widget.classes || [];
  object.widget.classes.push('form-control');

  var label = '<label for="id_' + name + '">' + object.labelHTML(name) + '</label>';
  var error = object.error ? '<div class="alert alert-danger">' + object.error + '</div>' : '';
  var widget = object.widget.toHTML(name, object);
  return '<div class="form-group">' + label + widget + error + '</div>';
};
