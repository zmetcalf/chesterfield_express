var studio_controllers = angular.module('studio_controllers',
  [ 'ui.bootstrap', 'studio_services' ]);


studio_controllers.controller('PhotoSelectModalCtrl',
  [ '$scope', '$modal', 'photos', function ($scope, $modal, photos) {

    $scope.open = function () {
      var modalInstance = $modal.open({
        templateUrl: '/js/angular/templates/photo_select_modal.html',
        controller: ModalInstanceCtrl,
        resolve: photos.get_photos()
      });
    };
}]);

var ModalInstanceCtrl = function ($scope, $modalInstance, photos) {

  $scope.ok = function () {
    photos.update_photos();
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
