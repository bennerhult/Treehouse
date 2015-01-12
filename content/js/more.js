treehouseApp.controller('moreController', function($scope, $http, pageService) {
    "use strict";
    pageService.setTitle('More');

    $scope.uploadUserImage = function(evt) {
        evt.preventDefault();
        $scope.isConverting = true;
        $scope.conversionError = false;

        //TODO visa progress på sidan
        //TODO spara uppladdade bilden
        //TODO fixa for iOs

        var container = 'modal'
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
            $("#userImage").attr("src", inkBlob.url);

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
                            $scope.conversionError = true; // TODO propagate error message
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
                            $scope.conversionError = true; // TODO propagate error message
                        }, function(progressPercent) {
                            progressPercentTotal = (progressPercent/2)*(205/100)
                            //$("#progress").animate({ width: progressPercentTotal }, 500); //TODO
                        });
                    }
                }
            );
        },function(){
            //user closed the modal window
            //$("#userForm").show();
            //$("#issuerForm").show();
        })

    }

    function userResizeAndStore(inkBlob) {
        var progressPercentTotal;
        filepicker.convert(inkBlob, {width: 96, height: 96},
            function(convertedInkBlob){
                $("#userImage").attr("src", convertedInkBlob.url);
                $scope.isConverting = false;
                $scope.$apply();
                filepicker.remove(inkBlob, function() {
                    //$("#userForm").show(); //TODO
                    //$("#issuerForm").show(); //TODO
                }, function(FPError){});
            }, function(errorMessage) {
                $scope.conversionError = true; // TODO propagate error message
            }, function(progressPercent) {
                progressPercentTotal = (50 + progressPercent/2) *(205/100);
                //$("#progress").animate({ width: progressPercentTotal }, 500); //TODO
            }
        );
    }

    $scope.signout = function(evt) {
        evt.preventDefault();

        $http.post('/api/more/signout', {}).success(function(result) {
            document.location =  result.url;
        });
    }
});