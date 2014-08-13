var studio_services = angular.module('studio_services', []);

studio_services.factory('photos', [ '$http', function($http) {
  var get_photos = function() {
    return $http.get('/studio_photo_selector/' +
      angular.element('#id_id').val()).success(function(data) {
        alert(data);
      });
  }

  var update_photos = function() {
    alert('UPDATE PHOTOS');
  }

  return {
    get_photos: get_photos,
    update_photos: update_photos
  }
}]);
