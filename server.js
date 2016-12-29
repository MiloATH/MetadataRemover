var path = require('path');
var fs = require('fs');
var apt = require('node-apt-get');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3500;
var uploadPath = path.join(__dirname, 'uploads');
var multer = require('multer');
//Used to save uploaded files to uploads folder with unique name
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
})

var upload = multer({
    storage: storage
});

//Static files
app.use('/static', express.static(path.join(__dirname, 'public')))

//Home
app.get('/', function(req, res) {
    var file = path.join(__dirname, 'public/index.html');
    res.sendFile(file, function(err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
    });
});

//POST image for metadata removal
app.post('/upload', upload.single('file'), function(req, res) {
    var file = req.file;
    if (file) {
        console.log(file.path);
        var exec = require('child_process').exec;
        var cmd = 'exiftool -all= ' + file.path;
        exec(cmd, function(error, stdout, stderr) {
            if (error) throw error;
            console.log(stdout);
            //Send new file back. Original file saved as file.path+'_original'
            res.download(file.path);
            //Delete files
            fs.unlink(file.path, function(err) {
                if (err) throw err;
            });
            fs.unlink(file.path + '_original', function(err) {
                if (err) throw err;
            });
            res.end();
        });
    }
    else {
        res.json({
            error: 'File not readable'
        });
        res.end()
    }
});

app.listen(PORT, function() {
    //Make sure exiftool is installed:
    var exec = require('child_process').exec;
    var cmd = 'exiftool -ver';
    exec(cmd, function(error, stdout, stderr) { //Check exiftool is installed
        if (error) {
            if (error.toString().indexOf('not found') !== -1) {
                installExiftool();
            }
            else {
                throw error;
            }
        }
        else {
            var version = stdout.toString().substring(0, stdout.length - 1);
            console.log('Exiftool version: ' + version);
        }
        console.log('Metadata remover app listening on ', PORT);
    });
});

//Install exiftool with apt-get
function installExiftool() {
    console.log('Installing Exiftool');
    apt.update().on('close', function() {
        apt.install('libimage-exiftool-perl', {
            'assume-yes': true
        }).on('close', function(code) {
            if (code !== 0) return console.error('Exiftool not installed');
            console.log('Exiftool installed');
        });
    });
}
