//var expect = require('expect.js')

/*casper.test.begin('Testing Google', 1, function(test){
    casper.start('http://google.com')

    casper.then(function(){
        test.assertTitle('Google', 'Google has correct title');
    })

    casper.run(function(){
        test.done()
    })
})*/

casper.test.begin('Testing Public Achievements', 2, function(test){
    casper.start('http://localhost:1337/achievement?achievementId=520a1ea4c6151500070003fe&userId=50c5f49c9400f66c170000fd')

    casper.then(function(){
        test.assertTitle('Treehouse - aa', 'Public achievement has correct title')
        test.assertTextExists('by ', 'page body contains dom only text "by "')
    })

    casper.run(function(){
        test.done()
    })
})