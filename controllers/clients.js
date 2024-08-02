// =============================================================================
// PACKAGES
// =============================================================================
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Heading1, Heading2 } = require('docx');
// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
const axios = require("axios")
const resend = require('../services/resend.js')
// =============================================================================
// REST FUNCTIONS
// =============================================================================
async function createClient(req, res) {
    try {
        const body = req.body
        const email_client = body.email
        const document = body.document
        if (email_client) {
            const client_result = await models.findOne('clients', { $or: [{ "document": document }, { "email": email_client }] })
            if (client_result.error) {
                res.json({
                    error: true,
                    data: null,
                    message: 'Ha ocurrido al consultar el cliente'
                })
            } else if (!client_result.error && client_result.data) {
                res.json({
                    error: true,
                    data: client_result.data,
                    message: 'El cliente ya está registrado'
                })
            } else {
                let data = {
                    document: body.document ? body.document : null,
                    type_document: body.type_document ? body.type_document : null,
                    first_name: body.first_name ? body.first_name : null,
                    last_name: body.last_name ? body.last_name : null,
                    phone_number: body.phone_number ? body.phone_number : null,
                    email: body.email ? body.email : null,
                    rh: body.rh ? body.rh : null,
                    eps: body.eps ? body.eps.name : null,
                    vegan: body.vegan ? body.vegan : null,
                    vegan_observations: body.vegan_observations ? body.vegan_observations : null,
                    health_observations: body.health_observations ? body.health_observations : null,
                    status: 'active',
                }
                const create_result = await models.newDocument('clients', data);
                if (create_result.error) {
                    res.json({
                        error: true,
                        err: create_result.error,
                        data: null,
                        message: 'Ha ocurrido un error al crear el cliente'
                    })
                } else {
                    res.json({
                        error: null,
                        data: create_result.data,
                        message: 'El cliente se ha creado correctamente'
                    });
                    // let new_cliente = create_result.data
                    // sendEmailBooking(new_cliente.first_name, 'feliperroman1702@gmail.com')
                }
            }
        }
    } catch (error) {
        console.log("createClient ~ error:", error)
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función createClient'
        })

    }
}

async function getAllClients(req, res) {
    try {
        const admin = req.user.id
        if (admin) {
            let result_admin = await models.findOne('users', { _id: admin, status: 'active', deleted: false });
            if (result_admin.error) {
                res.json({
                    error: true,
                    data: null,
                    message: 'Ha ocurrido un error al consultar el admin'
                });
            } else if (!result_admin.error && !result_admin.data) {
                res.json({
                    error: null,
                    data: null,
                    message: 'El admin con ese id no existe o está inhabilitado'
                });
            } else {
                const result_clients = await models.findLean('clients', { status: 'active' })
                if (result_clients.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar los clientes'
                    });
                } else if (!result_clients.error && !result_clients.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron clientes'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_clients.data,
                        message: 'Clientes encontrados correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log("getAllClients ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función getAllClients'
        })
    }
}

async function getAllClientsPrebook(req, res) {
    try {
        const admin = req.user.id
        if (admin) {
            let result_admin = await models.findOne('users', { _id: admin, status: 'active', deleted: false });
            if (result_admin.error) {
                res.json({
                    error: true,
                    data: null,
                    message: 'Ha ocurrido un error al consultar el admin'
                });
            } else if (!result_admin.error && !result_admin.data) {
                res.json({
                    error: null,
                    data: null,
                    message: 'El admin con ese id no existe o está inhabilitado'
                });
            } else {
                const result_clients = await models.findLean('clients', { status: 'active' })
                if (result_clients.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar los clientes'
                    });
                } else if (!result_clients.error && !result_clients.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron clientes'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_clients.data,
                        message: 'Clientes encontrados correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log("getAllClients ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función getAllClients'
        })
    }
}

async function getClient(req, res) {
    try {
        const admin = req.user.id
        const id_client = req.body.client
        if (admin && id_client) {
            let result_admin = await models.findOne('users', { _id: admin, status: 'active', deleted: false });
            if (result_admin.error) {
                res.json({
                    error: true,
                    data: null,
                    message: 'Ha ocurrido un error al consultar el admin'
                });
            } else if (!result_admin.error && !result_admin.data) {
                res.json({
                    error: null,
                    data: null,
                    message: 'El admin con ese id no existe o está inhabilitado'
                });
            } else {
                const result_clients = await models.findOne('clients', { _id: id_client })
                if (result_clients.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar el cliente'
                    });
                } else if (!result_clients.error && !result_clients.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron cliente'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_clients.data,
                        message: 'Cliente encontrado correctamente'
                    });
                }
            }
        } else {
            res.json({
                error: true,
                data: null,
                message: 'No existe admin o body'
            });

        }
    } catch (error) {
        console.log("getRoute ~ error:", error)
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la funcion getRoute'
        });

    }
}

