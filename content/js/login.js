angular.module('App', []).controller('Ctrl', function ($scope) {
    $scope.login = function (evt) {
        evt.preventDefault();
        document.location = '/login';
    };
});
