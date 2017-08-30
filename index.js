require('babel-polyfill');
require('dotenv').config({
  silent: true
});
var express = require('express');
var mongoose = require('mongoose');
var Promise = require('es6-promise').Promise;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://huong:123456@ds161913.mlab.com:61913/littleurl');

var urlSchema = new mongoose.Schema({
	original_url: String,
	short_url: {
		type: Number,
		unique: true,
		required: true
	}
})


var getUniqueShortUrl = async function (number){
  var data = await Url.findOne({short_url: number}, (err, data) => {
  	if(err) throw err;
  }).exec();
  if(!data) {
     console.log(number);
     return number;
  }
  if(data) {
    return getUniqueShortUrl(number+1);
  }
  
}


var Url = mongoose.model('Url', urlSchema);


var app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req,res){
  res.render('index', {
    title: 'Little Url'
  });
})



app.get('/new/:protocol//:url', function(req,res){
 var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
 var url = req.params.protocol+'//'+req.params.url;
 if(regex.test(url))
 {
  console.log("this is a url");
  Url.findOne({original_url: url}, async function(err, myUrl){
  if(err) throw err;
  
  if(myUrl) {
    res.json({
      original_url: myUrl.original_url,
      short_url: myUrl.short_url
    })
  }
  if(!myUrl) {
    var num = await getUniqueShortUrl(1000);
        
        console.log(num);
    var newUrl = new Url({
      original_url: url,
      short_url: num
    });
    
        newUrl.save(function(err){
          if(err) throw err;
          console.log(newUrl);
          res.json({
           original_url: newUrl.original_url,
           short_url: newUrl.short_url
       })
        })  

  }
 })
 } else {
   res.render('index', {
    title: 'little Url',
    message: 'Error: You need to add a proper url'
  })
 }
  

})


app.get('/new', function(req,res){
  res.render('index', {
    title: 'little Url',
    message: 'Error: You need to add a proper url'
  })
})



app.get('/:number', function(req,res){
  console.log(req.params.number);
  var number = req.params.number;

  // Url.findOne({short_url: Number(number)}, (err, url) => {
  //   if(err) throw err;
  //   if (url) {
  //     res.redirect(url.original_url);
  //   } 
  //   if(!url) {
  //     res.json({
  //       error: 'Not Found Url'
  //     })
  //   }
  // })
})


app.listen(process.env.PORT || 3000, () => console.log("Server is running"));
