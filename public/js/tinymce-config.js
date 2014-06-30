$(document).ready(function() {
  tinymce.init({
    selector:'textarea',
    plugins: [
         "advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
         "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
         "save table contextmenu directionality emoticons template paste textcolor"
    ],
    toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | l      ink image | print preview media fullpage | forecolor backcolor emoticons",
    paste_strip_class_attributes: 'none',
    paste_retain_style_properties: 'all',
    theme_advanced_buttons3_add: 'pastetext,pasteword,selectall',
  });
});
