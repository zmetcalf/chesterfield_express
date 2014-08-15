var page_controllers = angular.module('page_controllers',
  [ 'ui.bootstrap' ]);


page_controllers.controller('PhotoModalCtrl', [ '$scope', '$modal',
  function ($scope, $modal) {

  $scope.open = function() {
    var modalInstance = $modal.open({
      templateUrl: '/js/angular/pages/templates/photo_modal.html',
      controller: ModalInstanceCtrl,
      size: 'lg',
    });
  };
}]);


var ModalInstanceCtrl = function ($scope, $modalInstance, photo) {
  $scope.photo = photo;

  $scope.ok = function () {
    $modalInstance.dismiss('cancel');
  };
};
