module.exports = function (app, templates, requestHandlers, user, progress, moment, shareholding, achievement, url) {
    'use strict';

    function registerHandlers() {
        app.post('/api/achievements/init', function (request, response) {
            achievement.getAchievementList(request.session.currentUser._id, function(achievementList) {
                return requestHandlers.respondWithJson(response, { achievementList: achievementList });
            });
        });
    }

    return {
        registerHandlers : registerHandlers
    };


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