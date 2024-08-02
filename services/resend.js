let { Resend } = require('resend');
const resend = new Resend('re_fU5xW1LH_MYKBR8n2ScYxz8iMU8aTtSV6');


async function sendWelcome(text){
    try {
        resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'feliperroman1702@gmail.com',
            subject: 'Hello World',
            html: text
        });
    } catch (error) {
        console.log("🚀 ~ file: resend.js:42 ~ sendWelcome ~ error:", error)
        
    }
}

async function sendFileExoneration(html, buffer, emailTo){
    try {
        if(html && buffer){
            const { data, error } = await resend.emails.send({
                from: 'Espirítu de Montaña <onboarding@resend.dev>',
                to: [emailTo],
                subject: 'Documento Exoneración de Responsabilidad',
                html: html,
                attachments: [
                    {
                        filename: 'exoneracion-de-responsabilidad.docx',
                        content: buffer,
                        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    },
                ],
              });
              if (error) {
                console.log("Ha ocurrido un error al enviar el correo de exoneracion", error)
                return { error: true, err: error, msg: 'Ha ocurrido un error al enviar el correo'}
              } else{
                console.log('Autorización enviada por correo electrónico correctamente');
                return { error: null, msg: 'Correo enviado'}
              }
        }else{
            return { error: true, msg: 'Faltan campos requeridos'}
        }
    } catch (error) {
        console.log("sendFileExoneration error", error)
    }
}

async function sendFileImagePersonal(html, buffer, emailTo){
    try {
        if(html && buffer){
            const { data, error } = await resend.emails.send({
                from: 'Espirítu de Montaña <onboarding@resend.dev>',
                to: [emailTo],
                subject: 'Documento Autorización Uso de Imagen',
                html: html,
                attachments: [
                    {
                        filename: 'autorización-uso-imagen.docx',
                        content: buffer,
                        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    },
                ],
              });
              if (error) {
                console.log("Ha ocurrido un error al enviar el correo de exoneracion", error)
                return { error: true, err: error, msg: 'Ha ocurrido un error al enviar el correo'}
              } else{
                console.log('Autorización enviada por correo electrónico correctamente');
                return { error: null, msg: 'Correo enviado'}
              }
        }else{
            return { error: true, msg: 'Faltan campos requeridos'}
        }
    } catch (error) {
        console.log("sendFileImagePersonal error", error)
    }
}

module.exports = {
    sendFileExoneration,
    sendFileImagePersonal
}