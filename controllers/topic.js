
const Topic = require('../models/topic')
const mongoose = require('mongoose')

const getAllTopics = async(req, res, next) => {
    let { pageNumber, nPerPage } = req.query
    let getAllTopics = []
   
    nPerPage = parseInt(nPerPage)
    pageNumber = parseInt(pageNumber)

    const topics = await Topic.find()
        .sort({createdOn : -1})
        .skip(pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0)
        .limit(nPerPage)
        
    topics.forEach(each => getAllTopics.push(each.topicName))
    res.status(200).json({ topics : getAllTopics })
}

const createNewTopic = async(req,res,next) =>{
    const { topicName } = req.body
    const { _id } = res.userData
    console.log("body is ",req.body)
 
    const newTopic = await new Topic({
        _id : mongoose.Types.ObjectId(), 
        topicName : topicName,
        createdBy : _id,
        createdOn : new Date(),
        isDeleted : false 
    })
    newTopic.save()
    // .save()
    // .then(result =>{
    //     console.log("result in db is ",result)
    //     res.status(201).json({response : 'Topic has been created successfully'})
    // })
    // .catch(next)
    res.status(201).json({response : 'Topic has been created successfully'})
}

const getAllPosts = async(req,res,next) => {
    let { pageNumber, nPerPage } = req.query
    let getAllPosts = []

    nPerPage = parseInt(nPerPage)
    pageNumber = parseInt(pageNumber)
   
    const result = await Topic.findOne({ _id : req.params.topicId }, { posts : 1, _id : 0})
                                .sort({createdOn : -1})
                                .skip(pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0)
                                .limit(nPerPage)

    result.posts.forEach(each =>  getAllPosts.push(each))
    
    console.log("array is ",getAllPosts)
    res.status(200).json({ response : getAllPosts })
}

const createNewPost = async(req,res,next) =>{
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
        // .then(result => res.status(201).json({response : 'Post has been created successfully'}))
        // .catch(next)
        res.status(201).json({response : 'Post has been created successfully'})
        
}

const createNewComment = async(req,res,next) =>{
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
            // .then(result => res.status(201).json({response : 'Comment has been created successfully'}))
            // .catch(next)
            res.status(201).json({response : 'Comment has been created successfully'})
    
}

module.exports = { getAllTopics, createNewTopic, getAllPosts, createNewPost, createNewComment }
