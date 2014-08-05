angular.module('studio', [ 'ui.bootstrap' ]);

var PhotoSelectModalCtl = function ($scope, $modal, $log) {

  $scope.open = function () {
    var modalInstance = $modal.open({
      templateUrl: '/js/angular/templates/photo_select_modal.html',
      controller: ModalInstanceCtrl,
    });
  };
};

var ModalInstanceCtrl = function ($scope, $modalInstance) {

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
