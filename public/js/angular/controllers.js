var studio_controllers = angular.module('studio_controllers',
  [ 'ui.bootstrap', 'studio_services' ]);


studio_controllers.controller('PhotoSelectModalCtrl',
  [ '$scope', '$modal', 'photos', function ($scope, $modal, photos) {

    $scope.open = function () {
      var modalInstance = $modal.open({
        templateUrl: '/js/angular/templates/photo_select_modal.html',
        controller: ModalInstanceCtrl,
        size: 'lg',
        resolve: { photos: photos.get_photos }
      });

      modalInstance.result.then(function(selected_photos) {
        photos.update_photos();
      });

    };
}]);

var ModalInstanceCtrl = function ($scope, $modalInstance, photos) {
  $scope.photo_group = [];

  $scope.photos = photos.all_photos;

  if (photos.all_photos) {

      for (var i = 0; i < photos.all_photos.length; i+=3) {
          if (i + 3 > photos.all_photos.length) {
              $scope.photo_group.push(photos.all_photos.slice(i));
          } else {
              $scope.photo_group.push(photos.all_photos.slice(i, i + 3));
          }
      }
  }
  console.log($scope.photo_group);
  $scope.selected = photos.studio_photos;

  $scope.ok = function () {
    $modalInstance.close($scope.selected.photos);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
