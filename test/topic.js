let chai = require('chai')
let chaiHttp = require('chai-http')
const topicSchema = require('../models/topic')
chai.use(chaiHttp)
chai.use(require('chai-json-schema'));
chai.should()

const baseUrl = 'http://localhost:8080'

let request = require('supertest')(baseUrl);

describe('GET /topic', function(){
    it('GET /topic?pageNumber=1&nPerPage=5 should require authorization', function(done) {
        request
            .get('/topic?pageNumber=1&nPerPage=5')
            .expect(401)
            .end(function(err, res) {
                if (err) return done(err);
                done();
            });
    });

    var auth = {};
    before(loginUser(auth));

    it('GET /topic?pageNumber=1&nPerPage=5 should respond with all topics', function(done) {
        request
            .get('/topic?pageNumber=1&nPerPage=5')
            .set('Authorization', 'Bearer ' + auth.token)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.property('topics')
                done();
            });
    });

    var auth = {};
    before(loginUser(auth));

    it('GET /topic/6166ecda369768ddbc04e9fc/posts?pageNumber=1&nPerPage=5 should respond with all posts and comments of post id = 6166ecda369768ddbc04e9fc ', function(done) {
        request
            .get('/topic/6166ecda369768ddbc04e9fc/posts?pageNumber=1&nPerPage=5')
            .set('Authorization', 'Bearer ' + auth.token)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                res.body.should.have.key('response')
                res.body.response.should.be.an('array')
                res.body.response.forEach(each =>{
                    each.should.have.jsonSchema(topicSchema)
                })
                done();
            });
    });

});

function loginUser(auth) {
    return function(done) {
        request
            .post('/users/login')
            .send({
                email: 'phoenix122195@gmail.com',
                password: 'phoenix123'
            })
            .expect(200)
            .end(onResponse);

        function onResponse(err, res) {
            // console.log("Auth res is ",res.body)
            auth.token = res.body.token;
            return done();
        }
    };
}


