treehouseApp.controller('createAchievementController', function($scope,  $http, pageService) {
    pageService.setTitle('Create new achievement');
    $scope.goalList = [{title: 'testTitle', quantity: 1}];

    var images = [
        "/content/img/achievementImages/1.png",
        "/content/img/achievementImages/2.png",
        "/content/img/achievementImages/3.png",
        "/content/img/achievementImages/4.png",
        "/content/img/achievementImages/5.png",
        "/content/img/achievementImages/6.png",
        "/content/img/achievementImages/7.png",
        "/content/img/achievementImages/8.png",
        "/content/img/achievementImages/9.png",
        "/content/img/achievementImages/10.png",
        "/content/img/achievementImages/11.png",
        "/content/img/achievementImages/12.png",
        "/content/img/achievementImages/13.png",
        "/content/img/achievementImages/14.png",
        "/content/img/achievementImages/15.png",
        "/content/img/achievementImages/16.png",
        "/content/img/achievementImages/17.png",
        "/content/img/achievementImages/18.png",
        "/content/img/achievementImages/19.png",
        "/content/img/achievementImages/20.png",
        "/content/img/achievementImages/21.png",
        "/content/img/achievementImages/22.png",
        "/content/img/achievementImages/23.png",
        "/content/img/achievementImages/24.png",
        "/content/img/achievementImages/25.png",
        "/content/img/achievementImages/26.png",
        "/content/img/achievementImages/27.png",
        "/content/img/achievementImages/28.png",
        "/content/img/achievementImages/29.png",
        "/content/img/achievementImages/30.png",
        "/content/img/achievementImages/31.png",
        "/content/img/achievementImages/32.png",
        "/content/img/achievementImages/33.png",
        "/content/img/achievementImages/34.png",
        "/content/img/achievementImages/35.png",
        "/content/img/achievementImages/36.png",
        "/content/img/achievementImages/37.png",
        "/content/img/achievementImages/38.png",
        "/content/img/achievementImages/39.png",
        "/content/img/achievementImages/40.png",
        "/content/img/achievementImages/41.png",
        "/content/img/achievementImages/42.png",
        "/content/img/achievementImages/43.png",
        "/content/img/achievementImages/44.png",
        "/content/img/achievementImages/45.png",
        "/content/img/achievementImages/46.png",
        "/content/img/achievementImages/47.png",
        "/content/img/achievementImages/48.png",
        "/content/img/achievementImages/49.png"
    ];
    
    //TODO spara goals
    //TODO spara bara goals om de har quantity och title
    //TODO ta bort fake-arraydata

    $scope.goalKeyPress = function(evt, last) {
        console.log(last)
        if (last) {
            $scope.goalList.push({title: 'testTitle', quantity: 1});
        }
    }

    $scope.createAchievement = function(evt) {
        evt.preventDefault();
        $http.post('/api/achievements/createAchievement', {
            achievementTitle : $scope.achievementTitle,
            achievementDescription : $scope.achievementDescription,
            achievementImage : $("#achievementImage").attr("src")
        }).success(function(result) {
            document.location =  result.url;
        });
    }

    $scope.toggleImage = function(evt, step) {
        evt.preventDefault();
        var currentImage = $("#achievementImage").attr("src");
        var currentPos = jQuery.inArray(currentImage, images);
        var newPos = currentPos + step;
        if (newPos  >= images.length) {
            newPos = 0;
        }   else if (newPos == -1) {
            newPos = images.length-1;
        }
        $("#achievementImage").attr("src", images[newPos]);
    }
});