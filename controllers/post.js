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
async function createPost(req, res) {
    try {
        const admin = req.user.id;
        const body = req.body;
        if (!admin && !body) {
            res.json({
                error: true,
                data: null,
                message: "No existe admin ni body"
            });
        } else {
            const result_admin = await models.findOne('users', { _id: admin, status: 'active', deleted: false })
            if (result_admin.error) {
                console.log("🚀 ~ file: post.js:25 ~ createPost ~ result_admin.error:", result_admin.error)
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
                let data = {
                    title: body.title ? body.title : null,
                    descripcion: body.descripcion ? body.descripcion : null,
                    links: body.links ? body.links : null,
                    image_p: body.image_p ? body.image_p : null,
                    images: body.images ? body.images : null,
                    status: 'active',
                    type: body.type ? body.type : null,
                }
                let create_post = await models.newDocument('post', data);
                if (create_post.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al crear el post'
                    });
                } else {
                    res.json({
                        error: null,
                        data: create_post.data,
                        message: 'Post creado correctamente'
                    });
                }
            }
        }

    } catch (error) {
        console.log("createPost ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: "Ha ocurrido un error en la función createPost"
        });
    }
}

async function getAllPost(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (admin) {
            const result_admin = await models.findOne('users', { _id: admin }, { status: 'active', deleted: false })
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
                const result_post = await models.findLean('post', {});
                if (result_post.result_post) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar los post'
                    });
                } else if (!result_post.error && !result_post.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No existen post'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_post.data,
                        message: 'Posts encontrados correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log("getAllPost ~ error:", error)
        res.json({
            error: true,
            err: error,
            message: "Ha ocurrido un error en la función getAllPost"
        });
    }
}

async function getPost(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (!admin && !body) {
            res.json({
                error: true,
                data: null,
                message: "No existe admin ni body"
            });
        } else {
            const id_post = req.body.post
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
                const result_post = await models.findOne('post', { _id: id_post })
                if (result_post.error) {
                    res.json({
                        error: true,
                        data: null,
                        message: 'Ha ocurrido un error al consultar el post'
                    });
                } else if (!result_post.error && !result_post.result_post) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron post'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_post.data,
                        message: 'Post encontrado correctamente'
                    });
                }
            }
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

async function updatePost(req, res) {
    try {
        const admin = req.user.id
        const body = req.body
        if (!admin && !body) {
            res.json({
                error: true,
                data: null,
                message: "No existe admin ni body"
            });
        } else {
            const id_post = req.body.post
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
                const result_post = await models.findOne('post', { _id: id_post });
                if (result_post.error) {
                    res.json({
                        error: true,
                        err: result_post.error,
                        data: null,
                        message: 'Ha ocurrido un error al consultar el post'
                    });
                } else if (!result_post.error && !result_post.data) {
                    res.json({
                        error: null,
                        data: null,
                        message: 'No se encontraron posts'
                    });
                } else {
                    const old_post = result_post.data
                    let data = {
                        title: body.title ? body.title : old_post.title,
                        descripcion: body.descripcion ? body.descripcion : old_post.descripcion,
                        links: body.links ? body.links : old_post.links,
                        image_p: body.image_p ? body.image_p : old_post.image_p,
                        images: body.images ? body.images : old_post.images,
                        status: body.status ? body.status : old_post.status,
                        type: body.type ? body.type : old_post.type,
                    }
                    let update_result = await models.findOneAndUpdate('post', { _id: id_post }, data, { new: true })
                    if (update_result.error) {
                        res.json({
                            error: true,
                            data: null,
                            message: 'Ha ocurrido un error al actualizar el post'
                        })
                    } else {
                        res.json({
                            error: null,
                            data: update_result.data,
                            message: 'El post se ha actualizado correctamente'
                        })
                    }
                }

            }
        }

    } catch (error) {
        console.log("updatePost ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función updatePost'
        })

    }
}

async function deletePost(req, res) {
    try {
        const admin = req.user.id
        const id_post = req.body.post
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
                const result_post = await models.findOneAndUpdate('post', { _id: id_post }, { status: 'inactive', deleted: true }, { new: true })
                if (result_post.error) {
                    console.log("deleteUser error:", result_post.error)
                    res.json({
                        error: true,
                        err: result_post.error,
                        data: null,
                        message: 'Ha ocurrido un error al actualizar el post'
                    });
                } else {
                    res.json({
                        error: null,
                        data: result_post.data,
                        message: 'Post eliminado correctamente'
                    });
                }
            }
        }
    } catch (error) {
        console.log("deletePost ~ error:", error);
        res.json({
            error: true,
            err: error,
            message: 'Ha ocurrido un error en la función deletePost'
        });


    }
}

module.exports = {
    get: {
        getAllPost,
        getPost
    },
    post: {
        createPost,
        updatePost,
        deletePost
    },
};
