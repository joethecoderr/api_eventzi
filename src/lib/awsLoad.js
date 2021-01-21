const multer = require('multer')
const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path')

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
    cb(null, path.basename(file.originalname, path.extname(file.originalname)) + file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})



class AWS_LOAD {
    constructor() {}
    upload = multer ({ storage: storage })

    direct = (entity) =>{
        let direct
        if(entity  === 'userAvatar'){
            direct = 'users_profile_photos'
        }
        else if(entity === 'partnerLogo'){
            direct = 'partners_logos'
        }
        else if(entity === 'eventLogo' || entity == 'eventBanner'){
            direct = 'events'
        }
        else if(entity === 'orgLogo'){
            direct = 'organizations'
        }
        else if(entity === 'speakerPhoto'){
            direct = 'speakers'
        }
        return direct

    }

    uploadPhoto = (fileName, entity) => {
        let fileReference = ''
        let direct
        direct = this.direct(entity)


        if( fileName !== null && fileName !== undefined){
            fileName = 'uploads/' + fileName
            fileName = fileName.split('\\').join("/").toLowerCase()
            fs.readFile(fileName, fileReference, (err, data) => {
                try{
                    fileName = path.basename(fileName)
                    if (err) throw err;
                    const params = {
                        Bucket: process.env.BUCKET_NAME, 
                        Key: `${direct}/${fileName}`, 
                        Body: data};
                    s3.upload(params, fileReference, function(s3Err, data) {
                        if (s3Err) throw s3Err
                        fileReference = data.Location
                    });
                    fs.unlinkSync('uploads/' + fileName)
                } catch(err){
                    console.log(err)
                }
            });
            fileReference = `${direct}/${path.basename(fileName)}`
        }
        else {
            fileReference = null
        }
        return fileReference
    };

    getPhoto = async(fileName, entity) => {
        let direct;

        direct = this.direct(entity)
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${fileName}`,
        };
          s3.getObject(params, function(err, data) {
            var image = data["Body"];
            if (err) console.error('Error', err, err.stack );
            else     console.log('Llegue aqui', image);

          })
    }

}

module.exports = AWS_LOAD


