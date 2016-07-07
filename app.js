var express = require("express");
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var request = require("request");
app.use(bodyParser.urlencoded({extended: true}));
mongoose.connect("");

// scheme setup
var searchScehma = new mongoose.Schema({
    term : String,
    when : { type: Date, default: Date.now }
});

var Search = mongoose.model('search', searchScehma);

app.get('/', function(req, res){
    res.render('home.ejs')
})

app.post('/search', function(req, res){
    res.redirect('/search/' + req.body.term + '?offset=0');
});

app.get('/search/:term', function(req, res){
    Search.create({term : req.params.term }, function(err, saved){
                if(err){
                    console.log(err)
                }
                else {
                    console.log(saved);
                }
            })
    request({
        url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + req.params.term + "&&count=150",
        headers: { //We can define headers too
        "Ocp-Apim-Subscription-Key" : "1d0032b3fb834bb4a8719e641147baff"
    }},
        function(error, response, body){
        if (error){
            console.log(error)
        }
        else {
            var parsed = JSON.parse(body)
            var output = [];
            parsed.value.forEach(function(result){
                output.push({
                    url : result.contentUrl,
                    description : result.name,
                    thumbnail : result.thumbnailUrl,
                    context : result.hostPageDisplayUrl
                    
                })
            })
            var display;
            var offset = Number(req.query.offset);
            if (offset >= 150){
                display = [];
            }
            else{
                display = output.slice(offset, offset + 10)
            }
    
            res.send(display);
        }
    })
    
    
   
    
})

app.get('/previous', function(req,res){
    Search.find({}, function(error, terms){
        if (error){
            console.log(error)
        }
        else{
            var recent = [];
            terms.reverse().forEach(function(each){
                recent.push({term : each.term,
                            when:each.when
                })
            })
            res.send(recent.slice(0,10));
            }
    })
})

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('server up');
});