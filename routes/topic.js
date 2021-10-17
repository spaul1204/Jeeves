require('dotenv').config()

const express = require('express')
const router = express.Router()
const multer = require('multer')
const mongoose = require('mongoose')

//configuring the storage parameters of the uploaded files
const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, 'uploads/')
    },
    filename : function(req, file, cb){
        cb(null, file.originalname)
    }
})

//checking the file type of the uploaded files
const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }
    else{
        cb(new Error('Only JPEG/JPG/PNG formats supported'),false)
    }
}
const upload = multer({ storage : storage, fileFilter : fileFilter })
const Topic = require('../models/topic')
const authenticate = require('../middleware/aunthenticate')

//routes

router.get('/', authenticate, async(req,res,next) =>{
    let { pageNumber, nPerPage } = req.query
    let getAllTopics = []
   
    nPerPage = parseInt(nPerPage)
    pageNumber = parseInt(pageNumber)

    await Topic.find()
        .sort({createdOn : -1})
        .skip(pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0)
        .limit(nPerPage)
        .then(result =>{    
            console.log("result ",result)
            result.forEach(each =>{
                getAllTopics.push(each.topicName)
            })
            res.status(200).json({ topics : getAllTopics})
        })
        .catch(next)
})

router.post('/', authenticate, async(req,res,next) =>{
    const { topicName } = req.body
    const { _id } = res.userData
    console.log("body is ",req.body)
 
    await new Topic({
        _id : mongoose.Types.ObjectId(), 
        topicName : topicName,
        createdBy : _id,
        createdOn : new Date(),
        isDeleted : false 
    })
    .save()
    .then(result =>{
        console.log("result in db is ",result)
        res.status(201).json({response : 'Topic has been created successfully'})
    })
    .catch(next)
})

router.get('/:topicId/posts', authenticate, async(req,res,next) =>{
    let { pageNumber, nPerPage } = req.query
    let getAllPosts = []

    nPerPage = parseInt(nPerPage)
    pageNumber = parseInt(pageNumber)
    
    try{
        const result = await Topic.findOne({ _id : req.params.topicId }, { posts : 1, _id : 0})
                                    .sort({createdOn : -1})
                                    .skip(pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0)
                                    .limit(nPerPage)

        result.posts.forEach(each =>  getAllPosts.push(each))
        
        console.log("array is ",getAllPosts)
        res.status(200).json({ response : getAllPosts })
    }
    catch(error){
        res.status(500).json({ response : error})
    }
})

router.post('/:topicId/posts', authenticate, upload.array('imageFile', 10), async(req,res,next) =>{
    console.log("files ",req.files)
    const { postName } = req.body
    const { _id } = res.userData
    const filePaths = []

    req.files.forEach( eachFile => filePaths.push(eachFile.path))
 
    await Topic.updateOne(
        { _id : req.params.topicId },
        { $push: 
            { posts: 
                {   _id : mongoose.Types.ObjectId(),
                    postName : postName,
                    createdBy : _id,
                    createdOn : new Date(),
                    isDeleted : false,
                    images : filePaths
                }
            }
        })
        .then(result => res.status(201).json({response : 'Post has been created successfully'}))
        .catch(next)
        
})

router.post('/:topicId/posts/:postId/comments', authenticate, async(req,res,next) =>{
    const { comments } = req.body
    const { _id } = res.userData
        await Topic.updateOne(
            { 'posts._id' : req.params.postId },
            { $push: 
                { 'posts.$.comments': 
                    {
                        content : comments,
                        createdBy : _id,
                        createdOn : new Date(),
                        isDeleted : false
                    }
                }
            })
            .then(result => res.status(201).json({response : 'Comment has been created successfully'}))
            .catch(next)
    
})

module.exports = router