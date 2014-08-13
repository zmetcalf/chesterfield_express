var studio_services = angular.module('studio_services', []);

studio_services.factory('photos', [ '$http',
  function($http) {
    var get_photos = function() {
      return $http.get('/studio_photo_selector/' +
        angular.element('#id_id').val()).success(function(data) {
          var selected_photos = _.filter(data.all_photos, function(photo) {
            _.each(data.studio_photos, function(sp) {
              if (angular.equals(photo._id, sp)) {
                return true;
              }
              return false;
            });
          });
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
