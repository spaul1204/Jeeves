require('dotenv').config()

const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan')
const cors = require('cors');
const ExpressError = require('./utils/ExpressError')
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
app.all('*',(req, res, next) =>{
    next(new ExpressError('Page Not Found',404))
})

app.use((error,req,res,next) =>{
    const { statusCode = 500, message = "Something went wrong" } = error
    res.status(statusCode).send(message)
})

app.listen(port, () => {
    console.log("app has started on port", port);
})


