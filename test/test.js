casper.test.begin('Testing Start Page', 3, function(test){
    casper.start('http://localhost:1337')

    casper.then(function(){
        test.assertHttpStatus(200);
        test.assertTitle('Treehouse', 'Start page achievement has correct title')
        test.assertTextExists('connect below', 'page body contains dom only text "connect below "')
    })

    casper.run(function(){
        test.done()
    })
})

var loginToken

casper.test.begin('Testing Public Achievement', 3, function(test){
    casper.start('http://localhost:1337/achievement?achievementId=520a1ea4c6151500070003fe&userId=50c5f49c9400f66c170000fd')

    casper.then(function(){
        test.assertHttpStatus(200);
        test.assertTitle('Treehouse - aa', 'Public achievement has correct title')
        test.assertTextExists('by Erik Bennerhult', 'page body contains dom only text "by Erik Bennerhult"')
    })

    casper.run(function(){
        test.done()
    })
})

//create token
casper.test.begin('Testing Sign in', 1, function(test){
    casper.start('http://localhost:1337/checkUser?username=erik@lejbrinkbennerhult.se&appMode=false')

    casper.then(function(){
        test.assertHttpStatus(200);     //user already exists

        //read token
        loginToken = JSON.parse(this.getPageContent());
        this.echo(loginToken)

    })

    casper.run(function(){
        test.done()
    })
})


casper.test.begin('Testing Sign in', 3, function(test){
    casper.start('http://localhost:1337/signin?email=erik@lejbrinkbennerhult.se&token=' +loginToken + '&appMode=false')

    casper.then(function(){
        test.assertHttpStatus(200);
        test.assertTitle('Treehouse - Achievements', 'Sign on show correct title')
        test.assertTextExists('Erik Bennerhult', 'page body contains dom only text "Erik Bennerhult"')

    })

    casper.run(function(){
        test.done()
    })
})


casper.test.begin('Testing Private Achievement when signed in', 3, function(test){
    casper.start('http://localhost:1337/achievement?achievementId=52dcfd394e67c8880c000002&userId=50b4ecda20d743b019000031')

    casper.then(function(){
        test.assertHttpStatus(200);
        test.assertTitle('Treehouse - test4', 'Private achievement accessible when signed in')
        test.assertTextExists('test4', 'page body contains "test4"')
    })

    casper.run(function(){
        test.done()
    })
})

/*
//TODO funkar bara när utloggad
casper.test.begin('Testing Private Achievement when signed out', 3, function(test){
    casper.start('http://localhost:1337/achievement?achievementId=52dcfd394e67c8880c000002&userId=50b4ecda20d743b019000031')

    casper.then(function(){
        test.assertHttpStatus(200);
        test.assertTitle('Treehouse', 'Private achievement not accessible when not signed in')
        test.assertTextExists('connect below ', 'page body contains dom only text "connect below "')
    })

    casper.run(function(){
        test.done()
    })
})*/