async function updateClient(req, res) {
    try {
        const admin = req.user.id
        const id_client = req.body._id
        if (admin) {
            let result_admin = await models.findOne('users', { _id: admin, status: 'active', deleted: false });
            if (result_admin.error) {
                res.json({
                    error: true,
                    data: null,
                    message: 'Ha ocurrido un error al consultar el admin'
                });
            } else if (!result_admin.error && !result_admin.data) {
                res.json({
                    error: null,
                    data: null,
                    message: 'El admin con ese id no existe o está inhabilitado'
                });
            } else {
                let result_client = await models.findOne('clients', { _id: id_client })
                if (result_client.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar la ruta'
                    });
                } else if (!result_client.error && !result_client.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'El cliente con ese id no existe'
                    });
                } else {
                    const body = req.body
                    const old_client = result_client.data
                    let data_update = {
                        document: body.document ? body.document : old_client.document,
                        type_document: body.type_document ? body.type_document : old_client.type_document,
                        first_name: body.first_name ? body.first_name : old_client.first_name,
                        last_name: body.last_name ? body.last_name : old_client.last_name,
                        phone_number: body.phone_number ? body.phone_number : old_client.phone_number,
                        email: body.email ? body.email : old_client.email,
                        rh: body.rh ? body.rh : old_client.rh,
                        eps: body.eps ? body.eps : old_client.eps,
                        vegan: body.vegan ? body.vegan : null,
                        vegan_observations: body.vegan_observations ? body.vegan_observations : null,
                        status: body.status ? body.status : old_client.status,
                        health_observations: body.health_observations ? body.health_observations : old_client.health_observations,
                    }
                    let update_client = await models.findOneAndUpdate('clients', { _id: id_client }, data_update, { new: true })
                    if (update_client.error) {
                        res.json({
                            error: true,
                            data: null,
                            message: 'Ha ocurrido un error al actualizar el cliente'
                        });
                    } else if (!update_client.error && !update_client.data) {
                        res.json({
                            error: null,
                            data: null,
                            message: 'No existe el cliente a actualizar'
                        });
                    } else {
                        res.json({
                            error: null,
                            data: update_client.data,
                            message: 'Cliente actualizado exitosamente'
                        });
                    }

                }
            }
        }
    } catch (error) {
        console.log("updateClient ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la funcion updateClient'
        });
    }
}

