var Agenda = require('agenda'),
    newsfeedEvent = require('./models/newsfeedEvent.js'),
    mongoose = require('mongoose')

/*newsfeedFromServer =
 '{'
 + '"userId": "53198378c88de328123c5185"'
 + ',"newsEvents": ['
 + '{'
 + '"EventType":"progress"'
 + ',"AchieverName":"Millhouse Manastorm"'
 + ',"AchieverId":"53198378c88de328123c5185"'
 + ',"AchievementId":"5327018447c7081c15347db4"'
 + ',"AchievementName":"Defated a murLock"'
 + ',"AchievementImageURL":"https://www.filepicker.io/api/file/mhkLpzLHRNmdh1MFfigE"'
 + '},'
 +'{'
 + '"EventType":"progress"'
 + ',"AchieverName":"Millhouse Manastorm"'
 + ',"AchieverId":"53198378c88de328123c5185"'
 + ',"AchievementId":"5327018447c7081c15347db4"'
 + ',"AchievementName":"Defated a murLock again"'
 + ',"AchievementImageURL":"https://www.filepicker.io/api/file/mhkLpzLHRNmdh1MFfigE"'
 + '}'
 + ']'
 + '}'
 */
//TODO split db_uri to vars
var db_uri = 'mongodb://localhost:27017/test'
mongoose.connect(db_uri)
var agenda = new Agenda({db: { address: db_uri}})

agenda.define('populate newsfeeds', function(job, done) {
    newsfeedEvent.NewsfeedEvent.findOne({}, function(err, newsfeedEvent) {
        if (newsfeedEvent) {
            console.log("found a newsfeed event")
            //TODO find all users that should see it
            //TODO add to their newsfeed
            done()
        } else {
            console.log("newsfeed clear!")
            done()
        }
    })
})

agenda.every('10 seconds', 'populate newsfeeds')

agenda.start()