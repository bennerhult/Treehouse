var request = require('superagent'),
    expect = require('expect.js')

describe('Treehouse existence', function() {
  it('start screen works', function(done) {
        request.get('http://localhost:1337/').end(function(res) {
            expect(res).to.exist
            expect(res.status).to.equal(200)
            expect(res.text).to.contain('world')
            done()
        })
    })

    //TODO: create test user
    //TODO: login
    //TODO: create achievement
    //TODO: todo publicize
    //TODO: use achievement and user created to test public achievement below
    it('public achievement works', function(done) {
        request.get('http://localhost:1337/achievement?achievementId=524087e03d90f8181200008d&userId=50c5f49c9400f66c170000fd').end(function(res) {
            expect(res).to.exist
            expect(res.status).to.equal(200)
            expect(res.text).to.contain('Explorer')
            done()
        })
    })

    //TODO: use achievement and user created to test private achievement below
    it('private achievement shown when logged in', function(done) {
        request.get('http://localhost:1337/achievement?achievementId=52160a55d2eda1441d0002c7&auserId=50b4ecda20d743b019000031').end(function(res) {
            expect(res).to.exist
            expect(res.status).to.equal(200)
            expect(res.text).to.contain('många')
            done()
        })
    })

})