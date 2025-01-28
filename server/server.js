const net = require('net');
const dgram = require('dgram');
const Protocolo = require('../protocolo.js');

const TCP_PORT = 5000;
const UDP_PORT = 4000;

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

//Servidor TCP
const serverTCP = net.createServer((socket) => {
    console.log('Cliente conectado.');

    socket.on('data', (data) => {
        console.log('\nDatos recibidos del cliente:', data.toString());
        try {

            // Deserializar los datos recibidos
            const request = Protocolo.deserialize(data.toString());
            //console.log('Paquete deserializado:', request);

            // Validar el paquete
            if (request.validate()) {
                console.log('El paquete es válido.');
            } else {
                console.log('El paquete no es válido.');
            }

            handleRequest(request, (response) => {
            // Crear una instancia de Protocolo para la respuesta
            const responsePacket = new Protocolo();
            responsePacket.setHeader('response', Date.now()); // Ajusta el tipo y el número de secuencia según sea necesario
            responsePacket.setBody(response);

            // Enviar la respuesta al cliente
            socket.write(responsePacket.serialize());
            });
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

//Servidor UDP
const serverUDP = dgram.createSocket('udp4');

serverUDP.on('message', (msg, rinfo) => {
    console.log(`Mensaje recibido de ${rinfo.address}:${rinfo.port} - ${msg.toString()}`);
    try {
        // Deserializar datos usando tu protocolo
        const request = Protocolo.deserialize(msg.toString());
        console.log('Paquete recibido por UDP:', request);

        handleRequest(request, (response) => {
            // Enviar la respuesta al cliente
            const responseData = Buffer.from(Protocolo.serialize(response));
            serverUDP.send(responseData, rinfo.port, rinfo.address, (err) => {
                if (err) console.error('Error enviando respuesta UDP:', err);
            });
        });
    } catch (error) {
        console.error('Error procesando datos UDP:', error.message);
    }
});

// Manejar errores del servidor UDP
serverUDP.on('error', (err) => {
    console.error('Servidor UDP encontró un error:', err);
    serverUDP.close();
});


// Iniciar los servidores
serverTCP.listen(TCP_PORT, () => {
    console.log(`Servidor TCP escuchando en el puerto ${TCP_PORT}`);
});

serverUDP.bind(UDP_PORT, () => {
    console.log(`Servidor UDP escuchando en el puerto ${UDP_PORT}`);
});

// Función para manejar solicitudes
function handleRequest(request, callback) {
    const { header, body } = request;

    // Procesar según el tipo de paquete
    switch (header.type) {
        case 'email':
            const { text, recipient, subject } = body;

            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'gabriele.30605303@uru.edu',
                    pass: 'Rotunno04.',
                },
            });

            const mailOptions = {
                from: 'gabriele.30605303@uru.edu',
                to: recipient,
                subject: subject,
                text: text,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error enviando correo:', error);
                    callback({ status: 'error', message: 'No se pudo enviar el correo' });
                } else {
                    console.log('Correo enviado:', info.response);
                    callback({ status: 'success', message: 'Correo enviado con éxito' });
                }
            });
            break;
        case 'createFile':
            const { text: fileContent, name: fileName, path: filePath } = body;
        
            const fs = require('fs');
            const fullPath = `${filePath}/${fileName}`;
        
            fs.writeFile(fullPath, fileContent, (err) => {
                if (err) {
                    console.error('Error creando archivo:', err);
                    callback({ status: 'error', message: 'No se pudo crear el archivo' });
                } else {
                    console.log('Archivo creado en:', fullPath);
                    callback({ status: 'success', message: `Archivo creado en ${fullPath}` });
                }
            });
            break;            
        case 'deleteFile':
            const { name: deleteFileName, path: deleteFilePath } = body;
        
            const deleteFullPath = `${deleteFilePath}/${deleteFileName}`;
        
            fs.unlink(deleteFullPath, (err) => {
                if (err) {
                    console.error('Error eliminando archivo:', err);
                    callback({ status: 'error', message: 'No se pudo eliminar el archivo' });
                } else {
                    console.log('Archivo eliminado:', deleteFullPath);
                    callback({ status: 'success', message: `Archivo eliminado: ${deleteFullPath}` });
                }
            });
            break;       
        case 'decodeMorse':
            const { text: morseText } = body;
        
            const morseCodeMap = {
                '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G',
                '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N',
                '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U',
                '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', '/': ' ',
                '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5',
                '-....': '6', '--...': '7', '---..': '8', '----.': '9',
            };
        
            const decodeMorse = (morse) => {
                return morse
                    .split(' ')
                    .map((code) => morseCodeMap[code] || '')
                    .join('');
            };
        
            const decodedMessage = decodeMorse(morseText);
            callback({ status: 'success', message: 'Morse descifrado', result: decodedMessage });
            break;
        default:
            callback({ status: 'error', message: 'Tipo no reconocido' });
    }
}

module.exports = handleRequest;