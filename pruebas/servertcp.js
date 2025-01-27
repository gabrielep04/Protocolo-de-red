const net = require('net');
const Protocolo = require('../protocolo.js'); // Importar la clase Protocolo

Protocolo.registerType('textMessage', (body) => {
    return body && typeof body.text === 'string' && typeof body.recipient === 'string';
});

// Crear el servidor
const server = net.createServer((socket) => {
    console.log('Cliente conectado.');

    socket.on('data', (data) => {
        try {
            console.log('Datos recibidos del cliente:', data.toString());

            // Deserializar los datos recibidos
            const paquete = Protocolo.deserialize(data.toString());
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

    socket.on('end', () => {
        console.log('Cliente desconectado.');
    });

    socket.on('error', (err) => {
        console.error('Error en el servidor:', err.message);
    });
});

// Escuchar en un puerto específico
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
