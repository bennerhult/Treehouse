module.exports = function (app, templates, user, progress, moment, shareholding, achievement, url, requestHandlers) {
    'use strict';

    function respondWithJson(response, data) {
        response.writeHead(200, {'content-type': 'application/json' });
        response.write(JSON.stringify(data));
        response.end('\n', 'utf-8');
    }

    function registerHandlers() {
        app.get('/app/achievements2', function (request, response){
            templates.serveHtmlRaw(response, './server-templates/achievements.html', {});
        });
        app.post('/api/achievements/init', function (request, response) {
            var userId = request.session.currentUser._id;
            requestHandlers.getPrettyNameIdAndImageURL(userId, function(prettyName, myUserId, userImageURL) {
                achievement.getAchievementList(userId, function(achievementList) {
                    return respondWithJson(response, { prettyName : prettyName, userImageURL : userImageURL, achievementList: achievementList });
                });
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };

    function getGoalText(goal, achievement, progressNumber, latestUpdated, progressPercentage, publicView, lastGoal, isNotificationView, achieverIsIssuer) {
        if (!latestUpdated) {
            latestUpdated = '<span id="latestUpdated' + goal._id +'"></span>'
        }  else {
            latestUpdated = '<span id="latestUpdated' + goal._id + '"> (' +  moment(latestUpdated).format('MMM Do YYYY') + ')</span>'
        }
        var goalText =  '<div class="part-achievement">'
            + '<div class="progress-container">'
            + '<h3>'
            + goal.title + latestUpdated
            + '</h3>'
            + '<table border="1px">'
            + '<tr>'
            + '<td class="bararea">'
            + '<div class="progress-goal-container">'
            + '<span class="progressbar"></span>'
            + '<div id="progressbar-goal' + goal._id + '"><span class="progress" id="progress' + goal._id + '" style="width:'
            + progressPercentage
            + '%;"></span></div></div>'
            + '</td>'
            + '<td id="countarea' + goal._id + '" class="countarea">'
            + '<h3>'
            + progressNumber
            + '/'
            + goal.quantityTotal
            + '</h3>'
            + '</td><td>'
        goalText    += '<div id="addbutton' + goal._id + '" class="addbutton">'
        if (!isNotificationView && !publicView && progressPercentage < 100 &&!achieverIsIssuer) {
            goalText    += '<a href="javascript:void(0)" onclick="progress(\'' + goal._id + '\', \'' +  goal.quantityTotal + '\')">'
                + '<img src="content/img/+.png" alt="I did it!"/>'
                + '</a>'
        }
        goalText    += '</div></td></tr>'
            + '</table>'
        goalText    += '<div class="clear"></div>'
        goalText    += '</div>'
        if (!lastGoal) {
            goalText    += '<div class="separerare-part">&nbsp;</div>'
        }
        goalText    += '</div>'
        return goalText
    }

    function writeAchievementPage(response, achiever, currentAchievement, userId, isNotificationView, sharerId) {
        var myQuantityTotal = 0
        var myQuantityFinished = 0
        var goalTexts = []
        var achievementDesc = ''

        var checkingOtherPersonsAchievement = (achiever._id != userId)
        var achievementUser_id
        if (isNotificationView) {
            achievementUser_id = sharerId
        }  else {
            achievementUser_id = achiever._id
        }
        if(currentAchievement.goals) {
            requestHandlers.getPrettyNameIdAndImageURL(currentAchievement.createdBy, function(creatorName, creatorId, creatorImageURL) {
                requestHandlers.getPrettyNameIdAndImageURL(achiever._id, function(achieverName, achieverId, achieverImageURL) {
                    currentAchievement.goals.forEach(function(goal) {
                        progress.Progress.findOne({ goal_id: goal._id, achiever_id: achievementUser_id }, function(err,myProgress) {
                            if (err) {
                                console.log("error in app.js 3: couldn't find progress for user " + achieverId)
                            } else {
                                myQuantityFinished += myProgress.quantityFinished
                                myQuantityTotal += goal.quantityTotal
                            }
                        })
                    })
                    progress.Progress.findOne({ achievement_id: currentAchievement._id, achiever_id: achiever._id}, {}, { sort: { 'latestUpdated' : -1 } }, function(err, latestProgress) {
                        currentAchievement.goals.forEach(function(goal) {
                            if (isNotificationView) {
                                progress.Progress.findOne({   goal_id: goal._id }, function(err,myProgress) {
                                    if (err) {
                                        console.log("error in app.js 4: couldn't find progress for user " + achiever._id)
                                    } else {
                                        var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                                        goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, myProgress.latestUpdated, goalPercentageFinished, checkingOtherPersonsAchievement, goalTexts.length + 1 == currentAchievement.goals.length, isNotificationView, achiever.isIssuer))
                                        if (goalTexts.length === currentAchievement.goals.length) {
                                            var goalTextsText = ""
                                            var goalTextsGoneThrough = 0
                                            goalTexts.forEach(function(goalText) {
                                                goalTextsText += goalText
                                                goalTextsGoneThrough++
                                                if (goalTextsGoneThrough === goalTexts.length) {
                                                    var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100
                                                    if (checkingOtherPersonsAchievement) {
                                                        achievementDesc += '<div class="achievement-info"><div class=""><div id="userarea"><img src="' + achieverImageURL + '" /><a href="javascript:void(0)" onclick="openAchievements(false, \'' + achiever._id + '\', ' + true +')">' + achieverName + '</a><p>has not accepted your challenge</p></div>'
                                                    }   else {
                                                        achievementDesc += '<div class="achievement-info"><div class=""><div id="userarea"><img src="' + creatorImageURL + '" /><a href="javascript:void(0)" onclick="openAchievements(false, \'' + creatorId + '\', ' + true +')">' + creatorName + '</a><p>shared an achievement with you</p></div>'
                                                    }
                                                    if (!checkingOtherPersonsAchievement) {
                                                        achievementDesc += '<div class="actionmenu"><ul><li><a href="javascript:void(0)" onclick="confirmAchievement(\'' + currentAchievement._id + '\', \'' + achiever._id + '\')"><img src="content/img/challengeaccepted.png" alt="challenge accepted" /></a></li><li class=""><a href="javascript:void(0)" onclick="ignoreAchievement(\'' + currentAchievement._id + '\', \'' + achiever._id + '\')"><img src="content/img/ignore.png" alt="Ignore" /></a></li></ul></div>'
                                                    }
                                                    achievementDesc +=    '</div><div class="separerare"> </div><div class="textarea"><h2>'
                                                        + currentAchievement.title
                                                        + '</h2>'
                                                    achievementDesc +=    '<p id="creator"> by ' + creatorName  + '</p>'
                                                    achievementDesc += '<p id="achievementDescription">'
                                                        + currentAchievement.description
                                                        + '</p></div>'
                                                        + '<div class="imagearea"><img src="'
                                                        + currentAchievement.imageURL
                                                        +'" alt="'
                                                        +  currentAchievement.createdBy + ": " + currentAchievement.title
                                                        + '"/><span class="gradient-bg"></span><span class="progressbar"></span><div id="progressbar" class="progress-container"><span class="progress" style="width:'
                                                        + myPercentageFinished
                                                        + '%;"></span></div></div><div class="clear"></div>'

                                                    achievementDesc += '<div id="achievement-container">'
                                                    achievementDesc += goalTextsText
                                                    achievementDesc += '</div><div id="sharer-container"></div><div id="comparer-container"></div>'
                                                    response.write(JSON.stringify(achievementDesc))
                                                    response.end('\n', 'utf-8')
                                                }
                                            })
                                        }
                                    }
                                })
                            }  else {
                                shareholding.isAchievementShared(currentAchievement._id, function(isAchievementShared) {
                                    progress.Progress.findOne({ goal_id: goal._id, achiever_id: achiever._id}, function(err, myProgress) {
                                        if (err) {
                                            console.log("error in app.js 6: couldn't find progress for user " + achiever._id + ", " + err)
                                        } else {
                                            var goalPercentageFinished = (myProgress.quantityFinished / goal.quantityTotal) * 100
                                            goalTexts.push(getGoalText(goal, currentAchievement, myProgress.quantityFinished, myProgress.latestUpdated ,goalPercentageFinished, checkingOtherPersonsAchievement, goalTexts.length + 1 == currentAchievement.goals.length, isNotificationView, achiever.isIssuer))
                                            if (goalTexts.length == currentAchievement.goals.length) {
                                                var goalTextsText = ""
                                                var goalsGoneThrough = 0
                                                goalTexts.forEach(function(goalText) {
                                                    goalTextsText += goalText
                                                    goalsGoneThrough++
                                                    if (goalsGoneThrough === goalTexts.length) {
                                                        var myPercentageFinished = (myQuantityFinished / myQuantityTotal) * 100

                                                        achievementDesc += '<div class="achievement-info"><div id="userarea"><img src="' + achiever.imageURL + '" /><a class="headerlink" href="javascript:void(0)" onclick="openAchievements(false, \'' + achiever._id + '\', ' + checkingOtherPersonsAchievement + ', \'' + achieverName + '\')">' + achieverName + '</a></div> '
                                                        if (!checkingOtherPersonsAchievement) {
                                                            achievementDesc += '<div class="actionmenu"><ul>'
                                                            if (currentAchievement.issuedAchievement) {
                                                                if (!currentAchievement.isIssued) {
                                                                    achievementDesc += '<li id="issueButton"><a href="javascript:void(0)" onclick="issue()"><img src="content/img/issue.png" /></a></li>'
                                                                }
                                                            } else {
                                                                if (myProgress.publiclyVisible) {
                                                                    achievementDesc += '<li id="unpublicizeButton"><a href="javascript:void(0)" onclick="unpublicize()"><img src="content/img/unpublicize.png" /></a></li>'
                                                                    achievementDesc += '<li id="publicizeButton" style="display:none"><a href="javascript:void(0)" onclick="publicize()"><img src="content/img/publicize.png" /></a></li>'
                                                                }  else {
                                                                    achievementDesc += '<li id="unpublicizeButton" style="display:none"><a href="javascript:void(0)" onclick="unpublicize()"><img src="content/img/unpublicize.png" /></a></li>'
                                                                    achievementDesc += '<li id="publicizeButton"><a href="javascript:void(0)" onclick="publicize()"><img src="content/img/publicize.png" /></a></li>'
                                                                }
                                                            }
                                                            if (!currentAchievement.isIssued) {
                                                                achievementDesc += '<li id="deleteButton" class="rightalign"><a href="javascript:void(0)" onclick="deleteAchievement(\'' + achiever._id + '\')"><img src="content/img/delete.png" /></a></li>'
                                                                if (myPercentageFinished == 0 && !isAchievementShared) {
                                                                    achievementDesc += '<li id="editButton" class="rightalign"><a href="javascript:void(0)" onclick="editAchievement(\'' + achiever._id + '\')"><img src="content/img/edit.png" /></a></li>'
                                                                }
                                                            }
                                                            achievementDesc += '</ul></div>'
                                                        }
                                                        achievementDesc += '<div class="separerare"> </div><div class="textarea"><h2>'

                                                        if (currentAchievement.issuedAchievement) {
                                                            achievementDesc += currentAchievement.issuerName  + ': '
                                                        }
                                                        achievementDesc += currentAchievement.title + '</h2>'
                                                        if (currentAchievement.createdBy != userId &&  !currentAchievement.issuedAchievement) {
                                                            achievementDesc += '<p id="creator"> by ' + creatorName  + '</p>'
                                                        }
                                                        achievementDesc += '<p id="achievementDescription">'
                                                            + currentAchievement.description
                                                            + '</p>'

                                                            + '</div>'
                                                            + '<div class="imagearea"><img '
                                                        if (isAchievementShared) {
                                                            achievementDesc +=  'class = "shared"'
                                                        }
                                                        achievementDesc += 'src="'
                                                            + currentAchievement.imageURL
                                                            +'" alt="'
                                                            +  currentAchievement.createdBy + ": " + currentAchievement.title
                                                            + '"/><span class="gradient-bg"></span><span class="progressbar"></span><div id="progressbar" class="progress-container"><span id="mainProgress" class="progress" style="width:'
                                                            + myPercentageFinished
                                                            + '%;"></span></div>'
                                                        if(myPercentageFinished >= 100) {
                                                            achievementDesc += '<span class="unlockedDate achievementpage"><div>Unlocked <br/>' +  moment(latestProgress.latestUpdated).format("MMM Do YYYY")  + '</div></span>'
                                                        }
                                                        achievementDesc += '</div><div class="clear"></div>'

                                                        if(!checkingOtherPersonsAchievement && !achiever.isIssuer) {
                                                            achievementDesc += '<div id="achievementTabs"><a style="color:black" href="javascript:void(0)" onclick="progressTab()"><span id="progressTab">My progress</span></a><a style="color:black" href="javascript:void(0)" onclick="compareTab()"><span id="compareTab">Compare</span></a><a style="color:black" href="javascript:void(0)" onclick="shareTab()"><span id="shareTab">Share</span></a><div class="clear"></div></div>'
                                                        }
                                                        achievementDesc += '<div id="achievement-container">'
                                                        achievementDesc += goalTextsText
                                                        achievementDesc += '</div>'

                                                        //using public domain - localhost makes FB-like component not load since localhost is not registered as a Treehouse app domain
                                                        var achLink = "http://www.treehouse.io/achievement?achievementId=" + currentAchievement._id + "&userId=" + achiever._id

                                                        var encodedAchLink = encodeURIComponent(achLink)
                                                        achievementDesc += '<div id="sharer-container"></div><div id="compare-container"></div>'
                                                        achievementDesc += '<div id="appcontainerSocial" class="publicWrap"><div id="fbLike" style="overflow: visible">'

                                                        achievementDesc +='<iframe width="95" src="//www.facebook.com/plugins/like.php?href=' + encodedAchLink + '&amp;width&amp;layout=button_count&amp;locale=en_US&amp;action=like&amp;show_faces=true&amp;share=false&amp;height=80&amp;appId=480961688595420" scrolling="no" frameborder="0" style="border:none; overflow:hidden; height:80px;" allowTransparency="true"></iframe>'

                                                        achievementDesc += '</div><div id="fbShare"><a onclick="fbShare(\''+ encodeURIComponent(currentAchievement.title) + '\', \'' +  achLink +'\', \'' + currentAchievement.imageURL + '\')" href="javascript:void(0)"><span><img src="content/img/f-icon.png"><p>Share</p></span></a>'
                                                        achievementDesc += '</div>'
                                                        achievementDesc += '<div id="tweetAchievement" style="overflow:visible;">'
                                                        achievementDesc += '<a href="https://twitter.com/share?url=' + encodedAchLink + '&text=' + currentAchievement.title + '" class="twitter-share-button">Tweet</a>'
                                                        achievementDesc +='<script type="text/javascript">(function() {var s = document.createElement("SCRIPT");var c = document.getElementsByTagName("script")[0];s.type = "text/javascript";s.async = true;s.src = "http://platform.twitter.com/widgets.js";c.parentNode.insertBefore(s, c);})();</script>'
                                                        achievementDesc += '</div><div class="clear"> </div></div></div>'
                                                        response.write(JSON.stringify(achievementDesc))
                                                        response.end('\n', 'utf-8')

                                                    }
                                                })
                                            }
                                        }
                                    })
                                })
                            }
                        })
                    })
                })
            })
        }
    }

    function showAchievementPage(request, response) {
        var url_parts = url.parse(request.url, true)
        var currentAchievementId = url_parts.query.achievementId.trim()
        var isNotificationViewString = url_parts.query.isNotificationView.trim()
        var isNotificationView = (isNotificationViewString === 'true')
        var sharerId
        if (isNotificationView) {
            sharerId = url_parts.query.sharerId.trim()
        }
        var achieverId = url_parts.query.achieverId
        progress.Progress.findOne({ achievement_id: currentAchievementId, achiever_id: achieverId }, function(err,currentProgress) {
            request.session.current_achievement_id = currentAchievementId
            achievement.Achievement.findOne({ _id: currentAchievementId }, function(err,currentAchievement) {
                user.User.findOne({ _id: achieverId }, function(err,currentAchiever) {
                    if (request.session.currentUser) {
                         writeAchievementPage(response, currentAchiever, currentAchievement, request.session.currentUser._id, isNotificationView, sharerId);
                    } else if (currentAchievement && (currentProgress.publiclyVisible || currentAchievement.issuedAchievement))    {
                        writeAchievementPage(response, currentAchiever, currentAchievement, null, isNotificationView, sharerId);
                    } else {
                        requestHandlers.writeDefaultPage(request, response);
                    }
                })
            })
        })
    }

    return {
        showAchievementPage : showAchievementPage
    };
}