require('dotenv').config()

const express = require('express')
const router = express.Router()
const parameterValidation = require('../middleware/validateParams')
const topicController = require('../controllers/topic')
const fileHandling = require('../middleware/fileHandling')
const authenticate = require('../middleware/aunthenticate')
const catchAsync = require('../utils/CatchAsync')

//route for creating a new topic and getting all the topics
router.route('/')
        .get(authenticate, 
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
        .post(authenticate,
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

 //route for handling both creation of a new post and fetching all the posts           
router.route('/:topicId/posts')
        .get(authenticate,
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
        .post(authenticate,
                fileHandling.upload.array('imageFile', 10),
                catchAsync(topicController.createNewPost)
            )

//route for creation of a new comment
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