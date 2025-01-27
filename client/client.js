document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clientForm');
    const operationType = document.getElementById('operationType');
    const dynamicFields = document.getElementById('dynamicFields');

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
        console.log(operation);
        console.log(connectionType);
        
        
        const formData = new FormData(form);
        const body = Object.fromEntries(formData.entries());
        console.log(JSON.stringify(body));

        try {
            
            console.log("hola");
            
            const response = await fetch(`http://localhost:5000/${connectionType}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            console.log("hola soy response:", response);

            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }

            const result = await response.json();
            console.log('Respuesta del servidor:', result);
        } catch (error) {
            console.error('Error al enviar el paquete:', error);
        }
    });
});