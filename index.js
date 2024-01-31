const express= require('express');
const app = express();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/myUrlShortener");
const {UrlModel} = require('./models/urlshort')
const port = 3000;
//Middleware
//to search for an image/static file only in public folder 
app.use(express.static('public'));

//ejs searches for home in view folder and gives that file
app.set('view engine', "ejs");
app.use(bodyParser.urlencoded({ extended : true}))


//Declare a variable called title using set and show its value in root page
// app.set('title','vasanth');

// app.get('/',(req, res)=>{
// res.send(app.get('title'));
// })

// app.get('/',(req, res)=>{
// res.send("<h1>Hello world</h1>")
// })



app.get('/', async function (req, res) {
    try {
        let allUrl = await UrlModel.find();
        res.render('home', {
            urlResult: allUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/create', (req, res)=>{
    // console.log(req.body.longurl) //the url we give is got here
    //create a short url
    //store it in db
    console.log(generateUrl());
    let urlShort = new UrlModel({
        longUrl : req.body.longurl,
        shortUrl : generateUrl()
    })
   urlShort.save()
   .then(data => {
       console.log(data);
       res.redirect('/');
   })
   .catch(err => {
       console.error(err);
       res.status(500).send('Internal Server Error');
   });
})

// app.get('/about', (req, res)=>{
//     res.send("<h1>Hello from about page</h1>") 
// })

app.get('/:urlId', function (req, res) {
    UrlModel.findOne({ shortUrl: req.params.urlId })
        .then(data => {
            // Handle the result here
            if (!data) {
                return res.status(404).send('Not Found');
            }

            UrlModel.findByIdAndUpdate({ _id: data.id }, { $inc: { clickCount: 1 } })
                .then(updatedData => {
                    res.redirect(data.longUrl);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

app.get('/delete/:id', function(req, res) {
    UrlModel.findByIdAndDelete(req.params.id)
        .then(deleteData => {
            res.redirect('/');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});


app.listen(port, ()=>{
    console.log(`Port is running in ${port}`)
})

function generateUrl(){
    var rndResult = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;

    for (var i=0; i<5; i++){
        rndResult += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    console.log(rndResult);
    return rndResult;
}