async function deleteClient() {
    try {
        const admin = req.user.id
        const id_client = req.body.client
        if (admin) {
            let result_admin = await models.findOne('users', { _id: admin, status: 'active', deleted: false });
            if (result_admin.error) {
                res.json({
                    error: true,
                    data: null,
                    message: 'Ha ocurrido un error al consultar el admin'
                });
            } else if (!result_admin.error && !result_admin.data) {
                res.json({
                    error: null,
                    data: null,
                    message: 'El admin con ese id no existe o está inhabilitado'
                });
            } else {
                let result_client = await models.findOneAndUpdate('clients', { _id: id_client }, { status: 'inactive', deleted: true }, { new: true })
                if (result_client.error) {
                    res.json({
                        error: true,
                        err: result_client.error,
                        data: null,
                        message: 'Ha ocurrido un error al actualizar el cliente'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_client.data,
                        message: 'Cliente eliminado correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log("deleteClient ~ error:", error)
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la funcion deleteClient'
        });

    }
}

async function bookingRoute(req, res) {
    try {
        const body = req.body
        if (!body) {
            res.json({
                error: true,
                message: 'No existe body en el request'
            });
        } else {
            const { route, client, package, more_books } = body
            const route_id = route._id
            let all_clients = []
            //Buscar el cliente que está haciendo la compra
            const result = await models.findOne('clients', { "document": client.document, "email": client.email })
            all_clients.push(result.data)
            if (more_books?.length > 0) {
                const new_clients = more_books
                //Iterar por cada reserva adiccional
                for (const new_client of new_clients) {
                    const document = new_client.document
                    const email_client = new_client.email
                    //Consultar si el cliente adicciona ya existe
                    const client_result = await models.findOne('clients', { "document": document, "email": email_client })
                    if (client_result.error) {
                        console.log({
                            error: true,
                            data: null,
                            message: 'Ha ocurrido al consultar el cliente'
                        })
                    } else if (!client_result.error && client_result.data) {
                        all_clients.push(client_result.data)
                    } else {
                        let data = {
                            document: new_client.document ? new_client.document : null,
                            type_document: new_client.type_document ? new_client.type_document : null,
                            first_name: new_client.first_name ? new_client.first_name : null,
                            last_name: new_client.last_name ? new_client.last_name : null,
                            phone_number: new_client.phone_number ? new_client.phone_number : null,
                            email: new_client.email ? new_client.email : null,
                            rh: new_client.rh ? new_client.rh : null,
                            eps: new_client.eps ? new_client.eps : null,
                            vegan: body.vegan ? body.vegan : null,
                            vegan_observations: body.vegan_observations ? body.vegan_observations : null,
                            health_observations: new_client.health_observations ? new_client.health_observations : null,
                            status: 'active',
                        }
                        const create_result = await models.newDocument('clients', data);
                        if (create_result.error) {
                            console.log({
                                error: true,
                                err: error,
                                data: null,
                                message: 'Ha ocurrido un error al crear un cliente adiccional'
                            })
                        } else {
                            all_clients.push(create_result.data)
                        }
                    }
                }
            }
            console.log("all_clients:", all_clients)
            let count = 0
            let reservas_exitosas = []
            for (const cliente of all_clients) {
                //Si existe el cliente con una reserva se aumenta el contador
                const client_exist = await models.findOne('routes', { _id: route_id, 'assistants.client': cliente._id })
                if (!client_exist.data) {
                    const update_prebooked_assistants = await models.findOneAndUpdate('routes', { _id: route_id }, { $addToSet: { "assistants": { client: cliente._id, package: package ? package : {}, is_prebook: false } } }, { new: true })
                    if (update_prebooked_assistants.error) {
                        console.log({
                            error: true,
                            err: update_prebooked_assistants.error,
                            message: 'Ha ocurrido un error al actualizar la ruta con el cliente'
                        });
                    } else if (!update_prebooked_assistants.error && !update_prebooked_assistants.data) {
                        console.log({
                            error: null,
                            data: null,
                            message: 'No existe la ruta a reservar'
                        })
                    } else {
                        count = count + 1
                        reservas_exitosas.push(cliente)
                    }
                } else {
                    count = count + 1
                }
            }
            if (count === all_clients.length) {
                res.json({
                    error: null,
                    message: 'Reservas realizadas correctamente',
                })
                for (const clie of all_clients) {
                    sendEmailBooking(clie.first_name, clie.email)
                }
            } else {
                res.json({
                    error: true,
                    message: 'Solo pudimos reservar ' + reservas_exitosas.length + ' Cupos',
                    cupos: reservas_exitosas
                })
                for (const clie of reservas_exitosas) {
                    sendEmailBooking(clie.first_name, clie.email)
                }
            }
        }
    } catch (error) {
        console.log("bookingRoute error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función bookingRoute'
        })

    }

}

async function sendEmailBooking(name, email) {
    try {
        let msg = 'Hola! Tengo interes en obtener más información sobre las rutas de MTB que ofrecen.'
        let linkWhatsApp = 'https://api.whatsapp.com/send?phone=573054499987&text=' + msg
        const correoHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Correo de Espíritu de Montaña</title>
</head>
<body>
  <p>¡Hola ${name}!</p>
  <p>¡Felicidades y bienvenido a esta gran familia de Espíritu de Montaña! Estamos encantados de que hayas elegido unirte a nosotros en esta emocionante ruta de ciclomontañismo. Te aseguramos una gran experiencia, llena de paisajes impresionantes, desafíos gratificantes y grandes compañeros de ruta.</p>
  <h2>Consejos para tu próximo evento ciclista</h2>
  <ul>
  <li>
  <strong>Revisa tu Bici:</strong> Revisa el estado de tu bicicleta como llantas, cadena, suspensión, lubricación y pastillas de frenos.
</li>
<li>
  <strong>Indumentaria adecuada:</strong> Recuerda el uso del casco de manera obligatoria, guantes, buen protector solar, gafas para el sol si lo deseas y ropa adecuada para el clima al cual nos dirigimos.
</li>
<li>
  <strong>Hidratación y nutrición:</strong> En ruta, lleva contigo un bolso o compartimiento en la bici donde puedas llevar suficiente agua y snacks energéticos para mantener tus niveles de energía durante el evento.
</li>
<li>
  <strong>Conocimiento de la ruta:</strong> Familiarízate con la ruta del evento que vamos a visitar, puedes buscar información del pueblo y atractivos turísticos, de seguro vas a llegar con una visión más amplia y disfrutarás más de la zona y el recorrido.
</li>
<li>
  <strong>Entrenamiento previo:</strong> Asegúrate de estar físicamente preparado para que tengas una gran experiencia, entrena días antes de la ruta para que tus piernas y pulmones respondan de la mejor manera.
</li>
<li>
  <strong>Seguridad:</strong> Si deseas, puedes llevar un kit de primeros auxilios básico, sin embargo, el equipo de Espíritu de Montaña estará bien equipado en caso de una emergencia.
</li>
<li>
  <strong>Respeto por la naturaleza:</strong> Recuerda que la montaña nos da la bienvenida, procura no dejar basura, respetar la vida silvestre y flora del lugar, y eso sí, toma muchas fotos y agradécele el dejarnos visitarla.
</li>
<li>
  <strong>Llegada temprana:</strong> Llega temprano al evento para tener tiempo de comer algo, calentar y prepararte para rodar.
</li>
<li>
  <strong>Actitud positiva:</strong> ¡Disfruta del evento, diviértete y muévete con mucho Espíritu!
</li>
  </ul>
  <p>De resto, nosotros nos ocupamos de todo ;)</p>
  <p>Recuerda, estamos aquí para apoyarte en todo lo que necesites.</p>
  <p>Escribenos al <a href="${linkWhatsApp}">WhatsApp</a> si tienes alguna inquietud nuestro equipo siempre está disponible para darte todas las últimas indicaciones.</p>
  <p>¡A rodar!<br>Equipo de Espíritu de Montaña</p>
</body>
</html>
`;
        const data = {
            from: 'Espirítu de Montaña <onboarding@resend.dev>',
            to: [email],
            subject: '¡Bienvenido a coleccionar kilómetros con Espíritu de Montaña!',
            html: correoHTML
        };

        const url = 'https://api.resend.com/emails';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': process.env.RESEND_AUTHORIZATION,
        };

        axios.post(url, data, { headers })
            .then(response => {
                console.log('Respuesta:', response.data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } catch (error) {
        console.log("sendEmailBooking ~ error:", error);
    }
}

async function prebookingRoute(req, res) {
    try {
        const body = req.body
        if (!body) {
            res.json({
                error: true,
                message: 'No existe body en el request'
            });
        } else {
            console.log("🚀 ~ file: clients.js:472 ~ prebookingRoute ~ body:", body)
            const { route, client, package, more_books } = body
            const route_id = route._id
            let all_clients = []

            const result = await models.findOne('clients', { "document": client.document, "email": client.email })
            if (result.data && !result.error) {
                all_clients.push(result.data)
                if (more_books?.length > 0) {
                    const new_clients = more_books.filter(objeto => objeto.email !== client.email);
                    console.log("🚀 ~ file: clients.js:479 ~ prebookingRoute ~ new_clients:", new_clients)
                    for (const new_client of new_clients) {
                        const document = new_client.document
                        const email_client = new_client.email
                        const client_result = await models.findOne('clients', { "document": document, "email": email_client })
                        if (client_result.error) {
                            console.log({
                                error: true,
                                data: null,
                                message: 'Ha ocurrido al consultar el cliente'
                            })
                        } else if (!client_result.error && client_result.data) {
                            all_clients.push(client_result.data)
                            console.log("🚀 ~ file: clients.js:492 ~ prebookingRoute ~ all_clients:", all_clients)
                        } else {
                            let data = {
                                document: new_client.document ? new_client.document : null,
                                type_document: new_client.type_document ? new_client.type_document : null,
                                first_name: new_client.first_name ? new_client.first_name : null,
                                last_name: new_client.last_name ? new_client.last_name : null,
                                phone_number: new_client.phone_number ? new_client.phone_number : null,
                                email: new_client.email ? new_client.email : null,
                                rh: new_client.rh ? new_client.rh : null,
                                eps: new_client.eps ? new_client.eps.name : null,
                                vegan: body.vegan ? body.vegan : null,
                                vegan_observations: body.vegan_observations ? body.vegan_observations : null,
                                health_observations: new_client.health_observations ? new_client.health_observations : null,
                                status: 'active',
                            }
                            const create_result = await models.newDocument('clients', data);
                            console.log("🚀 ~ file: clients.js:504 ~ prebookingRoute ~ create_result:", create_result)
                            if (create_result.error) {
                                console.log({
                                    error: true,
                                    err: create_result.error,
                                    data: null,
                                    message: 'Ha ocurrido un error al crear un cliente'
                                })
                            } else {
                                all_clients.push(create_result.data)
                                console.log("🚀 ~ file: clients.js:517 ~ prebookingRoute ~ all_clients:", all_clients)
                            }
                        }
                    }
                }
                let count = 0
                let reservas_exitosas = []
                console.log("all_clients:", all_clients);
                for (const cliente of all_clients) {
                    const update_prebooked_assistants = await models.findOneAndUpdate('routes', { _id: route_id }, { $addToSet: { "prebooked_assistants": { client: cliente._id, package: package ? package : {} } } }, { new: true })
                    if (update_prebooked_assistants.error) {
                        console.log({
                            error: true,
                            err: update_prebooked_assistants.error,
                            message: 'Ha ocurrido un error al actualizar la ruta con el cliente'
                        });
                    } else if (!update_prebooked_assistants.error && !update_prebooked_assistants.data) {
                        console.log({
                            error: null,
                            data: null,
                            message: 'No existe la ruta a reservar'
                        })
                    } else {
                        count = count + 1
                        reservas_exitosas.push(cliente)
                    }
                }
                if (count === all_clients.length) {
                    res.json({
                        error: null,
                        message: 'Pre reservas realizadas correctamente',
                    })
                } else {
                    res.json({
                        error: true,
                        message: 'Solo pudimos pre reservar ' + reservas_exitosas.length + ' Cupos',
                        cupos: reservas_exitosas
                    })
                }
            } else {
                res.json({
                    error: true,
                    message: 'No pudimos encontrar al usuario principal para realizar la reserva'
                })
            }


        }


    } catch (error) {
        console.log("bookingRoute error:", error)

    }

}

async function createInvoicesClients(req, res) {
    try {
        const body = req.body
        if (!body) {
            res.json({
                error: true,
                message: 'No existe body en el request'
            });
        } else {
            const { route, client, more_books } = body
            const route_id = route._id
            let all_clients = []
            if (more_books?.length > 0) {
                more_books.push(client)
                all_clients = more_books
            } else {
                all_clients.push(client)
            }
            for (const cliente of all_clients) {
                const result = await models.findOne('clients', { document: cliente.document, email: cliente.email })
                if (result.data && !result.error) {
                    let dataInvoice = {
                        client: result.data._id,
                        route: route_id,
                    }
                    const create = await models.newDocument('invoices', dataInvoice)
                    res.json({ error: create.error ? create.error : null, data: create.data });
                    // let new_cliente = result.data
                    // let msg = 'Hola! Tengo interes en obtener más información sobre las rutas de MTB que ofrecen. ¿Podrían ayudarme?'
                    // linkWhatsApp = 'https://api.whatsapp.com/send?phone=573054499987&text=' + msg
                    // const correoHTML = `
                    // <!DOCTYPE html>
                    // <html lang="es">
                    // <head>
                    //   <meta charset="UTF-8">
                    //   <title>Correo electrónico</title>
                    // </head>
                    // <body>
                    //   <p>¡Hola ${new_cliente.first_name}</p>
                    //   <p>Nos hemos dado cuenta de que estás a un paso de completar tu inscripción para la emocionante ruta de ciclomontañismo con Espíritu de Montaña. ¡No dejes pasar la oportunidad de vivir esta increíble experiencia!</p>
                    //   <p>Imagínate pedaleando a través de los majestuosos paisajes de Antioquia, compartiendo historias y risas con compañeros aventureros. No permitas que se escape esta oportunidad de coleccionar kilómetros y recuerdos inolvidables.</p>
                    //   <p>Haz clic aquí <a href="${linkWhatsApp}">Enlace de Pago</a> para completar tu inscripción y comenzar a contar los días para tu próxima gran aventura.</p>
                    //   <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                    //   <p>¡Te esperamos!</p>
                    //   <p>Saludos,</p>
                    //   <p>Equipo de Espíritu de Montaña</p>
                    // </body>
                    // </html>
                    // `;
                    // const data = {
                    //     from: 'Acme <onboarding@resend.dev>',
                    //     to: ['feliperroman1702@gmail.com'],
                    //     subject: 'Tu Aventura en Espíritu de Montaña te Espera',
                    //     html: correoHTML
                    // };

                    // // URL a la que estás haciendo la solicitud POST
                    // const url = 'https://api.resend.com/emails';

                    // const headers = {
                    //     'Content-Type': 'application/json', // Tipo de contenido que estás enviando
                    //     'Authorization': 'Bearer re_fU5xW1LH_MYKBR8n2ScYxz8iMU8aTtSV6', // Ejemplo de encabezado de autorización
                    //     // ... otros encabezados que necesites agregar
                    // };

                    // // Realizar la petición POST usando Axios
                    // axios.post(url, data, { headers })
                    //     .then(response => {
                    //         console.log('Respuesta:', response.data); // Hacer algo con la respuesta
                    //     })
                    //     .catch(error => {
                    //         console.error('Error:', error); // Manejar cualquier error que pueda ocurrir durante la solicitud
                    //     });
                }
            }
        }
    } catch (error) {
        console.log("createInvoiceClient", error);
        res.json({
            error: true,
            message: 'Ha ocurrido un error en la función createInvoiceClient backend'
        })
    }
}

