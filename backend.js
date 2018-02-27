const express = require('express');
const fs = require('fs');
const expressMongoDb = require('express-mongo-db');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;
const events = require('events');

const app = express();

app.use(expressMongoDb('mongodb://localhost/8080'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

//GET
//pega todos os eventos (schedule)
app.get('/schedules', (req, res) =>{
    req.db.collection('schedule')
    .find({})
    .toArray((err, data) =>{
        res.send(data);
    })
})

//pega todos os perfis de usuário (user)
app.get('/users', (req, res) =>{
    req.deb.collection('user')
    .find({})
    .toArray((err, data) => {
        res.send(data);
    })
})

//pega todos os eventos que o usuário participou (muito importante!)
app.get('/userHistory/:id', (req, res) =>{
    let search ={
        _id: new ObjectID(req.params.id)
    };

    req.db.collection('user')
    .findOne(search, (err, data) => {
        let scheduleIds = [];
        for(let schedule of data.scheduleList){
            scheduleIds.push(new ObjectID(schedule._id));
        }

        req.db.collection('schedule')
        .find({
            _id: { $in: scheduleIds }
        }).toArray ((err, scheduleArray) => {
        res.send(scheduleArray);
    })
})

//POST


app.listen(8080, () => {
    console.log('Servidor rodando na 8080');
});
