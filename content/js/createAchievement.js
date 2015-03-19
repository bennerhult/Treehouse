treehouseApp.controller('createAchievementController', function($scope,  $http, pageService) {
    pageService.setTitle('Create new achievement');
    $scope.goalList = [{title: ''}];

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

    $scope.goalKeyPress = function(evt, last) {
        if (last) {
            $scope.goalList.push({title: ''});
        }
    }

    $scope.createAchievement = function(evt) {
       if ($scope.achievementTitle && $scope.achievementTitle.length > 0 ) {
           $http.post('/api/achievements/createAchievement', {
               achievementTitle : $scope.achievementTitle,
               achievementDescription : $scope.achievementDescription,
               achievementImage : $("#achievementImage").attr("src"),
               goalList :  $scope.goalList
           }).success(function(result) {
               document.location =  result.url;
           });
       }
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

    $scope.uploadAchievementImage = function(evt) {
        evt.preventDefault();
        $scope.errorState = false;
        $scope.isConverting = true;
        var container = 'modal';
        if (pageService.isiOs) {
            $('<iframe id="imageUploadFrame" class="imageUploadFrame" style="z-index:999;" >').appendTo('body');
            container = 'imageUploadFrame';
            $("#bottomMenu").hide();
            $("#morePage").hide();
        }
        filepicker.setKey('AM9A7pbm3QPSe24aJU2M2z');
        filepicker.pick({container: container, services: ['COMPUTER', 'FACEBOOK', 'IMAGE_SEARCH', 'URL', 'INSTAGRAM', 'FLICKR', 'DROPBOX', 'PICASA', 'GOOGLE_DRIVE', 'SKYDRIVE','WEBDAV', 'EVERNOTE', 'GMAIL', 'GITHUB']}, function(inkBlob){
            if (pageService.isiOs) {
                $("#imageUploadFrame").remove();
                $("#bottomMenu").show();
                $("#morePage").show();
            }
            $("#achievementImage").attr("src", inkBlob.url);
            filepicker.stat(inkBlob, {width: true, height: true},
                function(metadata){
                    if (metadata.width === metadata.height) {
                        resizeAndSaveImage(inkBlob, 96, 96)
                    } else if (metadata.width > metadata.height) {
                        filepicker.convert(inkBlob, {width: metadata.height, height: metadata.height, fit: 'crop'},  function(squareInkBlob){
                            filepicker.remove(inkBlob, function(){
                                resizeAndSaveImage(squareInkBlob, 96, 96);
                            })
                        }, function(errorMessage) {
                            if (errorMessage) {
                                $scope.errorState = true;
                                $scope.errorMessage = errorMessage;
                            }
                        }, function(progressPercent) {})
                    } else {
                        filepicker.convert(inkBlob, {width: metadata.width, height: metadata.width, fit: 'crop'},  function(squareInkBlob2){
                            filepicker.remove(inkBlob, function(){
                                resizeAndSaveImage(squareInkBlob2, 96, 96);
                            })
                        }, function(errorMessage) {
                            if (errorMessage) {
                                $scope.errorState = true;
                                $scope.errorMessage = errorMessage;
                            }
                        }, function(progressPercent) {});
                    }
                }
            );
        }, function(){ //user closed the modal window
            $scope.$apply(function () {
                $scope.isConverting = false;
            });
        })
    }

    function resizeAndSaveImage (inkBlob, newWidth, newHeight) {
        filepicker.convert(inkBlob, {width: newWidth, height: newHeight},
            function(convertedInkBlob){
                $("#achievementImage").attr("src", inkBlob.url);
                $scope.isConverting = false;
                saveImage(convertedInkBlob.url, function () {
                    filepicker.remove(inkBlob, function() {}, function(fpError){
                        if (fpError) {
                            $scope.errorState = true;
                            $scope.errorMessage = fpError;
                        }
                    });
                });
            }, function(errorMessage) {
                if (errorMessage) {
                    $scope.errorState = true;
                    $scope.errorMessage = errorMessage;
                }
            }, function(progressPercent) {}
        );
    }

    function saveImage(imageURL, callback) {
        $("#achievementImage").attr("src", imageURL);
        callback();
    }
});