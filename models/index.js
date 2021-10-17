require('dotenv').config()

const mongoose = require('mongoose')
const DB_URI = 'mongodb+srv://SnehaR:' + process.env.MONGO_PWD + '@cluster0.z26g7.mongodb.net/Blog?retryWrites=true&w=majority'

function connect(){
    return new Promise((resolve,reject)=>{
            mongoose.connect(DB_URI,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                })
                .then((res, err)=>{
                    if(err)
                        return reject(err)
                    resolve()
                })
        
    })
}

function close(){
    return mongoose.disconnect()
}

module.exports = { connect, close }