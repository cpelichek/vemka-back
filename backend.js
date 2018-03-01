const express = require('express');
const fs = require('fs');
const expressMongoDb = require('express-mongo-db');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;
const events = require('events');

const app = express();

app.use(expressMongoDb('mongodb://localhost/vemka-api'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

//GET
//pega todos os eventos (schedule)
app.get('/schedules', (req, res) =>{
    req.db.collection('schedules')
    .find({})
    .toArray((err, data) =>{
        console.log(data);
        res.send(data);
    })
})

//pega um schedule e exibe
app.get('/scheduleDetail/:id', (req, res) => {
    let search ={
        _id: new ObjectID(req.params.id)
    };

    req.db.collection('schedules')
    .findOne(search, (err, schedule) => {
        res.send(schedule)
    })
})

//pega todos os perfis de usuário (user)
app.get('/users', (req, res) =>{
    req.db.collection('users')
    .find({})
    .toArray((err, data) => {
        console.log(data);
        res.send(data);
    })
})

//(muito importante!)
//pega todos os eventos que o usuário participou
app.get('/userHistory/:id', (req, res) =>{
    let search ={
        _id: new ObjectID(req.params.id)
    };
    
    req.db.collection('users')
    .findOne(search, (err, data) => {
        let scheduleIds = [];
        for(let schedule of data.scheduleBought){
            scheduleIds.push(new ObjectID(schedule._id));
        }
        
        req.db.collection('schedules')
        .find({
            _id: { $in: scheduleIds }
        }).toArray ((err, scheduleArray) => {
            console.log(data);
            res.send(scheduleArray);
        });
    });
});

//POST
//manda informações para cadastrar novo usuário
app.post('/signup', (req, res) => {
    if (!req.body.firstName || !req.body.lastName || !req.body.phoneNumber || !req.body.address || !req.body.cep || !req.body.birthDate || !req.body.email || !req.body.password || !req.body.agreementContract){
        res.status(400).send({'error': 'Opa! Parece que você esqueceu de preencher algo!'});
        return;
    }
    
    let user = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: `${req.body.firstName} ${req.body.lastName}`,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        cep: req.body.cep,
        birthDate: req.body.birthDate,
        email: req.body.email,
        password: req.body.password,
        agreementContract: req.body.agreementContract,
        scheduleBought: [{
            scheduleId: "",
            scheduleBoughtWith: "",
            scheduleBoughtDate: "",
        }]
    }
    
    req.db.collection('users')
    .insert(user, (err, data) => {
        console.log(data);
        res.send(data);
    })
});

//manda informações para logar um usuário existente
app.post('/login', (req, res) => {
    //validar preenchimento de email e senha
    if (!req.body.email || !req.body.password){
        res.status(400).send({'error': 'É necessário um usuário e senha para logar!'});
        return;
    }

    //query selector
    let search = {
        email: req.body.email,
        senha: req.body.senha
    }
    
    //
    req.db.collection('users')
    .findOne(search, (err, data) => {
        if (data) {
            res.send(data);
        } else {
            res.status(400).send({'error': 'Usuário ou senha inválidos!'});
        }
    })
});

//manda informações para cadastrar novo evento
app.post('/newSchedule', (req, res) => {
    console.log(req.body);
    
    //valida que os campos foram todos preenchidos
    if (!req.body.scheduleName || !req.body.tracks || !req.body.dateSchedule || !req.body.duration || !req.body.dateSalesEnd || !req.body.description || !req.body.clue || !req.body.locationName || !req.body.locationAddress || !req.body.box || !req.body.speakers){
        res.status(400).send({'error': 'Todos os campos sobre o evento são obrigatórios!'});

        return;
    }

    //auxiliar para o nome do evento poder ser interpolado e compor o nome da box
    let scheduleNameAux = req.body.scheduleName;

    //auxiliar para transformar a data inserida de uma string para um número equivalente em milisegundos desde a 'Unix epoch' (1 de janeiro de 1970)
    let dateScheduleConversor = Date.parse(req.body.dateSchedule);

    let dateSalesEndConversor = Date.parse(req.body.dateSalesEnd);

    //lista de itens
    let boxItensListAux = req.body.box;

    //lista de artistas
    let speakerListAux = req.body.speakers;
    
    let schedule = {
        scheduleName: scheduleNameAux,
        tracks: req.body.tracks,
        dateSchedule: req.body.dateSchedule,    //formato precisa ser: "Sat, 10 Mar 2018 16:30:00 GMT-3"
        dateScheduleMS: dateScheduleConversor,
        duration: req.body.duration,
        //dateSalesGoOnAir: Date.now(),
        dateSalesEnd: req.body.dateSalesEnd,
        dateSalesEndMS: dateSalesEndConversor,
        dateBoxSent: req.body.dateBoxSent,
        description: req.body.description,
        clue: req.body.clue,
        locationName: req.body.locationName,
        locationAddress: req.body.locationAddress,
        //locationLat: req.body.locationLat,
        //locationLng: req.body.locationLng,
        boxName: `Box ${scheduleNameAux}`,
        boxItens: boxItensListAux,
        speakers: speakerListAux
    }
    
    req.db.collection('schedules')
    .insert(schedule, (err, data) => {
        console.log(data);
        res.send(data);
    })
});

//(muito importante!)
//manda informações para efetuar compra de um evento por um usuário
app.post('/buy', (req, res) => {
    let userQuery ={
        _id: new ObjectID(req.body.userId)
    }

    let scheduleQuery ={
        _id: new ObjectID(req.body.scheduleId)
    }
    
    let scheduleBoughtUpdate ={
        scheduleId: req.body.scheduleId,
        scheduleBoughtWith: req.body.scheduleBoughtWith,
        scheduleBoughtDate: Date.now()
    }
    
    req.db.collection('schedule')
    .findOne(scheduleQuery, (err, schedule) => {
        if(!schedule){
            res.status(404).send({'error': 'Evento não encontrado'});
            return;
        }

        req.db.collection('users')
        .findOne(userQuery, (err, user) => {
            if(!user){
                res.status(404).send({'error': 'Usuario não encontrado'});
                return;
            }

            user.scheduleBought.push(scheduleBoughtUpdate);

            req.db.collection('users').update(userQuery, user, (err) => {
                res.send(user);
            });
        });
    });
});

//LISTENING
app.listen(8080, () => {
    console.log('Servidor rodando na 8080');
});
