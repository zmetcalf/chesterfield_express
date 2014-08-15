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
          photo_object: function() {
            return $filter('view_prep')(photos.get_photos(), 3);
          }
        }
      });

      modalInstance.result.then(function(selected_photos) {
        var photo_array = [];
        angular.forEach(selected_photos, function(value, key) {
          if (value) {
            photo_array.push(key);
          }
        });
        photos.update_photos(photo_array);
      });
    };
}]);

studio_controllers.filter('view_prep', function() {
  return function(items, groupItems) {
    if (items) {
      var newArray = [];
      var selected = {};

      // Prepare Selected Items
      angular.forEach(items.all_photos, function(photo) {
        photo.selected = false;
        angular.forEach(items.studio_photos, function(selected_photo) {
          if(angular.equals(photo._id, selected_photo)) {
            photo.selected = true;
            selected[photo._id] = true;
          }
        });
      });

      // Group for bootstrap rows
      for (var i = 0; i < items.all_photos.length; i+=groupItems) {
        if (i + groupItems > items.all_photos.length) {
            newArray.push(items.all_photos.slice(i));
        } else {
            newArray.push(items.all_photos.slice(i, i + groupItems));
        }
      }

      return {
        photo_group: newArray,
        selected: selected
      };
    }
  };
});

var ModalInstanceCtrl = function ($scope, $modalInstance, photo_object) {
  $scope.photo_group = photo_object.photo_group;

  $scope.selected = photo_object.selected;

  $scope.ok = function () {
    $modalInstance.close($scope.selected);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};
