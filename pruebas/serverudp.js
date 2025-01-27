const dgram = require('dgram');
const Protocolo = require('../protocolo.js'); // Importar la clase Protocolo

Protocolo.registerType('textMessage', (body) => {
    return body && typeof body.text === 'string' && typeof body.recipient === 'string';
});

// Crear el servidor UDP
const server = dgram.createSocket('udp4');

// Manejar mensajes entrantes
server.on('message', (msg, rinfo) => {
    console.log(`Mensaje recibido de ${rinfo.address}:${rinfo.port} - ${msg.toString()}`);

    try {
        // Deserializar los datos recibidos
        const paquete = Protocolo.deserialize(msg.toString());
        console.log('Paquete deserializado:', paquete);

        // Validar el paquete
        if (paquete.validate()) {
            console.log('El paquete es válido.');
        } else {
            console.log('El paquete no es válido.');
        }
    } catch (err) {
        console.error('Error al procesar el paquete:', err.message);
    }
});

// Manejar errores
server.on('error', (err) => {
    console.error(`Error en el servidor UDP: ${err.message}`);
    server.close();
});

// Iniciar el servidor
const PORT = 5000;
server.bind(PORT, () => {
    console.log(`Servidor UDP escuchando en el puerto ${PORT}`);
});
