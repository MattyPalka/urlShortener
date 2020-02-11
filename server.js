"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var dns = require("dns");
var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

var schema = new mongoose.Schema({
  url: String,
  short: String});
var Url = mongoose.model("Url", schema);



app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var htmlParser = bodyParser.text({ type: 'text/html' })

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});


  

let dnsOptions = {
  hints: dns.ADDRCONFIG
};



//GENERATE RANDOM STING FOR SHORT URL
let generateRandom = () => {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < 5; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

app.get("/api/shorturl/:short", function(req, res) {
  var short = req.params.short;
  Url.findOne({short: short}, function (err,data) {
    if (err) return;
    if (data){
      res.redirect(data.url) 
    } else {
      res.json({error: "No short url found"})
    }
  })
})

app.post("/api/shorturl/new", urlencodedParser, function(req, res, next) {
  let domainName = (req.body.url).split("/")
  dns.lookup(domainName[2], (err, address) => {
    if (err) {
      res.json({ error: "invalid url" });
    } else {
      Url.findOne({url: req.body.url}, function (err, storedUrl) {
        if (err) return;
        if (storedUrl) {
          res.json({url: req.body.url, short: storedUrl.short})
        } else {
          var random = generateRandom() 
          var url = new Url({url: req.body.url, short: random});
          url.save(function(err){
            if (err) return;
            res.json({url: req.body.url, short: random})
          })
        }
      })
    }
  });
});


app.listen(port, function() {
  console.log("Node.js listening ...");
});

//TODO: CREATE A BETTER PAGE?
