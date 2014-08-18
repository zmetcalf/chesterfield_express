var page_services = angular.module('page_services', []);

page_services.factory('photos', [ '$http',
  function($http) {

    var get_photo = function(photo) {
      return $http.get('/photo_ajax/' + photo);
    }

    return {
      get_photo: get_photo,
    }
}]);
