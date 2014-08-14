var studio_controllers = angular.module('studio_controllers',
  [ 'ui.bootstrap', 'studio_services' ]);


studio_controllers.controller('PhotoSelectModalCtrl',
  [ '$scope', '$modal', 'photos', function ($scope, $modal, photos) {

    $scope.open = function () {
      var modalInstance = $modal.open({
        templateUrl: '/js/angular/templates/photo_select_modal.html',
        controller: ModalInstanceCtrl,
        resolve: { photos: photos.get_photos }
      });

      modalInstance.result.then(function(selected_photos) {
        photos.update_photos();
      });

    };
}]);

var ModalInstanceCtrl = function ($scope, $modalInstance, photos) {
  $scope.photos = photos.all_photos;

  $scope.selected = photos.studio_photos;

  $scope.ok = function () {
    $modalInstance.close($scope.selected.photos);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
