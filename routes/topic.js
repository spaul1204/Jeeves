require('dotenv').config()

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const moment = require('moment')
const storage = multer.diskStorage({
    destination : function(req, file, cb){
        cb(null, 'uploads/')
    },
    filename : function(req, file, cb){
        cb(null, file.originalname)
    }
})
const fileFilter = (req, file, cb) =>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true)
    }
    else{
        cb(new Error('Only JPEG/JPG/PNG formats supported'),false)
    }
}
const upload = multer({ storage : storage, fileFilter : fileFilter })
const User = require('../models/user')
const Topic = require('../models/topic')
const authenticate = require('../middleware/aunthenticate')

//routes

router.get('/', authenticate, (req,res,next) =>{
    let { pageNumber, nPerPage } = req.query
    let getAllTopics = []
   
    nPerPage = parseInt(nPerPage)
    pageNumber = parseInt(pageNumber)

    Topic.find()
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
        .catch(error =>{
            res.send(error)
        })
})

router.post('/', authenticate, async(req,res) =>{
    const { topicName } = req.body
    const { _id } = res.userData
    console.log("body is ",req.body)
 
    await new Topic({
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
    .catch(err =>{
        console.log("err is ",err)
    })
})

router.get('/:topicId/posts', authenticate, async(req,res) =>{
    let { pageNumber, nPerPage } = req.query
    let getAllPosts = []

    nPerPage = parseInt(nPerPage)
    pageNumber = parseInt(pageNumber)
    
    try{
        const result = await Topic.findOne({ _id : req.params.topicId }, { posts : 1, _id : 0})
                                    .sort({createdOn : -1})
                                    .skip(pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0)
                                    .limit(nPerPage)
    
        console.log("result is ",result)                            
        result.posts.forEach(each => {
            console.log("type is ",typeof each.createdOn)
            // let time = moment.utc(each.createdOn).format("HH:mm")
            // each.createdOn = each.createdOn.toISOString().slice(0,10) +  " " + time
            console.log("created ",each.createdOn)
            getAllPosts.push(each)
        })
        
        console.log("array is ",getAllPosts)
        res.status(200).json({ response : getAllPosts })
    }

    catch(error){
        res.status(500).json({ response : error})
    }

})

router.post('/:topicId/posts', authenticate, upload.array('imageFile', 10), async(req,res) =>{
    console.log("files ",req.files)
    const { postName } = req.body
    const { _id } = res.userData
    const filePaths = []

    req.files.forEach( eachFile => filePaths.push(eachFile.path))

    await Topic.updateOne(
        { _id : req.params.topicId },
        { $push: 
            { posts: 
                {
                    postName : postName,
                    createdBy : _id,
                    createdOn : new Date(),
                    isDeleted : false,
                    images : filePaths
                }
            }
        })

    res.status(201).json({response : 'Post has been created successfully'})
})

router.post('/:topicId/posts/:postId/comments', authenticate, async(req,res) =>{
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

    res.status(201).json({response : 'Comment has been created successfully'})
})

module.exports = router