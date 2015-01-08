angular.module('App', []).controller('Ctrl', function ($scope) {
    $scope.signin = function (evt) {
        evt.preventDefault();
        document.location = '/signin';
    };
});
