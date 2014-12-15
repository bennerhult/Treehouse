var mongoose = require('mongoose'),
    newsItem = require('./newsItem.js'),
    _ = require("underscore")._,
    Schema = mongoose.Schema;

var NewsfeedSchema = new Schema({
    created         : {type: Date, required: true},
    latestUpdated   : {type: Date, required: true},
    userId          : {type: Schema.ObjectId, required: true},
    newsItems       : {type: [newsItem.NewsItemSchema], required: true}
});

var Newsfeed = mongoose.model('Newsfeed', NewsfeedSchema);

module.exports = {
    Newsfeed: Newsfeed,
    createNewsfeed: createNewsfeed,
    updateNewsfeed: updateNewsfeed,
    removeFromNewsfeed: removeFromNewsfeed,
    getNewsfeed: getNewsfeed
}

function createNewsfeed(userId, newsType, newsText, callback) {
    var newsfeed = new Newsfeed();
    newsfeed.created = new Date();
    newsfeed.userId = userId;
    finalizeNewsFeed(newsfeed, newsType, newsText, callback);
}

var welcomeMsgNewsFeed = "Welcome to Treehouse! Get started by adding some friends or create your very own achievements!";

function removeFromNewsfeed(userId, currentAchievementId, callback) {
    console.log("removing from newsfeed for user " + userId + " and achievement " + currentAchievementId); //TODO remove after testing
    Newsfeed.findOne({ userId: userId}, function(err, currentNewsfeed) {
        if (currentNewsfeed) {
            currentNewsfeed.latestUpdated = new Date();
            currentNewsfeed.newsItems = _.reject(currentNewsfeed.newsItems, function(newsItem) {
                return newsItem.newsJson.indexOf('"AchievementId":"' + currentAchievementId) > -1;
            });
            currentNewsfeed.save(function () {
                if (callback) {
                    callback(currentNewsfeed);
                }
            });
        } else {
            console.log("nothing to remove from newsfeed for userID " + userId + ", and achievementId " + currentAchievementId )//TODO: remove after testing
        }
    });
}

function updateNewsfeed(userId, newsType, newsText, callback) {
    Newsfeed.findOne({ userId: userId}, function(err, currentNewsfeed) {
        if (currentNewsfeed) {
            finalizeNewsFeed(currentNewsfeed, newsType, newsText, callback);
        } else {
            createNewsfeed(userId, "info", welcomeMsgNewsFeed,  function(createdNewsfeed) {
                finalizeNewsFeed(createdNewsfeed, newsType, newsText, callback);
            });
        }
    });
}

function finalizeNewsFeed(currentNewsfeed, newsType, newsText, callback) {
    newsItem.createNewsItem(newsType, newsText, function(createdNewsItem) {
        currentNewsfeed.latestUpdated = new Date();
        currentNewsfeed.newsItems.unshift(createdNewsItem);
        currentNewsfeed.save(function () {
            if (callback) {
                callback(currentNewsfeed);
            }
        });
    });
}

function getNewsfeed(user_Id, callback) {
    Newsfeed.findOne({ userId: user_Id}, function(err, currentNewsfeed) {
        if (currentNewsfeed) {
            callback(currentNewsfeed);
        } else {
            createNewsfeed(user_Id, "info", welcomeMsgNewsFeed, callback);
        }
    });
}