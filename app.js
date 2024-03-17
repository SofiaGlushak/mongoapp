const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
   
const app = express();
const jsonParser = express.json();
 
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
 
let dbClient;
 
app.use(express.static(__dirname + "/public"));
 
mongoClient.connect(function(err, client){
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("playlist").collection("songs");
    app.listen(3000, function(){
        console.log("Server listening port 3000...");
    });
});
 
app.get("/api/songs", function(req, res){
    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, songs){
         
        if(err) return console.log(err);
        res.send(songs)
    });
     
});
app.get("/api/songs/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, song){
               
        if(err) return console.log(err);
        res.send(song);
    });
});
   
app.post("/api/songs", jsonParser, function (req, res) {
       
    if(!req.body) return res.sendStatus(400);
       
    const songName = req.body.name;
    const songArtist = req.body.artist;
    const songAlbum = req.body.album;
    const songListening = req.body.listening;
    const song = {name: songName, artist: songArtist, album: songAlbum, listening: songListening};
       
    const collection = req.app.locals.collection;
    collection.insertOne(song, function(err, result){
               
        if(err) return console.log(err);
        res.send(song);
    });
});
    
app.delete("/api/songs/:id", function(req, res){
        
    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
               
        if(err) return console.log(err);    
        let song = result.value;
        res.send(song);
    });
});
   
app.put("/api/songs", jsonParser, function(req, res){
        
    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const songName = req.body.name;
    const songArtist = req.body.artist;
    const songAlbum = req.body.album;
    const songListening = req.body.listening;
       
    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {artist: songArtist, name: songName, album: songAlbum, listening: songListening}},
         {returnDocument: 'after' },function(err, result){
               
        if(err) return console.log(err);     
        const song = result.value;
        res.send(song);
    });
});
 
// прослушиваем прерывание работы программы (ctrl-c)
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
