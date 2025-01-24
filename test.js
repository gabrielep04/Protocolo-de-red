const Protocolo = require('./protocolo.js'); // Asegúrate de importar la clase correctamente

// Registrar un tipo de paquete
Protocolo.registerType('textMessage', (body) => {
    return body && typeof body.text === 'string' && typeof body.recipient === 'string';
});

// Crear un paquete válido
let protocolo = new Protocolo(); // Declaración de protocolo aquí
protocolo.setHeader('textMessage', 1);
/* protocolo.setBody({ text: 'Hello', recipient: 'example@example.com' });
console.log(protocolo.validate()); // true */

// Crear un paquete inválido
try {
    protocolo.setBody({ recipient: 'example@example.com' }); // Falta el campo "text"
} catch (err) {
    console.error(err.message); // Cuerpo del paquete no válido para el tipo: textMessage
}