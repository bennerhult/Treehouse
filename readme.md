#Treehouse
What have you achieved today?
[Go to the Treehouse!](http://www.treehouse.io)

##Project
[Basecamp Trello](https://trello.com/b/xTuMReiw/treehouse)

[Heroku](https://api.heroku.com/myapps/treehouseapp)

[MongoHQ](https://new.mongohq.com/treehouse/mongo/treehouse/collections)

Running tests
`cd c://th/test`
`casperjs test test.js`

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


####Start database monitor
`c://mongo/bin/mongo`


#####Example find
`db.achievements.find();`

####Clear database from all achievements
`db.users.remove();`

`db.achievements.remove();`

`db.goals.remove();`

`db.progresses.remove();`

##Local Node.js

`cd c://th`

`node app.js`

[Climb into your OWN Treehouse!](http://localhost:1337/)

####Simulate production environment
`set NODE_ENV=production` (`set NODE_ENV=development` to restore)


##  Facebook admin
[App admin page] (https://developers.facebook.com/apps/480961688595420/)

##The missing manual
[jQuery Mobile](http://jquerymobile.com/)

[Node.js](http://nodejs.org/)

[Underscore](http://documentcloud.github.com/underscore/)

[Express](http://expressjs.com/)