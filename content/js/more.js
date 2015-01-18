treehouseApp.controller('moreController', function($scope, $http, pageService) {
    "use strict";
    pageService.setTitle('More');

    $scope.uploadUserImage = function(evt) {
        evt.preventDefault();
        $scope.isConverting = true;
        $scope.errorState = false;

        //TODO fixa for iOs

        var container = 'modal';
        /*if (isiOs) {
            $('<iframe id="imageUploadFrame" class="imageUploadFrame" style="z-index:999;" >').appendTo('body');
            container = 'imageUploadFrame';
        }*/
        filepicker.setKey('AM9A7pbm3QPSe24aJU2M2z');
        filepicker.pick({container: container,
            services: ['COMPUTER', 'FACEBOOK', 'IMAGE_SEARCH', 'URL', 'INSTAGRAM', 'FLICKR', 'DROPBOX', 'PICASA', 'GOOGLE_DRIVE', 'SKYDRIVE','WEBDAV', 'EVERNOTE', 'GMAIL', 'GITHUB']}, function(inkBlob){
            /*if (isiOs) {
                $("#imageUploadFrame").remove()
            }*/
            pageService.setUserImageURL(inkBlob.url);
            filepicker.stat(inkBlob, {width: true, height: true},
                function(metadata){
                    if (metadata.width == metadata.height) {
                        resizeAndStoreUserImage(inkBlob);
                    } else if (metadata.width > metadata.height) {
                        filepicker.convert(inkBlob, {width: metadata.height, height: metadata.height, fit: 'crop'},  function(squareInkBlob){
                            filepicker.remove(inkBlob, function(){
                                resizeAndStoreUserImage(squareInkBlob);
                            })
                        }, function(errorMessage) {
                            if (errorMessage) {
                                $scope.errorState = true;
                                $scope.errorMessage = errorMessage;
                            }
                        }, function(progressPercent) {
                            $("#progress").animate({ width: progressPercent - 50 }, 500);
                        })
                    } else {
                        filepicker.convert(inkBlob, {width: metadata.width, height: metadata.width, fit: 'crop'},  function(squareInkBlob2){
                            filepicker.remove(inkBlob, function(){
                                resizeAndStoreUserImage(squareInkBlob2);
                            })
                        }, function(errorMessage) {
                            if (errorMessage) {
                                $scope.errorState = true;
                                $scope.errorMessage = errorMessage;
                            }
                        }, function(progressPercent) {
                            $("#progress").animate({ width: progressPercent -50 }, 500);
                        });
                    }
                }
            );
        },function(){ //user closed the modal window
            $scope.$apply(function () {
                $scope.isConverting = false;
            });
        })
    }

    function resizeAndStoreUserImage(inkBlob) {
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
            }, function(progressPercent) {
                $("#progress").animate({ width: progressPercent }, 500);
            }
        );
    }

    function saveUserImage(imageURL, callback) {
        $http.post('/api/more/setUserImage', { imageURL : imageURL }).success(function(error) {
            callback(error);
        });
    }

    $scope.signout = function(evt) {
        evt.preventDefault();

        $http.post('/api/more/signout', {}).success(function(result) {
            document.location =  result.url;
        });
    }
});