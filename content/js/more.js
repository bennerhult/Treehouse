treehouseApp.controller('moreController', function($scope, $http, pageService) {
    "use strict";
    pageService.setTitle('More');

    $scope.uploadUserImage = function(evt) {
        evt.preventDefault();
        $scope.isConverting = true;
        $scope.conversionError = false;

        //TODO visa progress på sidan
        //TODO propagera felmeddelanden
        //TODO fix error handling in morePage.js, copied from signinPage
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
            var progressPercentTotal;
            filepicker.stat(inkBlob, {width: true, height: true},
                function(metadata){
                    if (metadata.width == metadata.height) {
                        userResizeAndStore(inkBlob);
                    } else if (metadata.width > metadata.height) {
                        filepicker.convert(inkBlob, {width: metadata.height, height: metadata.height, fit: 'crop'},  function(squareInkBlob){
                            filepicker.remove(inkBlob, function(){
                                userResizeAndStore(squareInkBlob);
                            })
                        }, function(errorMessage) {
                            $scope.conversionError = true;
                            $scope.errorMessage = errorMessage;
                        }, function(progressPercent) {
                            progressPercentTotal = (progressPercent/2) * (205/100);
                            $("#progress").animate({ width: progressPercentTotal }, 500);
                        })
                    } else {
                        filepicker.convert(inkBlob, {width: metadata.width, height: metadata.width, fit: 'crop'},  function(squareInkBlob2){
                            filepicker.remove(inkBlob, function(){
                                userResizeAndStore(squareInkBlob2);
                            })
                        }, function(errorMessage) {
                            $scope.conversionError = true;
                            $scope.errorMessage = errorMessage;
                        }, function(progressPercent) {
                            progressPercentTotal = (progressPercent/2)*(205/100)
                            //$("#progress").animate({ width: progressPercentTotal }, 500); //TODO
                        });
                    }
                }
            );
        },function(){
            //user closed the modal window
            $scope.$apply(function () {
                $scope.isConverting = false;
            });
        })
    }

    function userResizeAndStore(inkBlob) {  //TODO rename
        var progressPercentTotal;
        filepicker.convert(inkBlob, {width: 96, height: 96},
            function(convertedInkBlob){
                pageService.setUserImageURL(convertedInkBlob.url);
                $scope.isConverting = false;
                saveUserImage(convertedInkBlob.url, function (success) { //TODO show error message
                    //$("#userForm").show(); //TODO
                    //$("#issuerForm").show(); //TODO
                    filepicker.remove(inkBlob, function() {}, function(FPError){});
                });
            }, function(errorMessage) {
                $scope.conversionError = true;
                $scope.errorMessage = errorMessage;
            }, function(progressPercent) {
                progressPercentTotal = (50 + progressPercent/2) *(205/100);
                //$("#progress").animate({ width: progressPercentTotal }, 500); //TODO
            }
        );
    }

    function saveUserImage(imageURL, callback) { //TODO byt till scope.imageUrl
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