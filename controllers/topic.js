
const Topic = require('../models/topic')
const mongoose = require('mongoose')

const getAllTopics = async(req, res, next) => {
    let { pageNumber, nPerPage } = req.query
    let getAllTopics = []
   
    nPerPage = parseInt(nPerPage)
    pageNumber = parseInt(pageNumber)

    //sorting the topics based on recent creation and then applying pagination
    const topics = await Topic.find()
        .sort({createdOn : -1})
        .skip(pageNumber > 0 ? ( ( pageNumber - 1 ) * nPerPage ) : 0)
        .limit(nPerPage)
    
    //extracting the topic names for each topic
    topics.forEach(each => getAllTopics.push(each.topicName))

    res.status(200).json({ topics : getAllTopics })
}

const createNewTopic = async(req,res,next) =>{
    const { topicName } = req.body
    const { _id } = res.userData
 
    const newTopic = await new Topic({
        _id : mongoose.Types.ObjectId(), 
        topicName : topicName,
        createdBy : _id,
        createdOn : new Date(),
        isDeleted : false 
    })
    newTopic.save()
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
    
    res.status(200).json({ response : getAllPosts })
}

const createNewPost = async(req,res,next) =>{
    console.log("files ",req.files)
    const { postName } = req.body
    const { _id } = res.userData
    const filePaths = []

    req.files.forEach( eachFile => filePaths.push(eachFile.path))
    
    //updating existing topic to add a new post with multiple images
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
        res.status(201).json({response : 'Post has been created successfully'})
        
}

const createNewComment = async(req,res,next) =>{
    const { comments } = req.body
    const { _id } = res.userData

    //updating an existing Topic to add new comments to a post under the particular topic
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
    
}

module.exports = { getAllTopics, createNewTopic, getAllPosts, createNewPost, createNewComment }
