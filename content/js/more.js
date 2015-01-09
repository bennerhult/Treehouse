treehouseApp.controller('moreController', function($scope, $http, pageService) {
    "use strict";
    pageService.setTitle('More');

    $scope.uploadUserImage = function(evt, newsItem) {
        evt.preventDefault();
        console.log("uploading user IMAGE");

        //TODO visa meddelanden på sidan
        //TODO visa progress på sidan
        //TODO visa uppladdade bilden på sidan
        //TODO spara uppladdade bilden
        //TODO fixa for iOs
        //TODO remove console.log

        var container = 'modal'
        /*if (isiOs) {
            $('<iframe id="imageUploadFrame" class="imageUploadFrame" style="z-index:999;" >').appendTo('body');
            container = 'imageUploadFrame'
        }*/
        filepicker.setKey('AM9A7pbm3QPSe24aJU2M2z');
        //BOX
        //FTP
        //VIDEO
        //WEBCAM
        filepicker.pick({container: container,
            services: ['COMPUTER', 'FACEBOOK', 'IMAGE_SEARCH', 'URL', 'INSTAGRAM', 'FLICKR', 'DROPBOX', 'PICASA', 'GOOGLE_DRIVE', 'SKYDRIVE','WEBDAV', 'EVERNOTE', 'GMAIL', 'GITHUB']}, function(inkBlob){
            /*if (isiOs) {
                $("#imageUploadFrame").remove()
            }*/
            $("#userImage").attr("src", inkBlob.url)

            $("#message").html('<div id="achievement-container"><div class="part-achievement"><div class="progress-container"><h3>Converting image... </h3><table border="1px"><tbody><tr><td class="bararea"><span class="progressbar" style="top: 25px;"></span><div id="progressbar-goal"><span id="progress" class="progress" style="top: 26px; width:0%"></span></div></div></td><td id="countarea" class="countarea"><h3> </h3></td><td></td></tr></tbody></table></div></div></div>')
            var progressPercentTotal
            filepicker.stat(inkBlob, {width: true, height: true},
                function(metadata){
                    if (metadata.width == metadata.height) {
                        userResizeAndStore(inkBlob)
                    } else if (metadata.width > metadata.height) {
                        filepicker.convert(inkBlob, {width: metadata.height, height: metadata.height, fit: 'crop'},  function(squareInkBlob){
                            filepicker.remove(inkBlob, function(){
                                userResizeAndStore(squareInkBlob)
                            })
                        }, function(errorMessage) {
                            $("#message").html("Image conversion error: " + errorMessage)
                        }, function(progressPercent) {
                            progressPercentTotal = (progressPercent/2) * (205/100)
                            $("#progress").animate({ width: progressPercentTotal }, 500)
                        })
                    } else {
                        filepicker.convert(inkBlob, {width: metadata.width, height: metadata.width, fit: 'crop'},  function(squareInkBlob2){
                            filepicker.remove(inkBlob, function(){
                                userResizeAndStore(squareInkBlob2)
                            })
                        }, function(errorMessage) {
                            $("#message").html("Image conversion error: " + errorMessage)
                        }, function(progressPercent) {
                            progressPercentTotal = (progressPercent/2)*(205/100)
                            $("#progress").animate({ width: progressPercentTotal }, 500)
                        })
                    }
                }
            )
        },function(){
            //user closed the modal window
            //$("#userForm").show()
            //$("#issuerForm").show()
        })

    }

    function userResizeAndStore(inkBlob) {
        var progressPercentTotal
        filepicker.convert(inkBlob, {width: 96, height: 96},
            function(convertedInkBlob){
                $("#userImage").attr("src", convertedInkBlob.url)
                filepicker.remove(inkBlob, function(){
                    $("#message").html("")
                    $("#userForm").show()
                    $("#issuerForm").show()
                }, function(FPError){})
            }, function(errorMessage) {
                $("#message").html("Image conversion error: " + errorMessage)
            }, function(progressPercent) {
                progressPercentTotal = (50 + progressPercent/2) *(205/100)
                $("#progress").animate({ width: progressPercentTotal }, 500)
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