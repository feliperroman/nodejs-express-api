// =============================================================================
// PACKAGES
// =============================================================================
const bcrypt = require('bcrypt')
const axios = require("axios")

// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
const { ObjectId } = require('mongodb');
const utils = require("../helpers/utils")

// =============================================================================
// REST FUNCTIONS
// =============================================================================
async function createUser(req, res) {
    try {
        // const admin = req.user.id
        // if (admin) {
        //     let result_admin = await models.findOne('users', { _id: admin, status: 'active', deleted: false });
        //     if (result_admin.error) {
        //         res.json({
        //             error: true,
        //             data: null,
        //             message: 'Ha ocurrido un error al consultar el admin'
        //         });
        //     } else if (!result_admin.error && !result_admin.data) {
        //         res.json({
        //             error: null,
        //             data: null,
        //             message: 'El admin con ese id no existe o está inhabilitado'
        //         });
        //     } else {
        let body = req.body
        let result_user = await models.findOne('users', { email: body.email })
        if (result_user.error) {
            res.json({
                error: true,
                data: null,
                message: 'Ha ocurrido un error al consultar el usuario con su email'
            });
        } else if (!result_user.error && result_user.data) {
            res.json({
                error: null,
                data: null,
                message: 'El usuario ya existe'
            });
        } else {
            let data = {
                first_name: body.first_name ? body.first_name : null,
                last_name: body.last_name ? body.last_name : null,
                type_user: body.type_user ? body.type_user : null,
                user_name: body.user_name ? body.user_name : null,
                email: body.email ? body.email : null,
                password: body.password ? bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null) : null,
                age: body.age ? body.age : null,
                status: body.status ? body.status : null,
                phone: body.email ? body.email : null,
                city: body.city ? body.city : null,
                country: body.country ? body.country : null,
            }
            let create_result = await models.newDocument('users', data)
            if (create_result.error) {
                res.json({
                    error: true,
                    data: null,
                    message: 'Ha ocurrido un error al crear el usuario'
                })
            } else {
                res.json({
                    error: null,
                    data: create_result.data,
                    message: 'El usuario se ha creado correctamente'
                })
            }
        }
        //     }
        // }
    } catch (error) {
        console.log("createUser ~ error:", error)
        res.json({
            error: true,
            data: null,
            err: error
        });
    }
}
async function getAllRoutes(req, res) {
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
                const result_routes = await models.findLean('routes')
                if (result_routes.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar las rutas'
                    });
                } else if (!result_routes.error && result_routes.data?.length === 0) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron rutas'
                    });
                } else {
                    res.json({
                        error: null,
                        data: statusRoute(result_routes.data),
                        message: 'Rutas encontradas correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log(" getAllRoutes ~ error:", error);
        res.json({
            error: true,
            data: null,
            err: error,
            message: 'Ha ocurrido un error en la función getAllRoutes'
        });
    }
}
function statusRoute(routes) {
    const estados = {
        CasiLlena: 'Casi llena',
        Disponible: 'Disponible',
        Sincupos: 'Sin cupos'
    };

    const routesStatus = routes.map((route) => {
        const ocupacion = route.assistants.length;
        const maximo = route.quantity_persons;
        let status = estados.Disponible;
        if (ocupacion == maximo) {
            status = estados.Sincupos;
        } else if (ocupacion === 0) {
            status = estados.Disponible;
        }
        else if (ocupacion > 0.5 * maximo) {
            status = estados.CasiLlena;
        }

        return {
            ...route,
            quota_status: status
        };
    });

    return routesStatus.filter((route) => route.quota_status !== 'Sin cupos');
}


async function getUsers(req, res) {
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
                const users_result = await models.findLean('users', { status: 'active', deleted: false })
                if (users_result.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar los usuarios'
                    })
                } else if (!users_result.error && !users_result.data?.length === 0) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No hay usuarios existentes en la base de datos'
                    })
                } else {
                    res.json({
                        error: null,
                        data: users_result.data,
                        message: 'Usuarios encontrados correctamente'
                    })
                }
            }
        }

    } catch (error) {
        console.log("getUser ~ error:", error)
        res.json({
            error: true,
            data: null,
            err: error
        });
    }
}

