require('dotenv').config()

const express = require('express')
const router = express.Router()
const parameterValidation = require('../middleware/validateParams')
const topicController = require('../controllers/topicController')
const fileHandling = require('../middleware/fileHandling')
const authenticate = require('../middleware/aunthenticate')
const catchAsync = require('../utils/CatchAsync')
const expressError = require('../utils/ExpressError')

//routes

router.get('/',
            authenticate, 
            parameterValidation.validateParams('get',
            [
                {
                    param_key: 'pageNumber',
                    required: true,
                    type: 'string'
                },
                {
                    param_key: 'nPerPage',
                    required: true,
                    type: 'string'
                }
            ]),
            catchAsync(topicController.getAllTopics)
        )

router.post('/',
            authenticate,
            parameterValidation.validateParams('post',
            [
                {
                    param_key: 'topicName',
                    required: true,
                    type: 'string'
                }
            ]),
            catchAsync(topicController.createNewTopic)
        )

router.get('/:topicId/posts',
            authenticate,
            parameterValidation.validateParams('get',
            [
                {
                    param_key: 'pageNumber',
                    required: true,
                    type: 'string'
                },
                {
                    param_key: 'nPerPage',
                    required: true,
                    type: 'string'
                }
            ]),
            catchAsync(topicController.getAllPosts)
        )

router.post('/:topicId/posts', authenticate, fileHandling.upload.array('imageFile', 10), catchAsync(topicController.createNewPost))

router.post('/:topicId/posts/:postId/comments',
                authenticate,
                parameterValidation.validateParams('post',
                [
                    {
                        param_key: 'comments',
                        required: true,
                        type: 'string'
                    }
                ]),
                catchAsync(topicController.createNewComment)
            )

module.exports = router