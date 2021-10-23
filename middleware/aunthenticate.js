require('dotenv').config()

const jwt = require('jsonwebtoken')
const User = require('../models/user')
const ExpressError = require('../utils/ExpressError')

module.exports = async(req,res,next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const { username } = decoded
        const userID = await User.findOne({ name : username}, { _id : 1})
        if(!userID){
            return next(new ExpressError('Invalid User ID',404)) 
        }
        res.userData = userID
        console.log("userdata is ",res.userData)
        next()
        
    }
    catch(error){
        return res.status(401).json({response : 'Auth Failed'})
    } 
}