
const multer = require('multer')

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

upload = multer({ storage : storage, fileFilter : fileFilter })

module.exports = { upload }




