var studio_services = angular.module('studio_services', []);

studio_services.factory('photos', [ '$http',
  function($http) {

    var get_photos = function() {
      return $http.get('/studio_photo_selector/' +
        angular.element('#id_id').val());
    }

    var update_photos = function(selected_photos) {
      return $http.put('/studio_photo_selector/' +
        angular.element('#id_id').val(),
        selected_photos)
    }

    return {
      get_photos: get_photos,
      update_photos: update_photos,
    }
}]);
