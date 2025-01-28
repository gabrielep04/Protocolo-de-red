const net = require('net');
const Protocolo = require('../protocolo.js'); // Importar la clase Protocolo

Protocolo.registerType('textMessage', (body) => {
    return body && typeof body.text === 'string' && typeof body.recipient === 'string';
});

// Crear un paquete válido
const protocolo = new Protocolo();
protocolo.setHeader('textMessage', 1);
protocolo.setBody({ text: 'Hola desde el cliente', recipient: 'servidor@example.com' });

// Serializar el paquete
const serializedPacket = protocolo.serialize();
console.log('Enviando paquete:', serializedPacket);

// Crear el cliente
const client = net.createConnection({ port: 7000 }, () => {
    console.log('Conectado al servidor.');
    client.write(serializedPacket); // Enviar el paquete al servidor
});

// Manejar eventos del cliente
client.on('data', (data) => {
    console.log('Respuesta del servidor:', data.toString());
});

client.on('end', () => {
    console.log('Desconectado del servidor.');
});

client.on('error', (err) => {
    console.error('Error en el cliente:', err.message);
});
