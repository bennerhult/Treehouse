var mongoose = require('mongoose'),
    async = require('async'),
    goal = require('./goal.js'),
    user = require('./user.js'),
    achievement = require('./achievement.js'),
    newsfeedEvent = require('./newsfeedEvent.js'),
    Schema = mongoose.Schema;

var schemaOptions = {
    toObject: {
        virtuals: true,
        methods: true
    }
    , toJSON: {
        virtuals: true,
        methods: true
    }
};

var AchievementInstanceSchema = new Schema({
    createdDate: { type: Date, required: true },
    unlockedDate: { type: Date },
    createdBy: { type: Schema.ObjectId, required: true },
    originalCreatedBy: { type: Schema.ObjectId, required: true },
    createdByName: { type: String, required: true },
    createdByImageURL: { type: String, required: true },
    achievementId: { type: Schema.ObjectId, required: true },
    title: { type: String, required: true },
    description: { type: String },
    imageURL: { type: String, required: true },
    publiclyVisible: { type: Boolean, required: true },
    isShared: { type: Boolean, required: true },
    percentageCompleted: { type: Number, required: true },
    goals: { type: [goal.GoalSchema], required: true }
}, schemaOptions);

var AchievementInstance = mongoose.model('AchievementInstance', AchievementInstanceSchema);

module.exports = {
    AchievementInstance,
    isVisibleToUser,
    createAchievement,
    createIssuedAchievement,
    acceptIssuedAchievement,
    issue,
    userHasAcceptedAchievement,
    progress,
    publicize,
    unpublicize,
    remove,
    getAchievementList,
    getCompareList,
    getPublicAchievement,
    createAchievementInstance,
    progressByCount,
    editAchievement
}

function editAchievement(editRequestedByUserId, achievementId, changes, callback) {
    achievement.Achievement.update({ _id: achievementId}, { $set: changes}, {}, function () {        
        //TODO: Protect against editing achievements not created by the requesting user
        AchievementInstance.find({
            achievementId: achievementId
        }, {}, {}, function (err, instances) {
            if(err) {
                throw err;
            }
            async.each(instances, function (currentInstance, cb) {
                //TODO: Figure out how to do this dynamically with something likes mergeInto(currentInstance, changes)
                if(changes.title) {
                    currentInstance.title = changes.title;
                }
                if(changes.description) {
                    currentInstance.description = changes.description;
                }
                currentInstance.save(function (err) {
                    if(err) {
                        throw err;
                    }
                    cb();
                })                
            }, function () {
                callback();
            });            
        });        
    });
}

function createAchievement(createdBy, title, description, imageURL, goals, callback) {
    var myAchievement = new achievement.Achievement();
    myAchievement.createdDate = new Date();
    myAchievement.createdBy = createdBy._id;
    myAchievement.title = title;
    myAchievement.description = description;
    myAchievement.imageURL = imageURL;
    async.each(goals, function (currentGoal, goalProcessed) {
        var myGoal = goal.prepareGoal(currentGoal.title, currentGoal.quantity);
        myAchievement.goals.push(myGoal);
        goalProcessed();
    }, function () {
        myAchievement.save(function (error) {
            createAchievementInstance(myAchievement, createdBy, callback)
        });
    });
}

function createAchievementInstance(motherAchievement, userLocal, callback, more) {
    var myAchievementInstance = new AchievementInstance();
    myAchievementInstance.createdDate = new Date();
    myAchievementInstance.createdBy = userLocal._id;
    myAchievementInstance.originalCreatedBy = motherAchievement.createdBy;
    myAchievementInstance.createdByName =  user.getPrettyName(userLocal);
    myAchievementInstance.createdByImageURL = userLocal.imageURL;
    myAchievementInstance.achievementId = motherAchievement._id;
    myAchievementInstance.title = motherAchievement.title;
    myAchievementInstance.description = motherAchievement.description;
    myAchievementInstance.imageURL = motherAchievement.imageURL;
    myAchievementInstance.publiclyVisible = false;
    myAchievementInstance.isShared = false;
    myAchievementInstance.percentageCompleted = 0;
    myAchievementInstance.goals = motherAchievement.goals;
    if (more) {
        myAchievementInstance.publiclyVisible = more.publiclyVisible;
    }
    if(more && more.originalCreatedBy) {
        myAchievementInstance.originalCreatedBy = more.originalCreatedBy
    }    
    myAchievementInstance.save(function (error) {
        if(error) {
            throw error;
        }
        callback(myAchievementInstance);
    });
}

AchievementInstanceSchema.virtual('createdByUser').get(function () {
    if (this.createdBy.equals(this.originalCreatedBy)) {
        return true;
    } else {
        return false;
    }
});

