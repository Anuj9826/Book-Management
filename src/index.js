const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route')
const { default: mongoose } = require('mongoose');
const app = express();

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://bidyut10:kabir34268@cluster0.rw6eu.mongodb.net/Group11Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected 👍 😄" ))
.catch ( err => console.log(err) )

app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port number ' + (process.env.PORT || 3000))
});