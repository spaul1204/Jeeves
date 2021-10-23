require('dotenv').config()


const express = require('express')
const router = express.Router()

const UserController = require('../controllers/user')
const catchAsync = require('../utils/CatchAsync')

 
router.post('/signup', catchAsync(UserController.signUp))

//route for logging an existing user
router.post('/login', catchAsync(UserController.login))



module.exports = router