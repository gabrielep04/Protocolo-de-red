const express = require('express');
const net = require('net');
const dgram = require('dgram');
const Protocolo = require('../protocolo.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/tcp', (req, res) => {

    const { operation, body } = req.body;
    console.log("hola soy el body", req.body);
    console.log(operation);
    console.log(body);

    Protocolo.registerType('email', (body) => {
        return body && typeof body.text === 'string' && typeof body.recipient === 'string' && typeof body.subject === 'string';
    });
    
    Protocolo.registerType('createfile', (body) => {
        return body && typeof body.text === 'string' && typeof body.name === 'string' && typeof body.path === 'string';
    });
    
    Protocolo.registerType('deletefile', (body) => {
        return body && typeof body.name === 'string' && typeof body.path === 'string';
    });
    
    Protocolo.registerType('morse', (body) => {
        return body && typeof body.text === 'string';
    });

    console.log("db1");

    const client = new net.Socket();
    const protocolo = new Protocolo();
    protocolo.setHeader(operation, 1);
    protocolo.setBody(body);

    console.log("db2");

    client.connect(5000, 'localhost', () => {
        client.write(protocolo.serialize());
    });

    client.on('data', (data) => {
        res.json(JSON.parse(data.toString()));
        client.destroy();
    });

    client.on('error', (err) => {
        res.status(500).send(err.message);
    });
});

app.post('/udp', (req, res) => {
    const { operation, body } = req.body;
    const protocolo = new Protocolo();
    protocolo.setHeader(operation, 1);
    protocolo.setBody(body);

    const client = dgram.createSocket('udp4');
    const message = Buffer.from(protocolo.serialize());

    client.send(message, 4000, 'localhost', (err) => {
        if (err) res.status(500).send(err.message);
    });

    client.on('message', (msg) => {
        res.json(JSON.parse(msg.toString()));
        client.close();
    });
});

app.listen(3000, () => console.log('Cliente escuchando en puerto 3000'));
