var studio_controllers = angular.module('studio_controllers',
  [ 'ui.bootstrap', 'studio_services' ]);


studio_controllers.controller('PhotoSelectModalCtrl',
  [ '$scope', '$modal', '$filter', 'photos',
  function ($scope, $modal, $filter, photos) {

    $scope.open = function () {
      var modalInstance = $modal.open({
        templateUrl: '/js/angular/templates/photo_select_modal.html',
        controller: ModalInstanceCtrl,
        size: 'lg',
        resolve: {
          photo_group: function() {
            return $filter('group')(photos.get_photos(), 3);
          }
        }
      });

      modalInstance.result.then(function(selected_photos) {
        photos.update_photos();
      });

    };
}]);

studio_controllers.filter('group', function() {
  return function(items, groupItems) {
    if (items) {
      var newArray = [];

      for (var i = 0; i < items.all_photos.length; i+=groupItems) {
        if (i + groupItems > items.all_photos.length) {
            newArray.push(items.all_photos.slice(i));
        } else {
            newArray.push(items.all_photos.slice(i, i + groupItems));
        }
        angular.forEach(items.studio_photos, function(selected_photo) {
          if(angular.equals(items.all_photos[i]._id, selected_photo)) {
            items.all_photos[i].selected = true;
          } else {
            items.all_photos[i].selected = false;
          }
        });
      }

      return newArray;
    }
  };
});

var ModalInstanceCtrl = function ($scope, $modalInstance, photo_group) {
  $scope.photo_group = photo_group;

  $scope.ok = function () {
    $modalInstance.close($scope.selected.photos);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
