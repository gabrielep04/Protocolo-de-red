document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clientForm');
    const operationType = document.getElementById('operationType');
    const dynamicFields = document.getElementById('dynamicFields');
    const responseDiv = document.getElementById('response');

    const fieldTemplates = {
        email: `
            <label for="recipient">Destinatario:</label>
            <input type="email" id="recipient" name="recipient" required>
            <label for="subject">Asunto:</label>
            <input type="text" id="subject" name="subject" required>
            <label for="text">Mensaje:</label>
            <textarea id="text" name="text" required></textarea>
        `,
        createfile: `
            <label for="name">Nombre del Archivo:</label>
            <input type="text" id="name" name="name" required>
            <label for="path">Ruta:</label>
            <input type="text" id="path" name="path" required>
            <label for="text">Contenido:</label>
            <textarea id="text" name="text" required></textarea>
        `,
        deletefile: `
            <label for="name">Nombre del Archivo:</label>
            <input type="text" id="name" name="name" required>
            <label for="path">Ruta:</label>
            <input type="text" id="path" name="path" required>
        `,
        morse:`
            <label for="text">Texto a convertir:</label>
            <textarea id="text" name="text" required></textarea>
        `
    };

    // Cambiar los campos dinámicos según la operación seleccionada
    operationType.addEventListener('change', () => {
        dynamicFields.innerHTML = fieldTemplates[operationType.value] || '';
    });

    // Manejar el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const connectionType = form.connectionType.value;
        const operation = form.operationType.value;

        //console.log(operation);
        //console.log(connectionType);
        
        const formData = new FormData(form);
        const body = Object.fromEntries(formData.entries());
        const bodyObj = JSON.parse(JSON.stringify(body));
        delete bodyObj.connectionType;
        delete bodyObj.operationType;

        //console.log(bodyObj);
        //console.log(JSON.stringify(body));

        try {
            
            const response = await fetch(`http://localhost:3000/${connectionType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "operation": operation, "body": bodyObj })

            });

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const result = await response.json();
            console.log('Respuesta del servidor:', result);

            // Mostrar la respuesta en el HTML
            let responseHtml = `<pre>Message: ${result.body.message}</pre>`;
            if (result.body.result !== undefined) {
                responseHtml = `<pre>Result: ${result.body.result}\nMessage: ${result.body.message}</pre>`;
            }
            responseDiv.innerHTML = responseHtml;
        } catch (error) {
            console.error('Error al enviar el paquete:', error);
            responseDiv.innerHTML = `<pre>Error: ${error.message}</pre>`;
        }
    });
});