# NotasRegistro Backend

Este servidor backend maneja el envío de correos electrónicos con archivos PDF adjuntos para la aplicación NotasRegistro.

## Propósito

Este backend resuelve el problema de dependencias de Node.js que no están disponibles en el entorno de ejecución de React Native/Expo, específicamente para el envío de correos electrónicos con SendGrid.

## Instalación

1. Instala las dependencias:
   ```
   npm install
   ```

2. Ejecuta el servidor:
   ```
   npm start
   ```

## API Endpoints

### Enviar Email con PDF

**URL:** `/api/email/send`  
**Método:** `POST`  
**Cuerpo de la solicitud:**

```json
{
  "to": "correo@ejemplo.com",
  "subject": "Evaluación",
  "text": "Mensaje de texto (opcional)",
  "html": "<p>Mensaje HTML (opcional)</p>",
  "pdfContent": "Base64EncodedPDFContent",
  "pdfName": "nombre-archivo.pdf"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

## Configuración en la App móvil

En tu aplicación móvil, en lugar de usar directamente SendGrid, debes hacer una solicitud a este servidor.
