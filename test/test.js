var request = require('superagent'),
    expect = require('expect.js')

describe('Treehouse existence', function() {
  it('start screen works', function(done) {
        request.get('http://localhost:1337/').end(function(res) {
            expect(res).to.exist
            expect(res.status).to.equal(200)
            //expect(res.body).to.contain('world')
            done()
        })
    })

    it('public achievement works', function(done) {
        request.get('http://localhost:1337/achievement?achievementId=524087e03d90f8181200008d&userId=50c5f49c9400f66c170000fd').end(function(res) {
            expect(res).to.exist
            expect(res.status).to.equal(200)
            done()
        })
    })
})
