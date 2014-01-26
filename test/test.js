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

casper.test.begin('Testing Public Achievement', 3, function(test){
    casper.start('http://localhost:1337/achievement?achievementId=520a1ea4c6151500070003fe&userId=50c5f49c9400f66c170000fd')

    casper.then(function(){
        test.assertHttpStatus(200);
        test.assertTitle('Treehouse - aa', 'Public achievement has correct title')
        test.assertTextExists('by ', 'page body contains dom only text "by "')
    })

    casper.run(function(){
        test.done()
    })
})

casper.test.begin('Testing Private Achievement', 3, function(test){
    casper.start('http://localhost:1337/achievement?achievementId=52dcfd394e67c8880c000002&userId=50b4ecda20d743b019000031')

    casper.then(function(){
        test.assertHttpStatus(200);
        test.assertTitle('Treehouse', 'Private achievement not accesible when not signed in')
        test.assertTextExists('connect below ', 'page body contains dom only text "by "')
    })

    casper.run(function(){
        test.done()
    })
})