/*
before calling isVisibleToUser, if you have a possible shared achievement, check to see if there exists 
a shared achievement by checking if there is an achievementInstance (ai) with the same 
(parent)achievementId and created by the user in question, as in:
                achievementInstance.AchievementInstance.findOne({
                        achievementId: ai.achievementId,
                        createdBy: friendUserId
                    },function (err, eventualSharedAchievementInstance) {
                        if (achievementInstance.isVisibleToUser(ai, request.session.currentUser._id, eventualSharedAchievementInstance)) {                    
*/
function isVisibleToUser(achievementInstance, userId, eventualSharedAchievementInstance) {
    if (achievementInstance.createdBy.equals(userId)) {
        return true;
    } else if (achievementInstance.originalCreatedBy.equals(userId)) {
        return true;
    } else if (achievementInstance.publiclyVisible) {
        return true;
    } else if (achievementInstance.isShared) {
        if (eventualSharedAchievementInstance) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function createIssuedAchievement(createdBy, title, description, imageURL, issuerName) {
    var achievementInstance = new AchievementInstance();
    /* achievement.createdDate = new Date();
     achievement.createdBy = createdBy;
     achievement.title = title;
     achievement.description = description;
     achievement.imageURL = imageURL;
     achievement.issuedAchievement = true;
     achievement.issuerName = issuerName;*/
    return achievementInstance;
}

function getPublicAchievement(achievementInstanceId, callback) {
    AchievementInstance.findById(achievementInstanceId, function (err1, currentAchievementInstance) {
        if (currentAchievementInstance && currentAchievementInstance.publiclyVisible && currentAchievementInstance.publiclyVisible === true) {
            callback(currentAchievementInstance);
        } else {
            callback();
        }
    });
}

function getAchievementList(userId, callback) {
    AchievementInstance.find({
        createdBy: userId,
        unlockedDate: { $exists: false }
    }, {}, { sort: { 'created': -1 } }, function (err, achievementInstancesInProgress) {
        AchievementInstance.find({ createdBy: userId, unlockedDate: { $exists: true } }, {}, { sort: { 'created': -1 } }, function (err2, achievementInstancesUnlocked) {
            callback(achievementInstancesInProgress, achievementInstancesUnlocked);
        });
    });
}

function getCompareList(userId, achievementId, callback) {
    AchievementInstance.find({
        achievementId: achievementId,
        createdBy: { '$ne': userId },
    }, {}, { sort: { 'created': -1 } },
        function (err, compareList) {
            callback(compareList);
        });
}

function userHasAcceptedAchievement(achievement_id, achiever_id, callback) {
    /* progress.Progress.findOne({ achievement_id: achievement_id, achiever_id: achiever_id}, function(err,currentAchievement) {
         if (currentAchievement) {
             callback(true);
         } else {
             callback(false);
         }
     });*/
}

function acceptIssuedAchievement(achievement_id, achiever_id, callback) {
    /*Achievement.findOne({ _id: achievement_id }, function(err,currentAchievement) {
        currentAchievement.goals.forEach(function(goal, index) {
            progress.createAndSaveProgress(achiever_id, achievement_id, goal._id);
            if (index == currentAchievement.goals.length -1)  {
                callback(currentAchievement.title);
            }
        });
    });*/
}

function issue(achievement, callback) {
    /* achievement.isIssued = true;
     achievement.save(function (error) {
         callback(error);
     });*/
}

function progress(goalToUpdate, achievementToUpdate, callback) {
    progressByCount(goalToUpdate, achievementToUpdate, 1, callback)
}

function progressByCount(goalToUpdate, achievementToUpdate, quantityToProgress, callback) {
    if (goalToUpdate.quantityCompleted < goalToUpdate.quantityTotal) {
        var newQuantityCompleted = 0;
        var newQuantityTotal = 0;
        var newGoalCompleted;
        async.each(achievementToUpdate.goals, function (currentGoal, goalProcessed) {
            if (currentGoal._id == goalToUpdate._id) {
                currentGoal.quantityCompleted = currentGoal.quantityCompleted + quantityToProgress;
                newGoalCompleted = currentGoal.quantityCompleted;
            }
            newQuantityCompleted += currentGoal.quantityCompleted;
            newQuantityTotal += currentGoal.quantityTotal;
            goalProcessed();
        }, function () {
            achievementToUpdate.percentageCompleted = 100 * (newQuantityCompleted / newQuantityTotal);
            if (newQuantityCompleted >= newQuantityTotal) {
                achievementToUpdate.unlockedDate = new Date();
            }
            var id = achievementToUpdate._id;
            delete achievementToUpdate._id;
            if (achievementToUpdate.toObject) {
                //The findAndUpdate code explodes if achievementToUpdate is a mongoose object so this wierdness is needed
                achievementToUpdate = achievementToUpdate.toObject()
            }
            AchievementInstance.findByIdAndUpdate(id, achievementToUpdate, function (err, updatedAchievement) {
                callback(updatedAchievement);
            });
        });
    } else {
        callback(achievementToUpdate);
    }
}

function publicize(achievementInstance, callback) {
    achievementInstance.publiclyVisible = true;
    var id = achievementInstance._id;
    delete achievementInstance._id;
    AchievementInstance.findByIdAndUpdate(id, achievementInstance, function (err, updatedAchievement) {
        callback(updatedAchievement);
    });
}

function unpublicize(achievementInstance, callback) {
    achievementInstance.publiclyVisible = false;
    var id = achievementInstance._id;
    delete achievementInstance._id;
    AchievementInstance.findByIdAndUpdate(id, achievementInstance, function (err, updatedAchievement) {
        callback(updatedAchievement);
    });
}

function remove(achievementInstance, next) {
    AchievementInstance.findById(achievementInstance._id, function (err1, currentAchievementInstance) {
        var achievementId = achievementInstance.achievementId;
        currentAchievementInstance.remove(function () {
            achievement.Achievement.findById(achievementId, function (err2, currentAchievement) {
                currentAchievement.remove(function () {
                    if (next) {
                        next();
                    }
                });
            });
        });
    });
}