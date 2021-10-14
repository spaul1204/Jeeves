require('dotenv').config()

const jwt = require('jsonwebtoken')
const User = require('../models/user')

module.exports = async(req,res,next) =>{
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const { username } = decoded
        const userID = await User.findOne({ name : username}, { _id : 1})
        res.userData = userID
        console.log("userdata is ",res.userData)
        next()
        //return user id
    }
    catch(error){
        return res.status(401).json({response : 'Auth Failed'})
    } 
}