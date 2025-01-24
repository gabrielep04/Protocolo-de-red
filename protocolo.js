class Protocolo {
    //Creo un mapa estatico para registrar los tipos de paquetes y sus validadores
    static typeValidators = {};

    //Construyo la estructura del paquete a enviar
    constructor(){
        this.header = {
            type: null,
            version: 1,
            payloadSize: 0,
            sequenceNumber: null,
        };

        this.body = null;

        this.footer = {
        };
    }

    //Metodo estatico para registrar los tipos de paquetes y sus validadores
    static registerType(type, validator){
        Protocolo.typeValidators[type] = validator;
    }

    //Setter para el header
    setHeader(type, sequenceNumber){
        if (!Protocolo.typeValidators[type]){
            throw new Error(`Tipo no registrado: ${type}`);
        }
        this.header.type = type;
        this.header.sequenceNumber = sequenceNumber;
    }

    //Setter para el body
    setBody(body) {
        if (this.header.type && Protocolo.typeValidators[this.header.type](body)) {
            this.body = body;
            this.header.payloadSize = body.length;
        } else {
            throw new Error(`Cuerpo del paquete no válido para el tipo: ${this.header.type}`);
        }
    }

    //Setter para el footer
    setFooter(checksum){
        this.footer.checksum = checksum;
    }

    //Validar el paquete
    validate(){
        if(this.header.type == null || this.header.sequenceNumber == null || this.body == null){
            console.log("Falta un campo");
            return false;
        }
        
        const validator = Protocolo.typeValidators[this.header.type];
        if (!validator || !validator(this.body)) {
            console.log("No hay validador o el cuerpo no pasa la validación");
            return false; // Si no hay validador o el cuerpo no pasa la validación, retorna false
        }

        return true;
    }


    //Serializamos el paquete
    serialize(){
        header = JSON.stringify(this.header);
        body = JSON.stringify(this.body);
        footer = JSON.stringify(this.footer);

        return `${header}${body}${footer}`;
    }

    //Deserializamos el paquete
    static deserialize(data) {
        const parsed = JSON.parse(data);
        const protocolo = new Protocolo();
        protocolo.header = parsed.header;
        protocolo.body = parsed.body;
        protocolo.footer = parsed.footer;
        return protocolo;
    }
}

module.exports = Protocolo;