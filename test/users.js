require('dotenv').config

process.env.NODE_ENV = 'test'

let chai = require('chai')
let chaiHttp = require('chai-http')
chai.use(chaiHttp)
chai.should()
const baseUrl = 'http://localhost:8080/users'

describe("POST for /signup and /login", ()=>{
        
    it("it should allow a new user to signup",async ()=>{
        try{
            const queryParams = 
            {
                "name" : "Veerender",
                "password" : "Veeru123",
                "email" : "Veerender123@gmail.com"
            }
            const response = await chai.request(baseUrl)
            .post('/signup')
            .send(queryParams)
            response.should.have.status(200)
            response.body.should.be.a('object')
            response.body.should.have.property('message')
        }
        catch(error){
            console.log("Error is ",error)
        }
    })

    it("it should throw status code 409 for existing mail id",async ()=>{
        try{
            const queryParams = 
            {
                "name" : "Akshay",
                "password" : "Akshay123",
                "email" : "Akshay123@gmail.com"
            }
            const response = await chai.request(baseUrl)
            .post('/signup')
            .send(queryParams)
            response.should.have.status(409)
            response.body.should.be.a('object')
            response.body.should.be.deep.equal({"mesage": "Mail exists"})
        }
        catch(error){
            console.log("Error is ",error)
        }
    })

    it("it should allow an existing user to login",async ()=>{
        try{
            const queryParams = {
                "email" : "Akshay123@gmail.com",
                "password" : "Akshay123"
            }
            const response = await chai.request(baseUrl)
            .post('/login')
            .send(queryParams)
            response.should.have.status(200)
            response.body.should.be.a('object')
            response.body.should.have.property('token')
        }
        catch(error){
            console.log("Error is ",error)
        }
    })
})