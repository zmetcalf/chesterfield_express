var page_controllers = angular.module('page_controllers',
  [ 'ui.bootstrap', 'page_services' ]);


page_controllers.controller('PhotoModalCtrl',
  [ '$scope', '$modal', 'photos',
  function ($scope, $modal, photos) {

  $scope.open = function(photo) {
    photos.get_photo(photo).success(function(photo_json) {
      var modalInstance = $modal.open({
        templateUrl: '/js/angular/pages/templates/photo_modal.html',
        controller: ModalInstanceCtrl,
        size: 'lg',
        resolve: { photo_object: function () { return photo_json } }
      });
    });
  };
}]);


var ModalInstanceCtrl = function ($scope, $sce, $modalInstance, photo_object) {
  $scope.photo = photo_object;

  $scope.description = function() { return $sce.trustAsHtml(photo_object.description); };

  $scope.ok = function () {
    console.log($scope.photo);
    $modalInstance.dismiss('cancel');
  };
};
