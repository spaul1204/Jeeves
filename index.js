require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors');
// const swaggerUI = require('swagger-ui-express')
// const swaggerJsDoc = require('swagger-jsdoc')
const mongoose = require('mongoose')

const url = 'mongodb+srv://SnehaR:' + process.env.MONGO_PWD + '@cluster0.z26g7.mongodb.net/Blog?retryWrites=true&w=majority'

//Connecting to mongodb
mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log( 'Database Connected' ))
.catch(err => console.log( 'Database err is ',err ));

//Configuring options for swagger documentation
// const options = {
//     definition : {
//         openapi : '3.0.0',
//         info : {
//             title : 'BlogPost Api',
//             version : '1.0.0',
//             description : 'Jeeves Assignments'
//         },
//         servers : [{
//             url : 'http://localhost:8080'
//         }]
//     },
//     apis : ['./routes/*.js']
// }

// const specs = swaggerJsDoc(options)
const app = express();

const port = 8080 || process.env.port;

// app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(specs))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use('/uploads',express.static('uploads'))
app.use(morgan('dev'));

const users = require('./routes/users')
const topic = require('./routes/topic')

app.use('/users',users)
app.use('/topic',topic)

//Error handling
app.use((req,res,next)=>{
    const error = new Error('Resource not found')
    error.status = 404
    next(error)
})

app.use((error,req,res,next) =>{
    res.status(error.status || 500)
    res.json({
        error : {
            message : error.message
        }
    })
})

app.listen(port, () => {
    console.log("app has started on port", port);
})


