var request = require('superagent')
var expect = require('expect.js')

describe('Treehouse existence', function() {
    it('should exist', function(done) {
        request.post('localhost:1337').end(function(res){
            expect(res).to.exist;
            expect(res.status).to.equal(200);
            expect(res.body).to.contain('world');
            done()
        })
    })
})