async function updateInvoicesClients(req, res) {
    try {
        const body = req.body
        if (!body) {
            res.json({
                error: true,
                message: 'No existe body en el request'
            });
        } else {
            const { _id } = body
            const updateinvoice = await models.findOneAndUpdate('invoices', { _id: _id }, { paid: true }, { new: true })
            res.json(updateinvoice)
        }
    } catch (error) {
        console.log("updateInvoicesClients ~ error:", error)
        res.json({
            error: true,
            message: 'Ha ocurrido un error en la función updateInvoicesClients backend'
        })
    }
}

async function getAllGallery(req, res) {
    try {
        const get_images = await models.find('gallery', { type: 'gallery' })
        if (get_images.data && !get_images.error) {
            res.json({
                error: null,
                data: get_images.data,
                message: 'Success'
            })
        } else {
            res.json({
                error: true,
                err: get_images.error,
                data: get_images.data,
                message: 'Success'
            })
        }
    } catch (error) {
        console.log("getAllGallery ~ error:", error);
        res.json({
            error: true,
            message: 'Ha ocurrido un error en la función getAllGallery',
            err: error
        });
    }
}

async function getCarousel(req, res) {
    try {
        const get_images = await models.find('gallery', { type: 'carousel' })
        if (get_images.data && !get_images.error) {
            res.json({
                error: null,
                data: get_images.data,
                message: 'success'
            })
        } else {
            res.json({
                error: true,
                err: get_images.error,
                data: get_images.data,
                message: 'No hay imagenes'
            })
        }
    } catch (error) {
        console.log("getCarousel ~ error:", error);
        res.json({
            error: true,
            message: 'Ha ocurrido un error en la función getCarousel',
            err: error
        });
    }
}

