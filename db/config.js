// const mongoose=require('mongoose');
// mongoose.connect('mongodb://localhost:27017/Genux');
const mongoose = require('mongoose')

const url = `mongodb+srv://Mukesh:Mukesh@cluster0.4omti3c.mongodb.net/Geexu`;

const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })