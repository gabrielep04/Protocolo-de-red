const dgram = require('dgram');
const Protocolo = require('../protocolo.js'); // Importar la clase Protocolo

Protocolo.registerType('textMessage', (body) => {
    return body && typeof body.text === 'string' && typeof body.recipient === 'string';
});

// Crear el cliente UDP
const client = dgram.createSocket('udp4');

// Crear un paquete válido
const protocolo = new Protocolo();
protocolo.setHeader('textMessage', 1);
protocolo.setBody({ text: 'Hola desde el cliente UDP', recipient: 'servidor@example.com' });
protocolo.setFooter({ timestamp: Date.now().toString() });

// Serializar el paquete
const serializedPacket = protocolo.serialize();
console.log('Enviando paquete:', serializedPacket);

// Enviar el paquete al servidor
const SERVER_PORT = 5000;
const SERVER_HOST = '127.0.0.1';
client.send(serializedPacket, SERVER_PORT, SERVER_HOST, (err) => {
    if (err) {
        console.error('Error al enviar el paquete:', err.message);
        client.close();
    } else {
        console.log('Paquete enviado al servidor UDP.');
        client.close(); // Cerramos el cliente después de enviar el paquete
    }
});
