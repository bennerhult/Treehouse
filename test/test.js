var loginToken
var userId1
var achievementId1


casper.test.begin('Testing signing out before signing in 1', 3, function(test) {
    casper.start('http://localhost:1337/signout')

    casper.then(function(){
        test.assertHttpStatus(200)
        test.assertTitle('Treehouse', 'Start page achievement has correct title')
        test.assertTextExists('connect below', 'page body contains dom only text "connect below "')
    })

    casper.run(function(){
        test.done()
    })
})

casper.test.begin('Testing Start Page', 3, function(test) {
    casper.start('http://localhost:1337/deleteUser?username=tester@treehouse.io', function() {})

    casper.thenOpen('http://localhost:1337', function() {})

    casper.then(function(){
        test.assertHttpStatus(200)
        test.assertTitle('Treehouse', 'Start page achievement has correct title')
        test.assertTextExists('connect below', 'page body contains dom only text "connect below "')
    })

    casper.run(function(){
        test.done()
    })
})

 casper.test.begin('Testing entering new user', 1, function(test){
     casper.start('http://localhost:1337/checkUser?username=tester@treehouse.io&appMode=false')

     casper.then(function(){
         test.assertHttpStatus(201)    //new user
         loginToken = JSON.parse(this.getPageContent())
     })
     casper.run(function(){
        test.done()
     })
 })

casper.test.begin('Testing faulty Sign in, bad token', 2, function(test){
    casper.start('http://localhost:1337/signin?email=tester@treehouse.io&token=123456789&appMode=false')

    casper.then(function() {
        test.assertTitle('Treehouse', 'correct title')
        test.assertTextExists('connect below', 'shows login page')
    })

    casper.run(function() {
        test.done()
    })
})

casper.test.begin('Testing faulty Sign in, bad email', 2, function(test){
    casper.start('http://localhost:1337/signin?email=faulty@treehouse.io&token=' + loginToken + '&appMode=false')

    casper.then(function() {
        test.assertTitle('Treehouse', 'correct title')
        test.assertTextExists('connect below', 'shows login page')
    })

    casper.run(function() {
        test.done()
    })
})

 casper.test.begin('Testing creating new user', 1, function(test){
     casper.start('http://localhost:1337/signup?email=tester@treehouse.io&token=' + loginToken + '&appMode=false')
     casper.then(function(){
         test.assertHttpStatus(200)
     })

     casper.thenOpen('http://localhost:1337/signout3', function() {})

     casper.run(function(){
         test.done()
     })
 })

casper.test.begin('Testing create token', 1, function(test){
     casper.start('http://localhost:1337/checkUser?username=tester@treehouse.io&appMode=false')

     casper.then(function(){
         test.assertHttpStatus(200)    //existing user
         loginToken = JSON.parse(this.getPageContent())
     })

     casper.run(function() {
         test.done()
     })
 })

casper.test.begin('Testing fetching userId', 1, function(test){
    casper.start('http://localhost:1337/userIdForUsername?username=tester@treehouse.io')

    casper.then(function() {
        test.assertHttpStatus(200)
        userId1 = JSON.parse(this.getPageContent())
    })

    casper.run(function() {
        test.done()
    })
})

casper.test.begin('Testing setting pretty name', 1, function(test){
    casper.start('http://localhost:1337/setPrettyName?user_id=' + userId1 + '&firstName=Tester&lastName=Schmester')

    casper.then(function() {
        test.assertHttpStatus(200)
    })

    casper.run(function() {
        test.done()
    })
})

casper.test.begin('Testing correct Sign in', 3, function(test){
    casper.start('http://localhost:1337/signin?email=tester@treehouse.io&token=' + loginToken + '&appMode=false')

    casper.then(function() {
        test.assertHttpStatus(200)
        test.assertTitle('Treehouse - Newsfeed', 'Sign on show correct title')
        test.assertTextExists('Tester Schmester', 'page contains "Tester Schmester"')
    })

    casper.run(function() {
        test.done()
    })
})

casper.test.begin('Testing Create Achievement', 1, function(test){
    casper.start('http://localhost:1337/newAchievement?user_id=' + userId1 + '&title=TestAchievement&description=Testing achievement&currentImage=treehouse.io/content/img/achievementImages/1.png&goalTitles=["testGoal1"]&goalQuantities=2')

    casper.then(function(){
        test.assertHttpStatus(200)
        achievementId1 = JSON.parse(this.getPageContent())
    })

    casper.run(function(){
        test.done()
    })
})

casper.test.begin('Testing Private Achievement when signed in', 3, function(test){
    casper.start('http://localhost:1337/achievement?achievementId=' + achievementId1 + '&userId=' + userId1)

    casper.then(function(){
        test.assertHttpStatus(200)
        test.assertTitle('Treehouse - TestAchievement', 'Public achievement has correct title')
        test.assertTextExists('Tester Schmester', 'Public achievement has correct user')
    })

    casper.run(function(){
        test.done()
    })
})

casper.test.begin('Testing deleting Achievement when signed in', 2, function(test) {
    casper.start('http://localhost:1337/delete?achievementId=' + achievementId1)

    casper.then(function(){
        test.assertHttpStatus(200)
        test.assertTextExists('ok', 'Delete reported ok')
    })

    casper.run(function(){
        test.done()
    })
})

casper.test.begin('Testing sign out', 3, function(test) {
    casper.start('http://localhost:1337/signout')

    casper.then(function(){
        test.assertHttpStatus(200)
        test.assertTitle('Treehouse', 'Correct title')
        test.assertTextExists('connect below', 'page body contains "connect below"')
    })

    casper.run(function(){
       test.done()
    })
})

casper.test.begin('Testing reusing token ', 3, function(test){
    casper.start('http://localhost:1337/signin?email=tester@treehouse.io&token=' + loginToken + '&appMode=false')

    casper.then(function() {
        test.assertHttpStatus(200)
        test.assertTitle('Treehouse', 'Should lead to start page')
        test.assertTextExists('connect below', 'page body contains "connect below"')
    })

    casper.run(function() {
        test.done()
    })
})

 casper.test.begin('Testing Private Achievement when signed out', 3, function(test){
     casper.start('http://localhost:1337/achievement?achievementId=52dcfd394e67c8880c000002&userId=50b4ecda20d743b019000031')

     casper.then(function(){
         test.assertHttpStatus(200)
         test.assertTitle('Treehouse', 'Private achievement not accessible when not signed in')
         test.assertTextExists('connect below ', 'page body contains dom only text "connect below "')
     })

     casper.run(function(){
        test.done()
     })
 })