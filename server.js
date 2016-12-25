var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3500;
var uploadPath = path.join(__dirname, 'uploads');
var multer = require('multer');
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

//home
app.get('/', function(req, res) {
    var file = path.join(__dirname, 'index.html');
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
            res.download(file.path);
        });
    }
    else {
        res.json({
            error: 'File not readable'
        });
    }
});

app.listen(PORT, function() {
    //Make sure exiftool is installed:
    var exec = require('child_process').exec;
    var cmd = 'exiftool -ver';
    exec(cmd, function(error, stdout, stderr) {
        if (error) throw error;
        console.log('Exiftool version: ' + stdout);
        console.log('Metadata remover app listening on ', PORT);
    });
});
