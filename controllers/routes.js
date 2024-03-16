// =============================================================================
// PACKAGES
// =============================================================================

// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
const utils = require("../helpers/utils")
// =============================================================================
// REST FUNCTIONS
// =============================================================================

async function createNewRoute(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (!admin || !body) {
            res.json({
                error: true,
                data: null,
                message: 'No existe body o token en request'
            });
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
                let images = []

                let data = {
                    title: body.title ? body.title : null,
                    description: body.description ? body.description : null,
                    km: body.km ? body.km : null,
                    location: body.location ? body.location : null,
                    dates: body.dates ? body.dates : [],
                    quantity_persons: body.quantity_persons ? body.quantity_persons : null,
                    // images: body.images ? body.images : null,
                    level: body.level ? body.level : null,
                    // price: body.price ? body.price : null,
                    packages: body.packages ? body.packages : [],
                    status: 'active',
                    date_end: new Date,
                    includes: body.includes ? body.includes : [],
                    quota_status: "Disponible",
                    preview_description: body.preview_description ? body.preview_description : null,
                    prebook: body.prebook ? body.prebook : false,
                    percentage_prebook: body.percentage_prebook ? body.percentage_prebook : 0,
                    category: body.category ? body.category : null
                }
                const create_result = await models.newDocument('routes', data);
                if (create_result.error) {
                    console.log("createNewRoute create_result error", create_result.error)
                    res.json({
                        error: true,
                        err: create_result.error,
                        data: null,
                        message: 'Ha ocurrido un error al crear la ruta'
                    })
                } else {
                    res.json({
                        error: null,
                        data: create_result.data,
                        message: 'La ruta se ha creado correctamente'
                    })
                }
            }
        }
    } catch (error) {
        console.log("createNewRoute ~ error:", error)
        res.json({
            error: true,
            data: null,
            err: error,
            message: 'Ha ocurrido un error en la función createNewRoute'
        });
    }
}

async function getAllPrebook(req, res) {
    try {
        const result_routes = await models.findLean('routes', { prebook: true })
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
                data: result_routes.data,
                message: 'Rutas encontradas correctamente'
            });
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
async function getAllRoutes(req, res) {
    try {
        const result_routes = await models.findLean('routes', { status: 'active', "deleted": { $ne: true }})
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

async function getRoute(req, res) {
    try {
        const id_route = req.body.route
        const result_routes = await models.findOne('routes', { _id: id_route })
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
                data: result_routes.data,
                message: 'Ruta encontrada correctamente'
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

async function updateRoute(req, res) {
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
                const route = req.body.route
                let result_route = await models.findOne('routes', { _id: route })
                if (result_route.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar la ruta'
                    });
                } else if (!result_route.error && !result_route.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'La ruta con ese id no existe'
                    });
                } else {
                    const body = req.body
                    const old_route = result_route.data
                    let data_update = {
                        title: body.title ? body.title : old_route.title,
                        description: body.description ? body.description : old_route.description,
                        km: body.km ? body.km : old_route.km,
                        location: body.location ? body.location : old_route.location,
                        dates: body.dates ? body.dates : old_route.dates,
                        quantity_persons: body.quantity_persons ? body.quantity_persons : old_route.quantity_persons,
                        images: body.images ? body.images : old_route.images,
                        level: body.level ? body.level : old_route.level,
                        packages: body.packages ? body.packages : old_route.packages,
                        status: body.status ? body.status : old_route.status,
                        date_end: body.date_end ? body.date_end : old_route.date_end,
                        includes: body.includes ? body.includes : old_route.includes,
                        preview_description: body.preview_description ? body.preview_description : old_route.preview_description,
                        prebook: body.prebook ? body.prebook : false,
                        percentage_prebook: body.percentage_prebook ? body.percentage_prebook : 0,
                        category: body.category ? body.category : null
                    }
                    let update_route = await models.findOneAndUpdate('routes', { _id: route }, data_update, { new: true })
                    if (update_route.error) {
                        res.json({
                            error: true,
                            data: null,
                            message: 'Ha ocurrido un error al actualizar la ruta'
                        });
                    } else {
                        res.json({
                            error: null,
                            data: update_route.data,
                            message: 'ruta actualizada exitosamente'
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.log("updateOneRoute ~ error:", error)
        res.json({
            error: true,
            data: null,
            err: error,
            message: 'Ha ocurrido un error en la función updateOneRoute'
        });
    }
}

async function deleteRoute(req, res) {
    try {
        const admin = req.user.id
        const id_route = req.body.route
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
                let result_route = await models.findOneAndUpdate('routes', { _id: id_route }, { status: 'inactive', deleted: true }, { new: true })
                if (result_route.error) {
                    console.log("deleteRoute error:", result_route.error)
                    res.json({
                        error: true,
                        err: result_route.error,
                        data: null,
                        message: 'Ha ocurrido un error al actualizar la ruta'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_route.data,
                        message: 'ruta eliminada correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log("deleteRoute ~ error:", error)
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error al inactivar la ruta'
        })

    }
}

async function addImagesRoute(req, res) {
    try {
        const admin = req.user.id
        const images = req.files
        const body = req.body
        if (!admin || !images || !body) {
            res.json({
                error: true,
                message: 'No existe token, images o body'
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
                let all_images = []
                for (const image of images) {
                    let add_pic = await utils.uploadImage(image, "img_route_");
                    all_images.push(add_pic['images[]'])
                }
                if (all_images.length === images.length) {
                    const update_route = await models.findOneAndUpdate('routes', { _id: body.id_route }, { $push: { images: { $each: all_images } } }, { new: true })
                    if (update_route.error) {
                        res.json({
                            error: true,
                            err: update_route.error,
                            message: 'Ha ocurrido un error al actualizar la ruta'
                        })
                    } else if (!update_route.error && !update_route.data) {
                        res.json({
                            erro: null,
                            data: null,
                            message: 'No existe la ruta'
                        })
                    } else {
                        res.json({
                            error: null,
                            data: update_route.data,
                            message: 'Imagenes agregadas a la ruta'
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log("addImagesRoute error:", error)

    }
}




module.exports = {
    get: {
        getAllRoutes,
        getRoute,
        getAllPrebook
    },
    post: {
        createNewRoute,
        deleteRoute,
        updateRoute,
        addImagesRoute
    }
}