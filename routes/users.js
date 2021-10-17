require('dotenv').config()

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/user')
const nodemailer = require('nodemailer');


/**
 * @swagger
 * components:
 *      schemas:
 *          User:
 *              type: object
 *              required:
 *                  - email
 *                  - password
 *                  - name
 *              properties:
 *                  _id:
 *                      type: string
 *                      description: auto generated
 *                  email:
 *                      type: string
 *                      description: stores the emailid of the user used for signup
 *                  name:
 *                      type: string
 *                      description: stores the username
 *                  password:
 *                      type: string
 *                      description: password used to register the user
 *              example:
 *                  _id: hdvh7263
 *                  email: test@test.com
 *                  name: testuser
 *                  password: testPassword
 */

/**
 * @swagger
 * tags:
 *  name: User
 *  description: The Api managing signup and login
 *      
 */

 /**
  * @swagger
  * /users/signup:
  *     post:
  *         summary: Creates a new user and saves it in the db
  *         tags: [User]
  *         requestBody:
  *             required: true
  *             content:
  *                 application/json:
  *                     schema:
  *                         $ref: '#/components/schemas/User'
  *         responses:
  *             200:
  *                 description: User has successfully signed up and has been saved to the db
  *                 
  *             401:
  *                 description: Authorization has failed for the user
  *             409:
  *                 description: User is already registered with that email id
  *                 
  * 
  */

/**
  * @swagger
  * /users/login:
  *     post:
  *         summary: Logs in an existing user
  *         tags: [User]
  *         requestBody:
  *             required: true
  *             content:
  *                 application/json:
  *                     schema:
  *                         type: object
  *                         required:
  *                             - email
  *                             - password
  *                         properties:
  *                             email:
  *                                 type: string
  *                             password:
  *                                 type: string
  *                         example:
  *                             email: test@test.com
  *                             password: testPassword
  *         responses:
  *             200:
  *                 description: User has successfully signed up and has been saved to the db
  *                 
  *             401:
  *                 description: Authorization has failed for the user
  *                 
  * 
  */
 
router.post('/signup',(req,res,next)=>{
    //Querying the db to check if email already exists
    User.find({ email : req.body.email})
    .exec()
    .then(user=>{
        if(user.length >= 1){
            return res.status(409).json({ mesage : "Mail exists"})
        }
        //hashing the password after confirming that person registering is a new user
        else{
            bcrypt.hash(req.body.password, 10, (err,hash)=>{
                if(err){
                    res.status(401).json({message : 'Auth Failed'})
                }
                //creating a new user
                else{
                    const user = new User({ 
                        _id : mongoose.Types.ObjectId(),
                        name : req.body.name,
                        email : req.body.email,
                        password : hash
                    })
                    user.save()
                    .then(result => res.status(200).json({message : 'User has been created successfully'}))
                    .catch(err => res.status(401).json({message : err}))
                    
                    //sending welcome mail
                    sendWelcomeMailToUser(req.body.email)
                }
            })
        }
    })
})

//route for logging an existing user
router.post('/login',(req,res,next)=>{

    //Querying the db to check if user exists
    User.find({ email : req.body.email })
    .exec()
    .then(user =>{
        if(user.length < 1){
            res.status(401).json({message : 'Auth Failed'})
        }
        //If user exists, comapring the hashed password to confirm if password entered is correct
        else{
            bcrypt.compare(req.body.password, user[0].password, (err,result)=>{
                if(err){
                    return res.status(401).json({
                        message : "Auth Failed"
                    })
                }
                //generating an authorisation token on successful comparison of password
                if(result){
                    const token = jwt.sign({
                        email : user[0].email,
                        userId : user[0]._id,
                        username : user[0].name,
                    }, process.env.ACCESS_TOKEN_SECRET,{
                        expiresIn : '1h'
                    })
                    return res.status(200).json({ message : "Auth Successful", token })    
                }
                return res.status(401).json({
                    message : "Auth Failed"
                })
            }) 
        }
    })
    .catch(err =>{
        res.status(401).json({message : 'Auth Failed'})
    })
})

function sendWelcomeMailToUser(toMail){
    const fromMail = 'spaul1204@gmail.com';
    let subject = 'Welcome to BlogPost!!';
    let text = "Congratulations!! You have succesfully signed up on our portal. Now you can create posts and socialise with other people by liking, sharing and commenting on their posts. Happy Blogging!!" 
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: fromMail ,
            pass: 'Surviving@2021TillIDie!'
        }
        });
    // email options
    let mailOptions = {
        from: fromMail,
        to: toMail,
        subject: subject,
        text: text
        }
    // send email
    transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.log("Error is ",error);
        }
        console.log("Response is ",response)
        });
}

module.exports = router