const mongoose = require('mongoose')

const topicSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    topicName : { type : String },
    createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdOn : { type : Date },
    isDeleted : { type : Boolean },
    posts : [{
        _id : mongoose.Schema.Types.ObjectId,
        postName : {type : String},
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdOn : { type : Date },
        isDeleted : { type : Boolean },
        images : [],
        comments : [{
            _id : mongoose.Schema.Types.ObjectId,
            content : {type : String},
            createdBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            createdOn : { type : Date },
            isDeleted : { type : Boolean },
        }]
    }]
})

module.exports = mongoose.model("Topic", topicSchema)