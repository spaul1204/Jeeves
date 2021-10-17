require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors');
const db = require('./models/index')


//connecting to the database
db.connect()
    .then(()=> console.log('Database Connected'))
    .catch(err => console.log( 'Database err is ',err ));


const app = express();

const port = 8080 || process.env.port;


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


