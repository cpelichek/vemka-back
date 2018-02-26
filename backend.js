const express = require('express');
const fs = require('fs');
const expressMongoDb = require('express-mongo-db');
const bodyParser = require('body-parser');
const cors = require('cors')
const ObjectID = require('mongodb').ObjectID;
const events = require('events');


const app = express();

app.use(expressMongoDb('mongodb://localhost/8080'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// app.get('/', (req, res) => {
//     req.db.collection('user').find({})
//         .toArray((err, data) => {
//             res.send(data);
//         });
// });

// app.get('/cliente/:id', (req, res) => {
//     let busca = {
//         _id: new ObjectID(req.params.id)
//     };

//     req.db.collection('objetos')
//         .findOne(busca, (err, data) => {
//             res.send(data);
//         });
// });

/*
//pega o feed de eventos
//TODO receber localizacao como parametro
app.get('/getSchedule', (req, res) => {
    //CHANGE THIS TO USE PROMISES
    req.db.collection('schedule')
        .find({})
        .toArray((err, data) => {
            req.db.collection('user')
                .find({})
                .toArray((err, data) => {
                    let flag = true;
                    for (schedule of data) {
                        flag = true;
                        for (user of data) {
                            if (flag == true && schedule.id == user.scheduleList[]) {
                                //this should only happen once
                                schedule. = user;
                                flag = false;
                            }
                        }
                    }

                    // Send treated item list
                    res.send(ConferenceData);
                });
        });
});
*/

//pega todos os eventos de um determinado cliente
app.get('/getMySchedule/:id', (req, res) => {
    let busca = {
        user: req.params.id
    };

    req.db.collection('schedule')
        .find(busca)
        .toArray((err, data) => {
            res.send(data);
        });
});

app.post('/schedule', (req, res) => {
    console.log(req.body);

    let schedule = {
        groups: [{
            date: req.body.date,
            time: req.body.time,
            sessions: [
                {
                    name: req.body.name,
                    timend: req.body.timeEnd,
                    location: req.body.location,
                    description: req.body.description,
                    clue: req.body.clue,
                    box: req.body.box,
                    tracks: req.body.tracks,
                    id: req.body.id
                }
            ]
        }]
    };

    if (!req.body.date || !req.body.time || !req.body.name || !req.body.timeEnd ||
        !req.body.location || !req.body.description || !req.body.clue || !req.body.box ||
        !req.body.tracks || !req.body.id) {
        res.status(400).send({ 'error': 'Opa! Parece que você esqueceu de preencher alguma coisa!' });
        return;
    }

    req.db.collection('schedule')
        .insert(item, (err, data) => {
            if (err) {
                res.status(500).send({});
            }

            res.send(data);
        });
});

app.post('/login', (req, res) => {
    if (!req.body.username || !req.body.senha) {
        res.status(400).send({ 'error': 'Opa! Parece que você esqueceu de preencher alguma coisa!' });
        return;
    }

    let busca = {
        username: req.body.username,
        senha: req.body.senha   //TODO 
    }

    req.db.collection('user')
        .findOne(busca, (err, data) => {
            if (data) {
                res.send(data);
            } else {
                // TODO: use status, but this didnt work
                // res.status(400).send({});
                res.send({});
            }
        });
});

app.post('/cadastro', (req, res) => {
    if (!req.body.telefone || !req.body.firstName || !req.body.lastName || !req.body.adress || !req.body.birthDate || !req.body.email || !req.body.password) {
        res.status(400).send({ 'error': 'Opa! Parece que você esqueceu de preencher alguma coisa!' });
        return;
    }

    if (!agreementContract){
        res.status(400).send({'error': 'Epa! Aceite nossos termos de uso para participar de nossos eventos!'});
    }
    let user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: firstName+' '+lastName,
        telefone: req.body.telefone,
        adress: req.body.adress,
        cep: req.body.cep,
        birthDate: req.body.birthDate,
        email: req.body.email,
        password: req.body.password,
        agreementContract: false,
        // local: {
        //     lat: req.body.local.lat,
        //     lng: req.body.local.lng
        // },
        // reputacao: -1
    };

    req.db.collection('user')
        .insert(user, (err, data) => {
            if (!err) {
                res.send(data);
            } else {
                res.send(err);
            }

        });
});

app.listen(8080, () => {
    console.log('Servidor rodando na 8080');
});
