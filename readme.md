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

#### test environment
[URL](http://treehouseapp-test.herokuapp.com/)
[New URL](http://treehouseapp-test.herokuapp.com/preSignin)

The web server is Heroku, the database is a MongoDB on Compose (former MongoHQ). This mirrors the setup in production.
DB user: testtreehouser
DB pw: simple
DB connection string: mongodb://testtreehouser:simple@dogen.mongohq.com:10014/treehouse-test

To set environment variables and such, log into the [Heroku dashboard](https://dashboard.heroku.com).

##see logs
Command prompt:

    heroku logs -app treehouseapp-test

##deployment
By checking in code to the master branch on the Treehouse-project on GitHub, the code is automagically deployed to the test environment. A manual deploy can be made from the [Heroku dashboard](https://dashboard.heroku.com).

.
####Simulate production environment
`set NODE_ENV=production` (`set NODE_ENV=development` to restore)

####Set this once to get it to find your database locally
`set DB_URI=mongodb://localhost:27017/test`

##Skip sign in email in development
Create a file in the same folder as app.js called run.bat (it's in .gitignore) with this content:

    SET TH_AUTOSIGNIN=true
    node app.js

This will cause the server to send back the sign in link to the browser which will redirect the user directly there instead of sending an email. This setting only works in development mode and you may need to clear the browser cache for this to work.

To get all the way to zero click sign in, add a setting in localstorage called 'th_autosignin_email' and put your email in there. All this does is have the email be autotyped in the email field and then simulates a click on the sign in button.

##Skip sign in for easier testing
First of all, install the Chrome extension [HTML5 localstorage manager](chrome-extension://giompennnhheakjcnobejbnjgbbkmdnd/options.html)

Then open it and add the setting 'th_autosignin_email' and the email of your choice, your username.

If you want to swap user for testing user interaction such as sharing or newsfeed, open the extension and swap to the new username you wish to use. Sign out and you will instantly be signed in as the new user.
##newsfeedQueuer

####To run it locally
 `cd c://th`

 `node newsfeedQueuer.js`

####administrate scheduling on Heroku
[Heroku scheduler] (https://scheduler.heroku.com/dashboard)

##  Facebook admin
[App admin page] (https://developers.facebook.com/apps/480961688595420/)

##The missing manual
[jQuery Mobile](http://jquerymobile.com/)

[Node.js](http://nodejs.org/)

[Underscore](http://documentcloud.github.com/underscore/)

[Express](http://expressjs.com/)

##Angular introduction
- Part 1 - Simplest possible angular setup: http://jsfiddle.net/w7L223z3/
- Part 2 - Handling clicks: http://jsfiddle.net/n017166L/1/
- Part 3 - Talking to the server: http://jsfiddle.net/a6zkx8zm/1/
