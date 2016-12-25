var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3500;

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
app.post('/upload', function(req, res) {

    /*var exec = require('child_process').exec;
    var cmd = ' ' + ;

    exec(cmd, function(error, stdout, stderr) {});
    */
});

app.listen(PORT, function() {
    console.log('Metadata remover app listening on ', PORT);
});
