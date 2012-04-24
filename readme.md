#Treehouse
What have you achieved today?
[Go to the Treehouse!](http://www.treehouse.io)

##Project
[Basecamp todo](https://lejbrinkbennerhult.basecamphq.com/projects/9535387-treehouse/todo_lists)

[Heroku with MongoHQ](https://api.heroku.com/myapps/treehouseapp)

##Git commands
###push
`cd c://th`, alt. `d:` followed by `cd th`

`git add .`

`git commit -m "comment"`

`git push -u origin master`

###pull
`git fetch origin`

`git merge origin/master`

Click Synchronize `ctrl-alt-y' in WebStorm

##Heroku commands
Push from git to Heroku

`git push heroku master`

Start Heroku

`heroku ps:scale web=1`

Check logs

`heroku logs`

##Mongo locally
####Start database
`c://mongo/bin/mongod` alt `d://mongo/bin/mongod`


####Start database monitor
`c://mongo/bin/mongo`, alt. `d://mongo/bin/mongo`


#####Example find
`db.achievements.find();`

####Clear database
`db.users.remove();`

`db.achievements.remove();`

`db.goals.remove();`

`db.progresses.remove();`

##Local Node.js

`cd c://th`, alt. `d:` followed by `cd th`

`node app.js`

[Climb into your OWN Treehouse!](http://localhost:3000/)

####Simulate production environment
`set NODE_ENV=production` (`set NODE_ENV=development` to restore)

##The missing manual
[jQuery Mobile](http://jquerymobile.com/)

[Node.js](http://nodejs.org/)

[Underscore](http://documentcloud.github.com/underscore/)

[Express](http://expressjs.com/)

[Backbone](http://documentcloud.github.com/backbone/)