async function getUser(req, res) {
    try {
        const admin = req.user.id
        const id_user = req.body.user
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
                const result_user = await models.findOne('users', { _id: id_user })
                if (result_user.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al el usuario'
                    });
                } else if (!result_user.error && !result_user.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron usuarios'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_user.data,
                        message: 'usuario encontrado correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log("getUser ~ error:", error)
        res.json({
            error: true,
            data: null,
            err: error,
            message: 'Ha ocurrido un error en la función getUser'
        });
    }
}

async function updateUser(req, res) {
    try {
        const admin = req.user.id
        const id_user = req.body.user
        const body = req.body
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
                const result_user = await models.findOne('users', { _id: id_user })
                if (result_user.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al el usuario'
                    });
                } else if (!result_user.error && !result_user.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron usuarios'
                    });
                } else {
                    const old_user = result_user.data
                    let data = {
                        first_name: body.first_name ? body.first_name : old_user.first_name,
                        last_name: body.last_name ? body.last_name : old_user.last_name,
                        type_user: body.type_user ? body.type_user : old_user.type_user,
                        user_name: body.user_name ? body.user_name : old_user.user_name,
                        email: body.email ? body.email : old_user.email,
                        // password: body.password ? bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null) : null, CREATE FUNCTION FOR RESET PASSWORD (VALIDATE PASSWORDS)
                        age: body.age ? body.age : old_user.age,
                        status: body.status ? body.status : old_user.status,
                        phone: body.email ? body.email : old_user.email,
                        city: body.city ? body.city : old_user.city,
                        country: body.country ? body.country : old_user.country,
                    }
                    let update_result = await models.findOneAndUpdate('users', { _id: id_user }, data, { new: true })
                    if (update_result.error) {
                        res.json({
                            error: true,
                            data: null,
                            message: 'Ha ocurrido un error al actualizar el usuario'
                        })
                    } else {
                        res.json({
                            error: null,
                            data: update_result.data,
                            message: 'El usuario se ha actualizado correctamente'
                        })
                    }

                }
            }
        }

    } catch (error) {
        console.log("updateUser ~ error:", error);
        res.json({
            error: true,
            data: null,
            err: error,
            message: 'Ha ocurrido un error en la función updateUser'
        });

    }
}

async function deleteUser(req, res) {
    try {
        const admin = req.user.id
        const id_user = req.body.user
        if (admin && id_user) {
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
                let result_user = await models.findOneAndUpdate('users', { _id: id_user }, { status: 'inactive', deleted: true }, { new: true })
                if (result_user.error) {
                    console.log("deleteUser error:", result_user.error)
                    res.json({
                        error: true,
                        err: result_user.error,
                        data: null,
                        message: 'Ha ocurrido un error al actualizar el usuario'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_user.data,
                        message: 'Usuario eliminada correctamente'
                    });
                }
            }
        } else {
            res.json({
                error: true,
                data: null,
                message: 'No existen admin o body'
            });
        }
    } catch (error) {
        console.log("deleteUser ~ error:", error);
        res.json({
            error: true,
            data: null,
            err: error,
            message: 'Ha ocurrido un error en la función deleteUser'
        });


    }
}

async function seeReservasClient(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (admin && body) {
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
                const client = body.client_id;
                const find_preebook = await models.find('routes', { "assistants.client": client });
                if (find_preebook.error) {
                    res.json({
                        error: true,
                        err: find_preebook.error,
                        message: 'Ha ocurrido un error al consultar las rutas reservadas'
                    });
                } else if (!find_preebook.error && !find_preebook.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'El cliente no tiene rutas reservadas'
                    });
                } else {
                    const routes = find_preebook.data
                    let all_routes_map = []
                    //Nombre ruta, fecha de reserva y paquete comprado o valor comprado
                    for (const route of routes) {
                        const assistants = route.assistants
                        const reserva = assistants.find(rout => rout.client?._id.toString() === client)
                        let price
                        if (reserva.package) {
                            price = reserva.package.title + ' ' + reserva.package.price.toLocaleString('es-CO')
                        } else {
                            price = route.price.toLocaleString('es-CO')
                        }
                        all_routes_map.push({
                            title: route.title + ' ' + route.km + 'K',
                            date_booked: reserva.date_booked,
                            price: price
                        })
                    }
                    console.log("🚀 ~ file: users.js:360 ~ seeReservasClient ~ all_routes_map:", all_routes_map)

                    res.json({
                        error: null,
                        data: all_routes_map,
                        message: 'Rutas reservadas encontradas'
                    })

                }
            }
        } else {
            res.json({
                error: true,
                data: null,
                message: 'No existen admin o body'
            });
        }
    } catch (error) {
        console.log("seeReservasClient  error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función seeReservasClient'
        })
    }
}

