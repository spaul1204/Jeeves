
const User = require('../models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const ExpressError = require('../utils/ExpressError')
const jwt = require('jsonwebtoken')


const signUp = async(req,res,next)=>{
    //Querying the db to check if email already exists
    User.find({ email : req.body.email})
    .exec()
    .then(user=>{
        if(user.length >= 1){
            next(new ExpressError('Mail Exists', 409))
        }
        //hashing the password after confirming that person registering is a new user
        else{
            bcrypt.hash(req.body.password, 10, async(err,hash)=>{
                if(err){
                    next(new ExpressError('Auth Failed',401))
                }

                //creating a new user
                else{
                        const user =  new User({ 
                            _id : mongoose.Types.ObjectId(),
                            name : req.body.name,
                            email : req.body.email,
                            password : hash
                        })
                        user.save()
                        .then(result => res.status(200).json({message : 'User has been created successfully'}))
                        .catch(err => next(new ExpressError(err, 401)))
                        
                        //sending welcome mail
                        sendWelcomeMailToUser(req.body.email)
                }
            })
        }
    })
}

const login = async(req,res,next)=>{

    //Querying the db to check if user exists
    User.find({ email : req.body.email })
    .exec()
    .then(user =>{
        if(user.length < 1){
            return next(new ExpressError('Auth Failed', 401))
        }
        //If user exists, comapring the hashed password to confirm if password entered is correct
        else{
            bcrypt.compare(req.body.password, user[0].password, (err,result)=>{
                if(err){
                    return next(new ExpressError('Auth Failed', 401))
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
                return next(new ExpressError('Auth Failed',401))
            }) 
        }
    })
    .catch(err =>{
        next(new ExpressError('Auth Failed',401))
    })
}


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

module.exports = { signUp, login }