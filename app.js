var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bParser = require('body-parser');
var app = express();
var path = require('path');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bParser.urlencoded({
    extended: true
}));

app.use(express.static('static'))

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'static', '/login.html'));
});

app.post('/', function(req, res) {
    MongoClient.connect('mongodb://localhost:27017/users', function(err, db) {
        if (err) throw err
        var userName = req.body.username;
        var passWord = req.body.password;
        var html = '<h3>' + 'The username and password you entered does not match.' + '</h3>' + '<br>' + '<a href="/">Click here to try again</a>';
        var dbCollection = db.collection('users');
        dbCollection.findOne({
            "username": userName
        }, function(err, users) {
            if (users != null) {
                if (passWord === users.password) {
                    res.sendFile(path.join(__dirname, 'static', 'default.html'));
                } else {
                    res.send(html);
                }
            } else {
                res.send(html);
            }
            db.close();
        });
    });
});

app.get('/default', function(req, res) {
    MongoClient.connect('mongodb://localhost:27017/text', function(err, db) {
        if (err) throw err
        var dbCollection = db.collection('text');
        dbCollection.find().toArray(function(err, documents) {
            if (err) throw err
            console.log(documents.length + ' Tasks loaded');
            res.send(documents);
            db.close();
        });
    });
});

app.post('/user', function(req, res) {
    MongoClient.connect('mongodb://localhost:27017/users', function(err, db) {
        if (err) throw err
        var fname = req.body.fname;
        var lname = req.body.lname;
        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var dbCollection = db.collection('users');
        dbCollection.insert({
            "first": fname,
            "last": lname,
            "email": email,
            "username": username,
            "password": password
        }, function(err, documents) {
            if (err) throw err
            console.log(documents);
            res.sendFile(path.join(__dirname, 'static', 'login.html'));
            db.close();

        });
    });
});

app.post('/task', function(req, res) {
    var text = req.body.text;
    MongoClient.connect('mongodb://localhost:27017/text', function(err, db) {
        if (err) throw err
        var dbCollection = db.collection('text');
        dbCollection.insert({
            "text": text
        }, function(err, documents) {
            if (err) throw err
            console.log(documents);
            res.sendFile(path.join(__dirname, 'static', 'task.html'));
            db.close();
        });
    });
});

app.listen(3001, function() {
    console.log('Listening on port 3001');
});