async function seePrereservasClient(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (admin && body) {
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
                const client = body.client_id;
                const find_preebook = await models.find('routes', { "prebooked_assistants.client": client });
                if (find_preebook.error) {
                    res.json({
                        error: true,
                        err: find_preebook.error,
                        message: 'Ha ocurrido un error al consultar las rutas pre reservadas'
                    });
                } else if (!find_preebook.error && !find_preebook.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'El cliente no tiene rutas pre reservadas'
                    });
                } else {
                    const routes = find_preebook.data
                    let all_routes_map = []
                    //Nombre ruta, fecha de reserva y paquete comprado o valor comprado
                    for (const route of routes) {
                        console.log("🚀 ~ file: users.js:443 ~ seePrereservasClient ~ route:", route)
                        const assistants = route.prebooked_assistants
                        const reserva = assistants.find(rout => rout.client?._id.toString() === client)
                        console.log("🚀 ~ file: users.js:445 ~ seePrereservasClient ~ reserva:", reserva)
                        let price
                        if (reserva.package) {
                            // price = reserva.package.title + ' ' + reserva.package.price.toLocaleString('es-CO')
                            price = reserva.package.price
                        } else {
                            price = route.price
                        }
                        if (route.prebook && route.percentage_prebook) {
                            let percentage_prebook = route.percentage_prebook
                            let multi = price * percentage_prebook
                            let new_price = multi / 100
                            price = new_price
                        }
                        if (reserva.package) {
                            price = reserva.package.title + ' ' + price.toLocaleString('es-CO')
                        } else {
                            price = price.toLocaleString('es-CO')
                        }
                        all_routes_map.push({
                            title: route.title + ' ' + route.km + 'K',
                            route_id: route._id,
                            date_booked: reserva.date_booked,
                            price: price,
                            prebook: true
                        })
                    }
                    res.json({
                        error: null,
                        data: all_routes_map,
                        message: 'Rutas pre reservadas encontradas'
                    })

                }
            }
        } else {
            res.json({
                error: true,
                data: null,
                message: 'No existen admin o body'
            });
        }
    } catch (error) {
        console.log("seeReservasClient  error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función seeReservasClient'
        })
    }
}

async function confirmPrebook(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (admin && body) {
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
                const client = body.client_id;
                const route = body.route_id
                const find_preebook = await models.findOne('routes', { "_id": route, "prebooked_assistants.client": client });
                if (find_preebook.error) {
                    res.json({
                        error: true,
                        err: find_preebook.error,
                        message: 'Ha ocurrido un error al consultar las rutas reservadas'
                    });
                } else if (!find_preebook.error && !find_preebook.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'El cliente no tiene rutas reservadas'
                    });
                } else {
                    const route = find_preebook.data
                    const assistants = route.prebooked_assistants
                    let prebook = assistants.find(rout => rout.client?._id.toString() === client)
                    prebook.is_prebook = true
                    let obj = {
                        client: prebook.client,
                        package: prebook.package,
                        date_booked: prebook.date_booked,
                        _id: prebook._id,
                        is_prebook: true
                    }
                    const confirm_prebook = await models.findOneAndUpdate('routes', { "_id": route }, { $addToSet: { "assistants": obj }, $pull: { "prebooked_assistants": prebook } }, { new: true });
                    res.json({
                        error: null,
                        data: confirm_prebook.data,
                        message: 'Pre reserva confirmada correctamente'
                    })

                    // let new_cliente = client
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
        } else {
            res.json({
                error: true,
                data: null,
                message: 'No existen admin o body'
            });
        }
    } catch (error) {
        console.log("confirmPrebook ~ error:", error)
    }

}

