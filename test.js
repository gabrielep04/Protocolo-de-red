const Protocolo = require('./protocolo.js'); // Asegúrate de importar la clase correctamente

// Registrar un tipo de paquete
Protocolo.registerType('textMessage', (body) => {
    return body && typeof body.text === 'string' && typeof body.recipient === 'string';
});

// Crear un paquete válido
let protocolo = new Protocolo(); // Declaración de protocolo aquí
protocolo.setHeader('textMessage', 1);
protocolo.setBody({ text: 'Hello', recipient: 'example@example.com' });
protocolo.setFooter({ timestamp: '1234'});
console.log(protocolo.serialize());

const serialized = protocolo.serialize();

const deserialized = Protocolo.deserialize(serialized);
console.log(deserialized);

console.log(deserialized.validate()); // Debería imprimir true


// Crear un paquete inválido
/* try {
    protocolo.setBody({ recipient: 'example@example.com' }); // Falta el campo "text"
} catch (err) {
    console.error(err.message); // Cuerpo del paquete no válido para el tipo: textMessage
} */