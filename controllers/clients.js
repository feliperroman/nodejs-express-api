// =============================================================================
// PACKAGES
// =============================================================================
// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
const axios = require("axios")
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
                const client_exist = await models.findOne('routes', { _id: route_id , 'assistants.client' : cliente._id })
                if(!client_exist.data){
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
                }else{
                    count = count + 1
                }
            }
            if (count === all_clients.length) {
                res.json({
                    error: null,
                    message: 'Reservas realizadas correctamente',
                })
                for(const clie of all_clients){
                    sendEmailBooking(clie.first_name, 'feliperroman1702@gmail.com')
                }
            } else {
                res.json({
                    error: true,
                    message: 'Solo pudimos reservar ' + reservas_exitosas.length + ' Cupos',
                    cupos: reservas_exitosas
                })
                for(const clie of reservas_exitosas){
                    sendEmailBooking(clie.first_name, 'feliperroman1702@gmail.com')
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
  <p>Antes de comenzar, aquí tienes algunas recomendaciones para asegurar que tu aventura sea tan segura como emocionante:</p>
  <ul>
    <li><strong>Equipo Adecuado</strong>: Asegúrate de llevar ropa cómoda y adecuada para realizar ciclismo de montaña y obvio, el casco es indispensable!</li>
    <li><strong>Verifica tu Bici</strong>: Antes de la ruta, has una revisión previa de tu bicicleta, es esencial para evitar inconvenientes técnicos. Lleva contigo un kit básico de repuestos: Neumático extra, palancas, juego para parchar, inflador, juego de llaves y pines de cadena.</li>
    <li><strong>Protección Solar, mucha energía y ganas para la ruta.</strong></li>
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

                    let new_cliente = result.data
                    let msg = 'Hola! Tengo interes en obtener más información sobre las rutas de MTB que ofrecen. ¿Podrían ayudarme?'
                    linkWhatsApp = 'https://api.whatsapp.com/send?phone=573054499987&text=' + msg
                    const correoHTML = `
                    <!DOCTYPE html>
                    <html lang="es">
                    <head>
                      <meta charset="UTF-8">
                      <title>Correo electrónico</title>
                    </head>
                    <body>
                      <p>¡Hola ${new_cliente.first_name}</p>
                      <p>Nos hemos dado cuenta de que estás a un paso de completar tu inscripción para la emocionante ruta de ciclomontañismo con Espíritu de Montaña. ¡No dejes pasar la oportunidad de vivir esta increíble experiencia!</p>
                      <p>Imagínate pedaleando a través de los majestuosos paisajes de Antioquia, compartiendo historias y risas con compañeros aventureros. No permitas que se escape esta oportunidad de coleccionar kilómetros y recuerdos inolvidables.</p>
                      <p>Haz clic aquí <a href="${linkWhatsApp}">Enlace de Pago</a> para completar tu inscripción y comenzar a contar los días para tu próxima gran aventura.</p>
                      <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                      <p>¡Te esperamos!</p>
                      <p>Saludos,</p>
                      <p>Equipo de Espíritu de Montaña</p>
                    </body>
                    </html>
                    `;
                    const data = {
                        from: 'Acme <onboarding@resend.dev>',
                        to: ['feliperroman1702@gmail.com'],
                        subject: 'Tu Aventura en Espíritu de Montaña te Espera',
                        html: correoHTML
                    };

                    // URL a la que estás haciendo la solicitud POST
                    const url = 'https://api.resend.com/emails';

                    const headers = {
                        'Content-Type': 'application/json', // Tipo de contenido que estás enviando
                        'Authorization': 'Bearer re_fU5xW1LH_MYKBR8n2ScYxz8iMU8aTtSV6', // Ejemplo de encabezado de autorización
                        // ... otros encabezados que necesites agregar
                    };

                    // Realizar la petición POST usando Axios
                    axios.post(url, data, { headers })
                        .then(response => {
                            console.log('Respuesta:', response.data); // Hacer algo con la respuesta
                        })
                        .catch(error => {
                            console.error('Error:', error); // Manejar cualquier error que pueda ocurrir durante la solicitud
                        });
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

async function getAllGallery(req, res) {
    try {
        const get_images = await models.find('gallery')
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

module.exports = {
    get: {
        getAllClients,
        getAllGallery
    },
    post: {
        createClient,
        updateClient,
        deleteClient,
        getClient,
        bookingRoute,
        prebookingRoute,
        createInvoicesClients
    }
}