async function addImagesGallery(req, res) {
    try {
        const admin = req.user.id
        const images = req.files
        const type = req.body.type
        if (!admin || !images) {
            res.json({
                error: true,
                message: 'No existe token, images '
            })
        } else {
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
                if (type !== null && type !== 'Carousel' && type !== 'Galeria' && type !== 'Galeria') {
                    const imguup = images[0]
                    let add_pic = await utils.uploadGallery(imguup, "gallery_");
                    let updateimg = await models.findOneAndUpdate('gallery', { type: type }, { image_url: add_pic['images[]'] })
                    if (updateimg.error) {
                        res.json({
                            error: true,
                            err: updateimg.error,
                            message: 'Ha ocurrido un error al crear imagenes'
                        })
                    } else if (!updateimg.error && !updateimg.data) {
                        res.json({
                            erro: null,
                            data: null,
                            message: 'No existe la coleccion gallery'
                        })
                    } else {
                        res.json({
                            error: null,
                            data: updateimg.data,
                            message: 'Imagene actualizada'
                        })
                    }
                } else {
                    let all_images = []
                    for (const image of images) {
                        let add_pic = await utils.uploadGallery(image, "gallery_");
                        all_images.push({ image_url: add_pic['images[]'], type: type === 'Carousel' ? 'carousel' : 'gallery' });
                    }
                    if (all_images.length === images.length) {

                        const insert = await models.insertMany('gallery', all_images)
                        if (insert.error) {
                            res.json({
                                error: true,
                                err: insert.error,
                                message: 'Ha ocurrido un error al crear imagenes'
                            })
                        } else if (!insert.error && !insert.data) {
                            res.json({
                                erro: null,
                                data: null,
                                message: 'No existe la coleccion gallery'
                            })
                        } else {
                            res.json({
                                error: null,
                                data: insert.data,
                                message: 'Imagenes creadas'
                            })

                        }


                    }
                }

            }
        }
    } catch (error) {
        console.log("addImagesRoute error:", error)

    }
}

async function createComment(req, res) {
    try {
        const admin = req.user.id
        if (!admin) {
            res.json({
                error: true,
                message: 'No existe token en request'
            })
        } else {
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
                const { name, comment } = req?.body
                if (!name || !comment) {
                    res.json({
                        error: true,
                        message: 'No existe name o comment en body'
                    })
                } else {
                    const create_comment = await models.newDocument('comments', req.body)
                    if (create_comment.error) {
                        res.json({
                            error: true,
                            err: create_comment.error,
                            message: 'Ha ocurrido un error al crear el comentario'
                        })
                    } else {
                        res.json({
                            error: null,
                            message: 'Comentario creado',
                            data: create_comment.data
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log("createComment error:", error)
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función createComment'
        });
    }
}

async function addImageComment(req, res) {
    try {
        const admin = req.user.id
        const image = req.files
        const body = req.body
        if (!admin || !image || !body) {
            res.json({
                error: true,
                message: 'No existe token, images or body '
            })
        } else {
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
                let add_pic = await utils.uploadGallery(image[0], "comment_");
                console.log("🚀 ~ addImageComment ~ add_pic:", add_pic)
                const insert = await models.findOneAndUpdate('comments', { _id: body._id }, { image_url: add_pic.image })
                if (insert.error) {
                    res.json({
                        error: true,
                        err: insert.error,
                        message: 'Ha ocurrido un error al crear imagenes'
                    })
                } else if (!insert.error && !insert.data) {
                    res.json({
                        erro: null,
                        data: null,
                        message: 'No existe el comentario con ese _id'
                    })
                } else {
                    res.json({
                        error: null,
                        data: insert.data,
                        message: 'Imagen creada'
                    })
                }
            }
        }
    } catch (error) {
        console.log("addImageComment error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función addImageComment'
        });
    }
}

async function createVideo(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (!admin || !body) {
            res.json({
                error: true,
                message: 'No existe token or body '
            })
        } else {
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
                const add_video = await models.newDocument('videos', { link: body.link })
                if (add_video.error) {
                    res.json({
                        error: true,
                        err: add_video.error,
                        message: 'Ha ocurrido un error al guardar el video'
                    });
                } else {
                    res.json({
                        error: null,
                        data: add_video.data,
                        message: 'Video creado'
                    });
                }
            }
        }

    } catch (error) {
        console.log("createVideo ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función createVideo'
        })
    }
}

