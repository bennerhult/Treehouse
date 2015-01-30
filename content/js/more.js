treehouseApp.controller('moreController', function($scope, $http, pageService) {
    "use strict";
    pageService.setTitle('More');

    $scope.firstName = pageService.firstName;
    $scope.lastName = pageService.lastName;

    $scope.nameUpdate = function() {
        pageService.setName($scope.firstName, $scope.lastName, pageService.username);
        $http.post('/api/more/setUsernames', { firstName: $scope.firstName, lastName: $scope.lastName }).success(function() {});
    };

    $scope.uploadUserImage = function(evt) {
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
            pageService.setUserImageURL(inkBlob.url);
            filepicker.stat(inkBlob, {width: true, height: true},
                function(metadata){
                    if (metadata.width === metadata.height) {
                        resizeAndSaveUserImage(inkBlob);
                    } else if (metadata.width > metadata.height) {
                        filepicker.convert(inkBlob, {width: metadata.height, height: metadata.height, fit: 'crop'},  function(squareInkBlob){
                            filepicker.remove(inkBlob, function(){
                                resizeAndSaveUserImage(squareInkBlob);
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
                                resizeAndSaveUserImage(squareInkBlob2);
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

    function resizeAndSaveUserImage(inkBlob) {
        filepicker.convert(inkBlob, {width: 96, height: 96},
            function(convertedInkBlob){
                pageService.setUserImageURL(convertedInkBlob.url);
                $scope.isConverting = false;
                saveUserImage(convertedInkBlob.url, function (error) {
                        if (error.errCode === 1) {
                            $scope.errorState = true;
                            $scope.errorMessage = error;
                        }
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

    function saveUserImage(imageURL, callback) {
        $http.post('/api/more/setUserImage', { imageURL : imageURL }).success(function(error) {
            callback(error);
        });
    }

    $scope.upgradeToIssuer = function(evt) {
        evt.preventDefault();

        $http.post('/api/more/upgradeToIssuer', { username : pageService.username  }).success(function(result) {
            if(result.errCode === 1) {
                $scope.issuerRequestError = true;
            }  else {
                $scope.issuerRequestSent = true;
            }
        });
    };

    $scope.signout = function(evt) {
        evt.preventDefault();

        $http.post('/api/more/signout', {}).success(function(result) {
            document.location =  result.url;
        });
    }
});