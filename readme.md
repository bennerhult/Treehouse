#Treehouse
What have you achieved today?
[Go to the Treehouse!](http://www.treehouse.io)

##Project
[Trello](https://trello.com/b/xTuMReiw/treehouse)

[Heroku](https://api.heroku.com/myapps/treehouseapp)

[MongoHQ](https://new.mongohq.com/treehouse/mongo/treehouse/collections)

Running tests
`cd c://th/test`
`casperjs test test.js`

##Check versions of Node and NPM
`node -v`

`npm -v`

`npm list` (version of npm modules)

##Git commands
###push
`cd c://th`

`git add .`

`git commit -m "comment"`

`git push origin master`

###pull
`git fetch origin`

`git merge origin/master`

###restore
`cd c://th`

`git checkout .` (. means all files, totally possible to restore just one file too)


##Heroku commands
Push from local repo to Heroku

`git push heroku master`

Start Heroku

`heroku restart`

Check logs

`heroku logs`


See available versions for Node and NPM

[Node](http://heroku-buildpack-nodejs.s3.amazonaws.com/manifest.nodejs)

[NPM](http://heroku-buildpack-nodejs.s3.amazonaws.com/manifest.npm)


##Mongo locally
####Start database
`c://mongo/bin/mongod`

`c://mongo/bin/mongod --dbpath c:/mongo_data`


####Start database monitor
`c://mongo/bin/mongo`


#####Example find
`db.achievements.find();`

####Clear database from all achievements
`db.achievements.remove();`

`db.goals.remove();`

`db.progresses.remove();`

##Local Node.js

`cd c://th`

`node app.js`

[Climb into your OWN Treehouse!](http://localhost:1337/)

####Simulate production environment
`set NODE_ENV=production` (`set NODE_ENV=development` to restore)


##newsfeedQueuer

####Set this once to get it to find your database locally
`set DB_URI=mongodb://localhost:27017/test`

####To run it locally
 `cd c://th`

 `node newsfeedQueuer.js`

####administrate scheduling on Heroku
[Heroku scheduler] (https://scheduler.heroku.com/dashboard)

##  Facebook admin
[App admin page] (https://developers.facebook.com/apps/480961688595420/)

##Skip login email in development
Create a file in the same folder as app.js called run.bat (it's in .gitignore) with this content:

    SET TH_AUTOLOGIN=true
    node app.js

This will cause the server to send back the login link to the browser which will redirect the user directly there instead of sending an email. This setting only works in devlopment mode and you may need to clear the browser cache for this to work.



##The missing manual
[jQuery Mobile](http://jquerymobile.com/)

[Node.js](http://nodejs.org/)

[Underscore](http://documentcloud.github.com/underscore/)

[Express](http://expressjs.com/)