async function getComments(req, res) {
    try {
        const get_comments = await models.find('comments', { 'status': 'active' })
        if (get_comments.data && !get_comments.error) {
            res.json({
                error: null,
                data: get_comments.data,
                message: 'Success'
            })
        } else {
            console.log('Error get comments', get_comments)
            res.json({
                error: true,
                err: get_comments.error,
                data: get_comments.data,
                message: 'error'
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
async function videosUpdate(req, res) {
    try {
        const admin = req.user.id
        if (!admin) {
            res.json({
                error: true,
                message: 'No existe token en request'
            })
        } else {
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
                const { link, status } = req?.body
                if (!link || !status) {
                    res.json({
                        error: true,
                        message: 'No existe name o comment en body'
                    })
                } else {
                    const create_comment = await models.findOneAndUpdate('videos', { _id: req.body._id }, { link: link, status: status ? status : 'active' }, { new: true })
                    if (create_comment.error) {
                        res.json({
                            error: true,
                            err: create_comment.error,
                            message: 'Ha ocurrido un error al actualizar el video'
                        })
                    } else {
                        res.json({
                            error: null,
                            message: 'Video actualizado',
                            data: create_comment.data
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log("updateVideo~ error:", error)
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función updateComment'
        });
    }
}


async function updateComment(req, res) {
    try {
        const admin = req.user.id
        if (!admin) {
            res.json({
                error: true,
                message: 'No existe token en request'
            })
        } else {
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
                const { name, comment, status } = req?.body
                if (!name || !comment) {
                    res.json({
                        error: true,
                        message: 'No existe name o comment en body'
                    })
                } else {
                    const create_comment = await models.findOneAndUpdate('comments', { _id: req.body._id }, { name: name, comment: comment, status: status ? status : 'active' }, { new: true })
                    if (create_comment.error) {
                        res.json({
                            error: true,
                            err: create_comment.error,
                            message: 'Ha ocurrido un error al actualizar el comentario'
                        })
                    } else {
                        res.json({
                            error: null,
                            message: 'Comentario actualizado',
                            data: create_comment.data
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log("updateComment ~ error:", error)
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función updateComment'
        });
    }
}

async function getVideos(req, res) {
    try {
        const get_videos = await models.find('videos', { status: 'active' })
        if (get_videos.error) {
            res.json({
                error: true,
                err: get_videos.error,
                message: 'Ha ocurrido un error al consultar los videos'
            });
        } else if (!get_videos.data && !get_videos.error) {
            res.json({
                error: null,
                data: null,
                message: 'No existen videos guardados'
            });
        } else {
            res.json({
                error: null,
                data: get_videos.data,
                message: 'Videos encontrados'
            });
        }
    } catch (error) {
        console.log("getVideos ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función getVideos'
        });
    }
}

async function updateVideos(req, res) {
    try {
        const admin = req.user.id
        if (!admin) {
            res.json({
                error: true,
                message: 'No existe token en request'
            })
        } else {
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
                const { link, status } = req?.body
                if (!link || !status) {
                    res.json({
                        error: true,
                        message: 'No existe name o comment en body'
                    })
                } else {
                    const create_comment = await models.findOneAndUpdate('videos', { _id: req.body._id }, { link: link, status: status ? status : 'active' }, { new: true })
                    if (create_comment.error) {
                        res.json({
                            error: true,
                            err: create_comment.error,
                            message: 'Ha ocurrido un error al actualizar el video'
                        })
                    } else {
                        res.json({
                            error: null,
                            message: 'Video actualizado',
                            data: create_comment.data
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log("updateVideos ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función updateVideos'
        });
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

async function deleteImg(req, res) {
    try {
        const get_images = await models.remove('gallery', { _id: req.body.img })
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
                message: 'Imagen eliminada'
            })
        }
    } catch (error) {
        console.log("🚀 ~ deleteImg ~ error:", error)
        res.json({
            error: true,
            message: 'Ha ocurrido un error en la función deleteImg',
            err: error
        });
    }
}



module.exports = {
    render: {

    },
    get: {
        getUsers,
        getUser,
        getAllRoutes,
        getComments,
        getVideos,
        getAllGallery
    },
    post: {
        createUser,
        updateUser,
        deleteUser,
        seeReservasClient,
        seePrereservasClient,
        confirmPrebook,
        addImagesGallery,
        createComment,
        addImageComment,
        createVideo,
        updateComment,
        updateVideos,
        videosUpdate,
        deleteImg
    },
};
