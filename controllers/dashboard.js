// =============================================================================
// PACKAGES
// =============================================================================

// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
// =============================================================================
// REST FUNCTIONS
// =============================================================================

async function getRecentRoutes(req, res) {
    try {
        const result_routes = await models.findLean('routes')
        if (result_routes.error) {
            res.json({
                error: true,
                data: null,
                message: 'Ha ocurrido un error al consultar las rutas'
            });
        } else if (!result_routes.error && !result_routes.data) {
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
    } catch (error) {
        console.log("getRecentRoutes ~ error:", error);
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
      }else if (ocupacion === 0) {
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
  
async function createPreBookedNewUser(req, res) {
    try {
        const body = req.body
        if (!body) {
            res.json({
                error: true,
                message: 'El body no existe en el request'
            });
        } else {
            const email_client = body.email;
            const document_client = body.document;
            const route_id = body.route_id;
            if (email_client && document_client) {
                const client_result = await models.findOne('clients', { $or: [{ "document": document_client }, { "email": email_client }] })
                if (client_result.error) {
                    res.json({
                        error: true,
                        message: 'Ha ocurrido al consultar el cliente por el email',
                        data: { email: email_client }
                    });
                } else if (!client_result.error && client_result.data) {
                    res.json({
                        error: true,
                        data: client_result.data,
                        message: 'El cliente ya está registrado'
                    });
                } else {
                    let data = {
                        document: body.document ? body.document : null,
                        type_document: body.type_document ? body.type_document : null,
                        first_name: body.first_name ? body.first_name : null,
                        last_name: body.last_name ? body.last_name : null,
                        phone_number: body.phone_number ? body.phone_number : null,
                        email: body.email ? body.email : null,
                        rh: body.rh ? body.rh : null,
                        eps: body.eps ? body.eps : null,
                        status: 'active',
                    }
                    const create_result = await models.newDocument('clients', data);
                    if (create_result.error) {
                        res.json({
                            error: true,
                            data: null,
                            message: 'Ha ocurrido un error al crear el cliente'
                        })
                    } else {
                        const client_result = create_result.data
                        const update_prebooked_assistants = await models.findOneAndUpdate('routes', { _id: route_id }, { $addToSet: { "prebooked_assistants": { client: client_result._id } } }, { new: true })
                        if (update_prebooked_assistants.error) {
                            res.json({
                                error: true,
                                err: update_prebooked_assistants.error,
                                message: 'Ha ocurrido un error al actualizar la ruta con el cliente'
                            });
                        } else if (!update_prebooked_assistants.error && !update_prebooked_assistants.data) {
                            res.json({
                                error: null,
                                data: null,
                                message: 'No existe la ruta'
                            })
                        } else {
                            res.json({
                                error: null,
                                data: create_result.data,
                                message: 'La pre-reserva se ha creado correctamente'
                            })
                        }

                    }
                }
            }
        }
    } catch (error) {
        console.log("createPreBooked ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función createPreBooked'
        });
    }
}

async function createPreBookedOldUser(req, res) {
    try {
        const body = req.body
        if (!body) {
            res.json({
                error: true,
                message: 'El body no existe en el request'
            });
        } else {
            console.log(body)
            const email_client = body.client.email;
            const document_client = body.client.document
            const route_id = body.route_id;
            if (email_client && document_client) {
                const find_client = await models.findOne('clients', { "document": document_client, "email": email_client })
                if (find_client.error) {
                    res.json({
                        error: true,
                        message: 'Ha ocurrido al consultar el cliente por el email',
                        data: { email: email_client }
                    })
                } else if (!find_client.error && !find_client.data) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'El cliente no existe con ese correo y documento'
                    })
                } else {
                    const client_result = find_client.data
                    const booking = {
                        package: body?.package,
                        client: client_result._id
                    }
                    const update_prebooked_assistants = await models.findOneAndUpdate('routes', { _id: route_id }, { $addToSet: { "prebooked_assistants": booking } }, { new: true })
                    if (update_prebooked_assistants.error) {
                        res.json({
                            error: true,
                            err: update_prebooked_assistants.error,
                            message: 'Ha ocurrido un error al actualizar la ruta con el cliente'
                        });
                    } else if (!update_prebooked_assistants.error && !update_prebooked_assistants.data) {
                        res.json({
                            error: null,
                            data: null,
                            message: 'No existe la ruta'
                        })
                    } else {
                        res.json({
                            error: null,
                            data: update_prebooked_assistants.data,
                            message: 'La pre-reserva se ha creado correctamente'
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log("createPreBookedOldUser ~ error:", error);
    }
}

async function validateClient(req, res) {
    try {
        const body = req.body
        if (!body) {
            res.json({
                error: true,
                message: 'No existe body en el request'
            });
        } else {
            const { email, document } = body
            const find_client = await models.findOne('clients', { email: email, document: document })
            if (find_client.error) {
                res.json({
                    error: true,
                    message: 'Ha ocurrido al consultar el cliente',
                })
            } else if (!find_client.error && !find_client.data) {
                res.json({
                    error: true,
                    data: null,
                    message: 'El cliente no existe con ese correo y documento'
                })
            } else {
                const valide_date_route = await models.findOne('routes', { _id: route_id})
                const route_id = body.route_id
                let client_existent = await models.findOne('routes', { _id: route_id, 'assistants.client': find_client.data._id, 'assistants.is_prebook': false })
                if (client_existent.data && !client_existent.error) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'Ya tienes una reserva activa'
                    })
                } else {
                    let have_preebook = false
                    let find_client_route = null
                    let client_prebook_nopay = null
                    let have_prebook_nopay = false
                    if (route_id) {

                        find_client_route = await models.findOne('routes', { _id: route_id, 'assistants.client': find_client.data._id, 'assistants.is_prebook': true });
                        if (find_client_route.data && !find_client_route.error) {
                            have_preebook = true
                        } else {
                            client_prebook_nopay = await models.findOne('routes', { _id: route_id, 'prebooked_assistants.client': find_client.data._id });
                            if (client_prebook_nopay.data && !client_prebook_nopay.error) {
                                have_prebook_nopay = true
                            }
                        }


                    }
                    res.json({
                        error: null,
                        data: {
                            email: email,
                            name: find_client.data.first_name + ' ' + find_client.data.last_name,
                            document: document,
                            prebook: have_preebook ? true : null,
                            percentage: have_preebook ? find_client_route.data.percentage_prebook : null,
                            nopay: have_prebook_nopay ? true : null,
                            message: have_prebook_nopay ? 'No puedes continuar sin la confirmación de pago de la pre-reserva' : null
                        },
                        message: find_client_route?.error ? 'Ha ocurrido un error al consultar si el cliente tiene pre-reservas' : 'Cliente encontrado correctamente'
                    })
                }

            }
        }

    } catch (error) {
        console.log("validateClient ~ error:", error)

    }

}


async function getAllComments(req, res) {
    try {
        const find_comments = await models.find('Comments')
        if (find_comments.error) {
            res.json({
                error: true,
                err: find_comments.error,
                message: 'Ha ocurrido un error al consultar los comentarios'
            });
        } else if (!find_comments.data && !find_comments.error) {
            res.json({
                error: null,
                data: null,
                message: 'No existen comentarios'
            });
        } else {
            res.json({
                error: null,
                data: find_comments.data,
                message: 'Comentarios encontrados'
            });
        }
    } catch (error) {
        console.log("getAllComments ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función getAllComments'
        });
    }
}

async function getVideos(req, res) {
    try {
        const get_videos = await models.find('Videos')
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



module.exports = {
    get: {
        getRecentRoutes,
        getAllComments,
        getVideos
    },
    post: {
        createPreBookedNewUser,
        createPreBookedOldUser,
        validateClient
    }
}