async function getImgExp(req, res) {
    try {
        const get_images = await models.find('gallery', { $or: [{ "type": "grupales" }, { "type": "empresas" }, { "type": "extranjeros" }] })
        if (get_images.data && !get_images.error) {

            const empresas = get_images.data.filter(image => image.type === 'empresas')
            const extranjeros = get_images.data.filter(image => image.type === 'extranjeros')
            const grupales = get_images.data.filter(image => image.type === 'grupales')

            const filteredImages = {
                empresas: empresas?.length > 0 ? empresas[0].image_url : null,
                extranjeros: extranjeros?.length > 0 ? extranjeros[0].image_url : null,
                grupales: grupales?.length > 0 ? grupales[0].image_url : null,
            };

            res.json({
                error: null,
                data: filteredImages,
                message: 'success'
            })
        } else {

            res.json({
                error: true,
                err: get_images.error,
                data: get_images.data,
                message: 'No hay imagenes'
            })
        }
    } catch (error) {
        console.log("getCarousel ~ error:", error);
        res.json({
            error: true,
            message: 'Ha ocurrido un error en la función getCarousel',
            err: error
        });
    }
}

async function CreateImgTreatmentFile(req, res) {
    const { name: nombre, document: cc, email: correoDestino } = req.body

    try {
        // Crea el documento Word
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "AUTORIZACIÓN DE USO DE DERECHOS DE IMAGEN SOBRE FOTOGRAFÍAS\nY FIJACIONES AUDIOVISUALES (VIDEOS) ENTENDIDOS COMO DATOS\nPERSONALES.",
                                    bold: true,
                                    size: 24,
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "A través de la aceptación del presente documento, expreso mi libre deseo de\nparticipar en el evento y realizo las siguientes declaraciones:",
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Acorde a lo establecido por la Ley 1581 de 2012 y el Decreto Reglamentario 1377\nde 2013, demás legislación y jurisprudencia vigente para el tratamiento de la\nimage, video, voz y similares entendidos como dato personal, autorizo de manera\ngratuita, el uso y tratamiento de mi imagen, mi voz y demás datos personales que\nsean fijados en producciones o grabaciones de video, audio, entrevistas, tomas\nfotográficas, o procedimientos que se asimilen a la fotografía y su almacenamiento\ny custodia en medios digitales, en razón de mi participación en el evento dicha\nautorización se regirá bajo los siguientes términos.",
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "PRIMERA – AUTORIZACIÓN: LA PERSONA, mediante el presente documento\nautoriza la utilización de los derechos de imagen sobre fotografías o\nprocedimientos análogos a la fotografía, o producciones Audiovisuales (Videos),\nasí como los derechos patrimoniales de autor (Reproducción, Comunicación\nPública, Transformación y Distribución) y derechos conexos, a ESPIRITU DE\nMONTAÑA SAS para incluirlos en fotografías o procedimientos análogos a la\nfotografía, o producciones Audiovisuales (Videos).",
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "SEGUNDA - OBJETO: Por medio del presente escrito, LA PERSONA, autoriza a\nESPIRITU DE MONTAÑA para que de conformidad con las normas\ninternacionales que sobre Propiedad Intelectual que sean aplicables, así como\nbajo las normas vigentes en Colombia, use los derechos de imagen sobre\nfotografías o procedimientos análogos a la fotografía, o producciones\nAudiovisuales (Videos), así como los derechos de propiedad intelectual y sobre\nDerechos Conexos que le puedan pertenecer para ser utilizados por la empresa",
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "TERCERA- Alcance de la autorización. La presente autorización de uso se otorga\npara ser utilizada en formato o soporte material en ediciones impresas, y se\nextiende a la utilización en medio electrónico, óptico, magnético, en redes (Intranet\ne Internet), mensajes de datos o similares y en general para cualquier medio o\nsoporte conocido o por conocer en el futuro. La publicación podrá efectuarse de\nmanera directa o a través de un tercero que se designe para tal fin.",
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "CUARTA: Ubicación - Los derechos aquí autorizados se dan sin limitación\ngeográfica o territorial alguna.",
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "QUINTA: Exclusividad: La autorización de uso aquí establecida no implica\nexclusividad en favor de ESPIRITU DE MONTAÑA SAS por lo tanto LA PERSONA\nse reserva y conserva el derecho de otorgar directamente, u otorgar a cualquier\ntercero, autorizaciones de uso similares o en los mismos términos aquí acordados.",
                                }),
                            ],
                        }),
                        // Espacio en blanco
                        new Paragraph({ children: [] }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `En concordancia con las disposiciones anteriores, Yo ${nombre.toUpperCase()}, identificado con C.C. Nº ${cc}, Manifiesto voluntaria y plenamente consciente de las consecuencias legales y jurídicas que el presente escrito conlleva y lo acepto\nprevio a la contratación del servicio.`,
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        // Convierte el documento a un buffer
        const buffer = await Packer.toBuffer(doc);

        const correoHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Correo de Espíritu de Montaña</title>
</head>
<body>
  <p>¡Hola ${nombre}!</p>
  <p>Te enviamos tu consentimiento de tratamiento de imagen personal.</p>
 
</body>
</html>
`;
        let resultEmail = await resend.sendFileImagePersonal(correoHTML, buffer, correoDestino)

        res.json(resultEmail)

    } catch (error) {
        console.log('Error al crear o enviar el documento:', error);
        res.status(500).send('Error al generar o enviar el documento');
    }
}

async function CreateExonerationFile(req, res) {
    const { name: nombreUsuario, route_name: nombreEvento, email: correoDestino, document: cc } = req.body

    try {
        // Crea el documento Word
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        // Título del documento
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `EXONERACIÓN DE RESPONSABILIDAD DEL EVENTO DENOMINADO ${nombreEvento.toUpperCase()} QUIEN EN ADELANTE SE DENOMINARÁ EL EVENTO`,
                                    bold: true,
                                    size: 24,
                                })
                            ]
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Párrafo introductorio
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "A través de la aceptación del presente documento, expreso mi libre deseo de participar en el evento y realizo las siguientes declaraciones:",
                                })
                            ]
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Lista numerada con anidamiento
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "1. conozco los riesgos y peligros asociados a participar en el evento al cual me inscribo y deseo participar voluntariamente.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "1.1 Soy consciente que la práctica de deportes al aire libre conlleva riesgos asociados a la integridad (física, mental, etc. ...) se describirán de manera enunciativa, más no taxativa, más adelante, en consecuencia, acepto y asumo todos los riesgos asociados con mi participación en el evento, incluyendo, pero no limitándolo, a mis propias acciones u omisiones, o de los organizadores, de otros participantes, espectadores, (describir condiciones físicas del clima)",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 2,
                                }
                            }
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Párrafo con notas (en negrita)
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "REVISAR POLIZA ULTIMO EVENTO PARA MIRAR QUE RIESGOS CUBRE\nAGREGAR A POLIZAS",
                                    bold: true
                                })
                            ]
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Lista numerada con anidamiento
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "2. Reconozco y acepto que los riesgos y peligros derivados de la participación en el Evento a participar, los cuales son los siguientes sin implicar que puedan existir riesgos no mencionados: i) Sufrir daños o lesiones, graves o leves, y que pueden causar discapacidad permanente, e incluso la muerte; ii) Hurto de los equipos utilizados, como bicicletas, motocicletas, vehículos automotores, accesorios y equipos utilizados, artículos personales y de tecnología; iii) Falla o avería de la bicicleta en la que me esté movilizando; iv) Al estar realizando actividades al aire libre, existen riesgos derivados de los cambios climáticos, tales como accidentes por lluvias, superficies, terrenos y demás escenarios que se relacionen directa o indirectamente con el clima y demás condiciones naturales que no pueden ser controladas por el prestador del servicio; v) Accidentes que se pueden presentar en sitios remotos, dificultando la asistencia oportuna de primeros auxilios y, vi). Demás riesgos derivados de la realización de la actividad contratada AGREGAR INTOXICACIÓN O ENFERMEDAD GENERAL POR CONSUMO DE ALIMENTOS.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "2.1 Entiendo que la descripción de estos riesgos no es completa y que podrían suscitarse riesgos imprevistos o desconocidos, que pueden generar lesiones, enfermedades, e incluso la muerte.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 2,
                                }
                            }
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Lista numerada
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "3. Declaro que me encuentro en plenas condiciones físicas, fisiológicas, y que estoy entrenado(a) y preparado(a) para participar en el evento, del cual conozco su ruta, exigencia física y necesidad de preparación, asumo expresamente todos los daños, riesgos o resultados que se generen con relación a mi decisión voluntaria de participar.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "3.1 Así mismo, me encuentro afiliado al sistema de seguridad social y/o cuento con un seguro médico vigente, para que, en caso de enfermedades o accidentes causados por mi participación en el evento cuente con una cobertura plena para que las mismas sean debidamente atendidas. En consecuencia, exonero y mantengo indemne a ESPIRITU DE MONTAÑA S.A.S, de cualquier reclamación que se relacione con enfermedades o accidentes tanto presentes como futuros, a la participación mía en el evento antes referido.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 2,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "3.2.  Consecuentemente y, en caso de presentarse un accidente durante el evento, acepto expresamente que se presten los primeros auxilios, entendiendo que el equipo logístico autorizado por ESPIRITU DE MONTAÑA no será responsable por la prestación de servicios de salud que requiera, toda vez que estos servicios son meramente temporales y circunstanciales, que tienen como propósito suministrar los primeros auxilios básicos para buscar disminuir las contingencias o secuelas que se puedan ocasionar a raíz del accidente.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 3,
                                }
                            }
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Lista numerada
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "4. Reconozco y acepto que el traslado de los vehículos (bicicletas) para desarrollar las actividades no se encuentra amparados por una póliza por tal razón ante la posibilidad de una pérdida o daño ocasionado en el transporte de los vehículos exonero de la responsabilidad a ESPIRITU DE MONTAÑA o quien preste el servicio de transporte del vehículo ante cualquier daño que ocurra durante el mismo.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Lista numerada con anidamiento
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "5. Adicionalmente, reconozco que, con la aceptación del presente documento, se derivan las siguientes consecuencias:",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "5.1. Exonero de responsabilidad a ESPIRITU DE MONTAÑA S.A.S, a sus colaboradores, dependientes, empleados, clientes y demás representantes de la misma, con respecto a traumatismos, lesiones, o mi deceso.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 2,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "5.2. Libero de toda responsabilidad y obligación toda reclamación, queja, denuncia o demanda, instaurada por mí o por mis herederos, legatarios o albaceas, que se fundamenten en las lesiones, daños, pérdidas o deceso provenientes de la realización de las actividades derivadas del evento desarrollado por ESPIRITU DE MONTAÑA S.A.S. En consecuencia, declaro que he leído y comprendido el presente acuerdo, y las consecuencias legales que de este se derivan.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 2,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "5.3 Exonero de responsabilidad a ESPIRITU DE MONTAÑA S.A.S, a sus colaboradores, dependientes, empleados, clientes y demás representantes de la misma, con respecto a hurtos, perdidas, daños o afectaciones a bienes materiales que puedan surgir, antes, durante y después del desarrollo del evento.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 2,
                                }
                            }
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Lista numerada
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "6. conozco que me encuentro amparada por la póliza de seguro BRINDADA POR ESPIRITU DE MONTAÑA DENTRO DEL EVENTO ACTUAL, la cual de manera voluntaria acepté y me acogí a los montos establecidos en la misma, sin que los valores adicionales causados sean responsabilidad de ESPIRITU DE MONTAÑA S.A.S ni del asegurador.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Párrafo con nombre del usuario y número de cédula
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `En concordancia con las disposiciones anteriores, Yo ${nombreUsuario}, identificado con C.C. Nº ${cc}, Manifiesto voluntaria y plenamente consciente de las consecuencias legales y jurídicas que el presente escrito conlleva y lo acepto previo a la contratación del servicio.`,
                                })
                            ]
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Párrafo con título de "Disposiciones adicionales"
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Disposiciones adicionales.",
                                })
                            ]
                        }),

                        // Espacio en blanco
                        new Paragraph({ children: [] }),

                        // Lista numerada
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "1. A quien firma el documento se le remitirá previo al evento la póliza de seguros por la cual se encuentra cubierta durante el evento a participar.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "2. Como participante del evento declaro que conozco y me comprometo a aplicar las normas de tránsito y seguridad que rigen la actividad a desarrollar y que la inaplicación de estas exonera de responsabilidad a la empresa ESPIRITU DE MONTAÑA S.A.S",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "3. Reconozco que antes, durante y después del evento, pueden presentarse situaciones de orden público que dificulten, restrinjan, impidan u obliguen a modificar o cancelar el evento y que dichas situaciones no serán imputables a ESPIRITU DE MONTAÑA S.A.S como organizador, así mismo este podrá tomar las medidas que considere pertinentes con el fin de salvaguardar la integridad de los participantes del evento sin que esto sea motivo de responsabilidad.",
                                })
                            ],
                            style: 'ListParagraph',
                            properties: {
                                numbering: {
                                    reference: 'Numbering',
                                    level: 1,
                                }
                            }
                        }),

                    ]
                }
            ]
        });


        // Convierte el documento a un buffer
        const buffer = await Packer.toBuffer(doc);

        const correoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Correo de Espíritu de Montaña</title>
        </head>
        <body>
          <p>¡Hola ${nombreUsuario}!</p>
          <p>Te enviamos tu documento de exoneración de responsabilidad que aceptaste con Espíritu de Montaña para el evento ${nombreEvento}.</p>
         
        </body>
        </html>
        `;
        let resultEmail = await resend.sendFileExoneration(correoHTML, buffer, correoDestino)
        // Envía el correo electrónico
        res.json(resultEmail)

    } catch (error) {
        console.log('Error al crear o enviar el documento:', error);
        res.status(500).send('Error al generar o enviar el documento');
    }
}




module.exports = {
    get: {
        getAllClients,
        getAllGallery,
        getCarousel,
        getImgExp
        // getComments
    },
    post: {
        createClient,
        updateClient,
        deleteClient,
        getClient,
        bookingRoute,
        prebookingRoute,
        createInvoicesClients,
        updateInvoicesClients,
        CreateImgTreatmentFile,
        CreateExonerationFile
    }
}