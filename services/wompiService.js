const axios = require('axios');
const models = require("../helpers/models");
// const { Operaciones, FuentesPago, trm } = require('../models');
const { WOMPI_PUB, WOMPI_URL, WOMPI_PIV, WOMPI_PROD_URL, WOMPI_PROD_PUB, WOMPI_PROD_PIV } = process.env;
const trmcol = require('trmcol');
const moment = require('moment');

async function statusTransaccion(transaccion_id, test, defaulter) {
    // console.log('deleted', deleted)
    try {
        let query = transaccion_id.id ? { "client_id": transaccion_id.client_id, "operations_wompi.data_transaccion.id": transaccion_id.id } :
            transaccion_id.referencia ? { "client_id": transaccion_id.client_id, "operations_wompi.referencia": transaccion_id.referencia } : "n/a";
        let pub_key = test == true ? WOMPI_PUB : WOMPI_PROD_PUB
        let url = test == true ? WOMPI_URL + "/transactions/" : WOMPI_PROD_URL + "/transactions/"
        let authHeader = 'Bearer ' + pub_key
        if (query == "n/a") {
            console.log({
                error: true,
                err: "faltan parametros para consultar en statusTransaccion"
            });
        } else {
            const find_operation = await models.findOne('operations', query);
            if (find_operation.error) {
                console.log({
                    error: true,
                    err: find_operation.error,
                    message: 'Ha ocurrido un error al consultar la operación in statusTransaccion'
                });
            } else if (!find_operation.error && !find_operation.data) {
                console.log({
                    error: true,
                    err: {
                        data: find_operation,
                        query: query
                    },
                    message: 'Client operation not found in statusTransaccion',
                });
            } else {
                const operacion = find_operation.data
                let type = transaccion_id.id ? 'id' : transaccion_id.referencia ? 'referencia' : 'n/a'
                if (type !== 'n/a') {
                    let operation = null
                    let all_operations = operacion.operations_wompi
                    if (type === 'id') {
                        operation = all_operations.filter(op => op.data_transaccion.id === transaccion_id.id);
                    } else if (type === 'referencia') {
                        operation = all_operations.filter(op => op.referencia === transaccion_id.referencia);
                    }
                    if (operation?.length > 0) {
                        operation = operation[0]
                        axios.get(url + operation.data_transaccion.id, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': authHeader
                            }
                        })
                            .then(async response => {
                                const update_operation = await models.findOneAndUpdate('operations', query, { "operations_wompi.$.data_transaccion.status": response.data.data.status, "operations_wompi.$.status_wompi": response.data.data.status })
                                if (update_operation.error) {
                                    console.log({
                                        error: true,
                                        err: update_operation.error,
                                        message: 'Ha ocurrido un error al consultar la wallet in statusTransaccion'
                                    });
                                } else if (!update_operation.error && !update_operation.data) {
                                    console.log({
                                        error: true,
                                        err: {
                                            message: 'Company wallet not found in statusTransaccion',
                                            data: update_operation,
                                            query: query
                                        }
                                    });
                                } else {
                                    let all_operations = update_operation.data.operations_wompi
                                    let result = null
                                    if (type === 'id') {
                                        result = all_operations.find(op => op.data_transaccion.id === transaccion_id.id);
                                    } else if (type === 'referencia') {
                                        result = all_operations.find(op => op.referencia === transaccion_id.referencia);
                                    }
                                    if (result !== null && result !== undefined) {
                                        if (result.data_transaccion.status === 'PENDING') {
                                            // console.log('pending')
                                            ///Mientras el status de la transacción sea PENDING, se repite la función
                                            await statusTransaccion(transaccion_id, test, defaulter)
                                        } else if (result.data_transaccion.status === 'DECLINED') {
                                            // console.log('DECLINED')
                                            if (defaulter === true) {
                                                await planDeclined(transaccion_id)
                                            } else {
                                                const update_company = await models.findOneAndUpdate('companies', { _id: transaccion_id.company_id }, { defaulter: true })
                                            }
                                        } else if (result.data_transaccion.status === 'APPROVED') {
                                            console.log('DECLINED forced ( approved )')
                                            await activePlan(transaccion_id)
                                            // if (defaulter === true) {
                                            //   await planDeclined(transaccion_id)
                                            // } else {
                                            //   const update_company = await models.findOneAndUpdate('companies', { _id: transaccion_id.company_id }, { defaulter: true }, { new: true });
                                            //   console.log("update_company:", update_company);
                                            // }
                                        }
                                    }
                                }
                            })
                            .catch(error => {
                                console.log({
                                    error: true,
                                    err: error,
                                    message: 'statusTransaccion request transactions error'
                                })
                            });
                    }
                } else {
                    resolve({
                        error: true,
                        err: 'no existen id o referencia'
                    })
                }
            }
        }
    } catch (error) {
        console.log("statusTransaccion ~ error:", error)
        reject(error)
    }
}

async function activePlan(data) {
    try {
        const { company_id, wallet_id, plan } = data
        const update_wallet = await models.findOneAndUpdate('wallet_companies', { _id: wallet_id }, { $inc: { tokens: plan.credits_plan } })
        if (update_wallet.error) {
            console.log({
                error: true,
                err: update_wallet.error,
                message: 'Ha ocurrido un error al actualizar la wallet'
            })
        } else if (!update_wallet.error && !update_wallet.data) {
            console.log({
                error: null,
                data: null,
                message: 'No existe wallet con ese id'
            });
        } else {
            const wallet = update_wallet.data
            const renovation = plan.renovation
            let future_renovation
            if (renovation === 'Mensual') {
                future_renovation = moment().add(1, 'M').format();
            } else if (renovation === 'Trimestral') {
                future_renovation = moment().add(3, 'M').format();
            } else {
                future_renovation = 'n/a'
            }
            const update_company = await models.findOneAndUpdate('companies', { _id: company_id }, { plan: plan._id, plan_renovation: future_renovation }, { new: true })
            if (update_company.error) {
                console.log({
                    error: true,
                    err: update_company.error,
                    message: 'Ha ocurrido un error al actualizar la empresa'
                })
            } else if (!update_company.error && !update_company.data) {
                console.log({
                    error: null,
                    data: null,
                    message: 'No existe compañia con ese id'
                });
            } else {
                console.log({
                    error: null,
                    data: update_company.data,
                    message: 'Renovación de plan activada'
                });
            }
        }
    } catch (error) {
        console.log("activePlan ~ error:", error);
    }
}

async function planDeclined(data) {
    try {
        const { company_id, wallet_id, plan, payment_source_id } = data
        const cancel_plan = await models.findOneAndUpdate('companies', { _id: company_id }, { "defaulter": true, "plan_renovation": null }, { new: true })
        if (cancel_plan.error) {
            console.log({
                error: true,
                err: cancel_plan.error,
                message: 'Ha ocurrido un error al actualizar la empresa morosa por transacción rechazada',
                query: { _id: company_id }
            })
        } else if (!cancel_plan.error && !cancel_plan.data) {
            console.log({
                error: null,
                data: null,
                message: 'No existe la empresa asociada al id'
            });
        } else {
            const update_payment_method = await models.findOneAndUpdate('wallet_companies', { _id: wallet_id, "payment_sources_wompi.fuente_id": Number(payment_source_id) }, { "payment_sources_wompi.$.status": 'DEFAULTER' })
            if (update_payment_method.error) {
                console.log({
                    error: true,
                    err: update_payment_method.error,
                    message: 'Ha ocurrido un error al marcar la fuente de pago como morosa'
                });
            } else if (!update_payment_method.error && !update_payment_method.data) {
                console.log({
                    error: null,
                    data: null,
                    message: 'No se encontró la fuente de pago morosa'
                });
            } else {
                const notification = {
                    type: 'alert',
                    texto: 'Tu plan y método de pago han sido desactivados por incumplimiento en el pago de tu plan, verifica o cambia tus métodos de pago',
                    link: 'n/a',
                    talent_id: null,
                    date: new Date(),
                    is_read: false
                }
                const create_notification = await models.findOneAndUpdate('notifications_companies', { company_id: company_id }, { $push: { notification: notification } }, { upsert: true, new: true });
                if (create_notification.error) {
                    console.log({
                        error: true,
                        err: create_notification.error,
                        message: 'Ha ocurrido un error al crear la notificacion para empresa'
                    });
                } else if (!create_notification.error && !create_notification.data) {
                    console.log({
                        error: null,
                        date: null,
                        message: 'No fue posible crear la notifiación'
                    });
                } else {
                    console.log({
                        error: null,
                        data: create_notification.data,
                        message: 'Notifiación creada'
                    });
                }
            }
        }
    } catch (error) {
        console.log("planDeclined ~ error:", error)

    }
}


async function createNotificationForCompanies(company_id, type, texto, link, talent_id) {
    try {
        // const notificationData = {
        //   company_id: company_id,
        //   notification: [{
        //     type: type,
        //     texto: texto,
        //     link: link,
        //     talent_id: talent_id ? talent_id : null,
        //     date: new Date(),
        //     is_read: false
        //   }]
        // };
        const notification = {
            type: type,
            texto: texto,
            link: link,
            talent_id: talent_id ? talent_id : null,
            date: new Date(),
            is_read: false
        }
        const create_notification = await models.findOneAndUpdate('notifications_companies', { company_id: company_id }, { $push: { notification: notification } }, { upsert: true, new: true })
        if (create_notification.error) {
            console.log({
                error: true,
                err: create_notification.error,
                message: 'Ha ocurrido un error al crear la notificacion para empresa'
            });
        } else if (!create_notification.error && !create_notification.data) {
            console.log({
                error: null,
                date: null,
                message: 'No fue posible crear la notifiación'
            });
        } else {
            console.log({
                error: null,
                data: create_notification.data,
                message: 'Notifiación creada'
            });
        }

        // const find_company = await models.findOne('notifications_companies', { company_id: company_id });
        // if (!find_company.error && find_company.data !== null) {
        //   const update_company = await models.findOneAndUpdate('notifications_companies', { company_id: company_id }, { $push: { notification: notificationData.notification[0] } }, { new: true });
        //   return update_company?.data;
        // } else if (!find_company.error && !find_company.data) {
        //   const create_notification = await models.newDocument("notifications_companies", notificationData);
        //   return create_notification?.data;
        // }
    } catch (error) {
        console.log("createNotificationForCompanies ~ error:", error);
        return error;
    }

}




module.exports = {

    async getTienda(test) {
        // console.log('deleted', deleted)
        return new Promise(function (resolve, reject) {
            try {
                let url = test == true ? WOMPI_URL + "/merchants/" + WOMPI_PUB : WOMPI_PROD_URL + "/merchants/" + WOMPI_PROD_PUB
                axios.get(url)
                    .then(response => {
                        resolve(response.data)
                    })
                    .catch(error => {
                        resolve(error)
                    });
            } catch (error) {
                reject(error)
            }
        });

    },


    async getTRM(date) {
        // console.log('deleted', deleted)
        return new Promise(async function (resolve, reject) {
            try {
                let fechaHoy = moment().startOf('day');
                let ultimoDocumento = await trm.findOne({ createdAt: { $gte: fechaHoy } }).sort({ createdAt: -1 }).lean();
                if (ultimoDocumento) {
                    resolve({ value: ultimoDocumento.value, value_30: ultimoDocumento.value_30 })
                } else {
                    trmcol.query(moment().format("YYYY-MM-DD"))
                        .then(async trm_data => {
                            let map_trm = {
                                value: trm_data.value,
                                value_30: Number(trm_data.value) + 15, //ajuste de precio segun chuy 
                            }
                            let new_operation = await trm.create(map_trm)
                            resolve(map_trm);
                        }).catch(err => resolve(err))
                }


            } catch (error) {
                reject([error])
            }
        });

    },

    async getCCToken(payload) {
        // console.log('deleted', deleted)
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                let url = test_flag === true ? WOMPI_URL + '/tokens/cards' : WOMPI_PROD_URL + '/tokens/cards';
                let pub_key = test_flag === true ? WOMPI_PUB : WOMPI_PROD_PUB
                let authHeader = 'Bearer ' + pub_key
                // Definir los datos de la tarjeta de prueba
                const cardData = {
                    number: payload.number,
                    exp_month: payload.exp_month,
                    exp_year: payload.exp_year,
                    cvc: payload.cvc,
                    card_holder: payload.card_holder,
                };
                axios.post(url, cardData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                })
                    .then(response => {
                        resolve(response.data);
                    })
                    .catch(error => {
                        resolve(error.response.data);
                    });
            } catch (error) {
                console.log('error: ', error);
                resolve(error);
            }
        });

    },

    async tokenizationNequi(payload) {
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                const url = test_flag === true ? WOMPI_URL + '/tokens/nequi' : WOMPI_PROD_URL + '/tokens/nequi';
                const pub_key = test_flag === true ? WOMPI_PUB : WOMPI_PROD_PUB
                const authHeader = 'Bearer ' + pub_key
                axios.post(url, { phone_number: payload.phone_number }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                }).then(response => {
                    resolve({
                        error: null,
                        data: response.data.data
                    })
                }).catch(error => {
                    resolve({
                        error: true,
                        err: error
                    })
                })
            } catch (error) {
                console.log("tokenizationNequi ~ error:", error);
                resolve({
                    error: true,
                    err: error
                });
            }
        })

    },

    async checkStatusNequi(payload) {
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                const url = test_flag === true ? WOMPI_URL + '/tokens/nequi/' + payload.token : WOMPI_PROD_URL + '/tokens/nequi/' + payload.token;
                const pub_key = test_flag === true ? WOMPI_PUB : WOMPI_PROD_PUB
                const authHeader = 'Bearer ' + pub_key
                axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                }).then(response => {
                    resolve({
                        error: null,
                        data: response.data.data
                    });

                }).catch(error => {
                    resolve({
                        error: true,
                        err: error
                    })
                })
            } catch (error) {
                console.log("checkStatusNequi ~ error:", error);
                resolve({
                    error: true,
                    err: error
                });
            }
        })
    },

    async makeFuentePagoNequi(payload) {
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true || payload.test === "true" ? true : false) : false
                let url = test_flag === true ? WOMPI_URL + '/payment_sources' : WOMPI_PROD_URL + '/payment_sources';
                let pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV
                let authHeader = 'Bearer ' + pub_key
                const nequiData = {
                    type: 'NEQUI',
                    token: payload.token,
                    customer_email: payload.customer_email,
                    acceptance_token: payload.acceptance_token,
                };
                axios.post(url, nequiData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                })
                    .then(async response => {
                        let data = response.data.data
                        let data_db = {
                            "fuente_id": data.id,
                            "nequi_data": {
                                "type": data.public_data.phone_number,
                                "phone_number": data.public_data.phone_number,
                            },
                            "type": data.type,
                            "status": data.status,
                            "app_id": payload.app_id,
                            "customer_email": data.customer_email,
                        }
                        const create_fuente_pago = await models.findOneAndUpdate('wallet_clients', { client_document: payload.client_document }, { $push: { payment_sources_wompi: data_db } }, { new: true, upsert: true })
                        if (create_fuente_pago.error) {
                            resolve({
                                error: true,
                                err: create_fuente_pago.error
                            });
                        } else if (!create_fuente_pago.error && !create_fuente_pago.data) {
                            resolve({
                                error: true,
                                err: {
                                    message: 'Client wallet not found',
                                    data: create_fuente_pago,
                                    query: { company: payload.company_id }
                                },
                            })
                        } else {
                            wallet = create_fuente_pago.data
                            resolve({
                                error: null,
                                data: data_db,
                            });
                        }
                    })
                    .catch(error => {
                        resolve({
                            error: true,
                            err: error
                        });
                    });
            } catch (error) {
                console.log("makeFuentePagonNequi ~ error:", error)
            }
        })
    },

    //solo para TDC por la api, la peticion es distinta para otros medios de pago
    async makePayment(payload) {
        // console.log('deleted', deleted)
        return new Promise(function (resolve, reject) {
            try {

                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                let url = test_flag === true ? WOMPI_URL + '/transactions' : WOMPI_PROD_URL + '/transactions';
                let pub_key = test_flag === true ? WOMPI_PUB : WOMPI_PROD_PUB
                let authHeader = 'Bearer ' + pub_key
                const cardData = {
                    amount_in_cents: Number(payload.amount_in_cents),
                    currency: 'COP', // HARDCODEADO PORQUE AUN NO PERMITE USD
                    reference: payload.reference,
                    customer_email: payload.customer_email,
                    payment_method: {
                        type: payload.payment_type,
                        token: payload.token,
                        installments: payload.cuotas,
                    },
                    acceptance_token: payload.acceptance_token,
                };
                axios.post(url, cardData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                })
                    .then(async response => {
                        let data_db = {
                            referencia: payload.reference,
                            data_transaccion: response.data.data,
                            status_wompi: response.data.status,
                            app_solicitante: payload.app_solicitante ? payload.app_solicitante : "s/a",
                            url_solicitante: payload.url_solicitante ? payload.url_solicitante : "s/a",
                            tipo_operacion: "pago",
                        }
                        // let new_operation = await Operaciones.create(data_db)
                        let update_wallet_operation = await models.findOneAndUpdate('wallet_companies', { company: payload.company_id }, { $push: { operations_wompi: data_db } }, { new: true })
                        // let fuente_pago = await FuentesPago.find({ fuente_id: payload.payment_source_id }).lean();
                        let track_ids = {
                            operation_id: update_wallet_operation.data,
                            // payment_id: fuente_pago[0]._id
                        }
                        resolve({ ...response.data, track_ids: track_ids });
                    })
                    .catch(error => {
                        resolve({
                            error: true,
                            err: error
                        });
                    });
            } catch (error) {
                resolve({
                    error: true,
                    err: error
                });
            }
        });

    },



    async getStatusTransaccion(transaccion_id, test) {
        // console.log('deleted', deleted)
        return new Promise(async function (resolve, reject) {
            try {
                let query = transaccion_id.id ? { "client_document": transaccion_id.client_document, "operations_wompi.data_transaccion.id": transaccion_id.id } :
                    transaccion_id.referencia ? { "client_document": transaccion_id.client_document, "operations_wompi.referencia": transaccion_id.referencia } : "n/a";
                let pub_key = test == true ? WOMPI_PUB : WOMPI_PROD_PUB
                let url = test == true ? WOMPI_URL + "/transactions/" : WOMPI_PROD_URL + "/transactions/"
                let authHeader = 'Bearer ' + pub_key
                if (query == "n/a") {
                    resolve({
                        error: true,
                        err: "faltan parametros para consultar"
                    });
                } else {
                    const find_operation = await models.findOne('wallet_clients', query);
                    if (find_operation.error) {
                        resolve({
                            error: true,
                            err: find_operation.error
                        });
                    } else if (!find_operation.error && !find_operation.data) {
                        resolve({
                            error: true,
                            err: {
                                message: 'Client wallet not found',
                                data: find_operation,
                                query: query
                            }
                        });
                    } else {
                        const operacion = find_operation.data
                        let type = transaccion_id.id ? 'id' : transaccion_id.referencia ? 'referencia' : 'n/a'
                        if (type !== 'n/a') {
                            let operation = null
                            let all_operations = operacion.operations_wompi
                            if (type === 'id') {
                                operation = all_operations.filter(op => op.data_transaccion.id === transaccion_id.id);
                            } else if (type === 'referencia') {
                                operation = all_operations.filter(op => op.referencia === transaccion_id.referencia);
                            }
                            if (operation?.length > 0) {
                                operation = operation[0]
                                axios.get(url + operation.data_transaccion.id, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': authHeader
                                    }
                                })
                                    .then(async response => {
                                        const update_operation = await models.findOneAndUpdate('wallet_clients', query, { "operations_wompi.$.data_transaccion.status": response.data.data.status, "operations_wompi.$.status_wompi": response.data.data.status })
                                        if (update_operation.error) {
                                            resolve({
                                                error: true,
                                                err: update_operation.error
                                            });
                                        } else if (!update_operation.error && !update_operation.data) {
                                            resolve({
                                                error: true,
                                                err: {
                                                    message: 'Client wallet not found',
                                                    data: update_operation,
                                                    query: query
                                                }
                                            });
                                        } else {
                                            let all_operations = update_operation.data.operations_wompi
                                            let result = null
                                            if (type === 'id') {
                                                result = all_operations.filter(op => op.data_transaccion.id === transaccion_id.id);
                                            } else if (type === 'referencia') {
                                                result = all_operations.filter(op => op.referencia === transaccion_id.referencia);
                                            }
                                            resolve({
                                                error: result?.length > 0 ? null : true,
                                                data: result?.length > 0 ? result[0] : null,
                                            });
                                        }
                                    })
                                    .catch(error => {
                                        console.log("getStatusTransaccion ~ error:", error)
                                        resolve({
                                            error: true,
                                            err: error
                                        })
                                    });
                            }
                        } else {
                            resolve({
                                error: true,
                                err: 'no existen id o referencia'
                            })
                        }
                    }
                }
            } catch (error) {
                console.log("getStatusTransaccion ~ error:", error)
                reject(error)
            }
        });

    },


    async makeFuentePago(payload) {
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true || payload.test === "true" ? true : false) : false
                let url = test_flag === true ? WOMPI_URL + '/payment_sources' : WOMPI_PROD_URL + '/payment_sources';
                let pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV
                let authHeader = 'Bearer ' + pub_key
                const cardData = {
                    type: payload.type,
                    token: payload.token, // HARDCODEADO PORQUE AUN NO PERMITE USD
                    customer_email: payload.customer_email,
                    acceptance_token: payload.acceptance_token,
                };
                axios.post(url, cardData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                })
                    .then(async response => {
                        let data = response.data.data
                        let data_db = {
                            "fuente_id": data.id,
                            "tdc_data": {
                                "last_four": data.public_data.last_four,
                                "brand": payload.brand,
                                "exp_month": data.public_data.exp_month,
                                "exp_year": data.public_data.exp_year,
                                "card_holder": data.public_data.card_holder,
                                "validity_ends_at": data.public_data.validity_ends_at,
                            },
                            "type": data.type,
                            "status": data.status,
                            "app_id": payload.app_id,
                            "customer_email": data.customer_email,
                            // "company_id": payload?.company_id
                        }
                        // await FuentesPago.create(data_db)
                        const create_fuente_pago = await models.findOneAndUpdate('wallet_clients', { client_document: payload.client_document }, { $push: { payment_sources_wompi: data_db } }, { new: true, upsert: true })
                        if (create_fuente_pago.error) {
                            resolve({
                                error: true,
                                err: create_fuente_pago.error
                            });
                        } else if (!create_fuente_pago.error && !create_fuente_pago.data) {
                            resolve({
                                error: true,
                                err: {
                                    message: 'Company wallet not found',
                                    data: create_fuente_pago,
                                    query: { company: payload.company_id }
                                },
                            })
                        } else {
                            // wallet = create_fuente_pago.data
                            // await models.findOneAndUpdate('clients', { document: payload.client_document }, { wallet: wallet._id }, { new: true })
                            resolve({
                                error: null,
                                data: data_db,
                            });
                        }
                    })
                    .catch(error => {
                        console.log("🚀 ~ file: wompiService.js:764 ~ error:", error)
                        resolve({
                            error: true,
                            err: error
                        });
                    });
            } catch (error) {
                console.log("🚀 ~ file: wompiService.js:770 ~ error:", error)
                resolve({
                    error: true,
                    err: error
                });
            }
        });
    },

    async makePaymentWhitNequi(payload) {
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                let url = test_flag === true ? WOMPI_URL + '/transactions' : WOMPI_PROD_URL + '/transactions';
                let pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV
                let authHeader = 'Bearer ' + pub_key
                let last_four = payload.company_id.substring(payload.company_id.length - 4)
                const nequi_data = {
                    "amount_in_cents": payload.amount_in_cents, // Monto current centavos
                    "currency": "COP", // Moneda
                    "customer_email": payload.customer_email, // Email del usuario
                    "reference": last_four + payload.reference, // Referencia única de pago
                    "payment_source_id": payload.payment_source_id, // ID de la fuente de pago
                    recurrent: true
                }
                axios.post(url, nequi_data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                }).then(async response => {
                    let data_db = {
                        referencia: last_four + payload.reference,
                        data_transaccion: response.data.data,
                        status_wompi: response.data.data.status,
                        app_solicitante: payload.app_solicitante ? payload.app_solicitante : "s/a",
                        url_solicitante: payload.url_solicitante ? payload.url_solicitante : "s/a",
                        fuente_pago: true,
                        plan: payload.plan
                    }
                    const update_wallet_operation = await models.findOneAndUpdate('wallet_companies', { company: payload.company_id }, { $push: { operations_wompi: data_db } }, { new: true });
                    if (update_wallet_operation.error) {
                        resolve({
                            error: true,
                            err: update_wallet_operation.error
                        });
                    } else if (!update_wallet_operation.error && !update_wallet_operation.data) {
                        resolve({
                            error: true,
                            err: {
                                message: 'Company wallet not found',
                                data: update_wallet_operation,
                                query: { company: payload.company_id }
                            }
                        });
                    } else {
                        resolve({
                            error: null,
                            data: response.data.data
                        });
                    }
                })
            } catch (error) {
                console.log("makePaymentWhitNequi ~ error:", error);
                resolve({
                    error: true,
                    err: error,
                })
            }
        })
    },

    async makePaymentWhitFuentePago(payload) {
        // console.log('deleted', deleted)
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                let url = test_flag === true ? WOMPI_URL + '/transactions' : WOMPI_PROD_URL + '/transactions';
                let pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV
                let authHeader = 'Bearer ' + pub_key
                const cardData = {
                    amount_in_cents: Number(payload.amount_in_cents),
                    currency: 'COP', // HARDCODEADO PORQUE AUN NO PERMITE USD
                    reference: payload.reference,
                    customer_email: payload.customer_email,
                    client_document: payload.client_document,
                    payment_method: {
                        // type: payload.payment_type,
                        // installments: payload.cuotas,
                        installments: 1,
                    },
                    payment_source_id: payload.payment_source_id,
                    recurrent: false
                };
                axios.post(url, cardData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                })
                    .then(async response => {
                        let data_db = {
                            referencia: payload.reference,
                            data_transaccion: response.data.data,
                            status_wompi: response.data.data.status,
                            fuente_pago: true,
                            route: payload.route
                        }
                        // let new_operation = await Operaciones.create(data_db);
                        const update_wallet_operation = await models.findOneAndUpdate('wallet_clients', { client_document: payload.client_document }, { $push: { operations_wompi: data_db } }, { new: true });
                        if (update_wallet_operation.error) {
                            resolve({
                                error: true,
                                err: update_wallet_operation.error
                            });
                        } else if (!update_wallet_operation.error && !update_wallet_operation.data) {
                            resolve({
                                error: true,
                                err: {
                                    message: 'Client wallet not found',
                                    data: update_wallet_operation,
                                    query: { company: payload.company_id }
                                }
                            });
                        } else {
                            resolve({
                                error: null,
                                data: response.data.data
                            });
                        }
                    })
                    .catch(error => {
                        resolve({ error: true, err: error });
                    });
            } catch (error) {
                console.log('error: ', error);
                resolve({ error: true, err: error });
            }
        });

    },

    async makeRefund(payload) {
        // console.log('deleted', deleted)
        return new Promise(function (resolve, reject) {
            try {
                let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                let url = test_flag === true ? WOMPI_URL + '/transactions/' + payload.transaction_id + '/void' : WOMPI_PROD_URL + '/transactions/' + payload.transaction_id + '/void';
                let pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV
                let authHeader = 'Bearer ' + pub_key
                const cardData = {
                    amount_in_cents: payload.amount_in_cents,
                };
                axios.post(url, cardData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                })
                    .then(async response => {
                        if (response.data.data?.type == "unprocessable") {
                        } else {
                            //GUARDAR  ESTO EN OPERACION???!!         
                            let data_db = {
                                referencia: payload.reason,
                                data_transaccion: response.data,
                                status_wompi: response.data.data.status,
                                app_solicitante: payload.app_solicitante ? payload.app_solicitante : "s/a",
                                url_solicitante: payload.url_solicitante ? payload.url_solicitante : "s/a",
                                tipo_operacion: "anulacion",
                            }
                            await Operaciones.create(data_db)
                        }
                        resolve(response.data);
                    })
                    .catch(error => {
                        resolve(error);
                    });
            } catch (error) {
                console.log('error: ', error);
                resolve(error);
            }
        });

    },
    async notifyEvent(evento) {

        return new Promise(async function (resolve, reject) {
            try {
                //TODO: HACER AQUI LA ADAPTACION
                let operacion = await Operaciones.findOneAndUpdate({ "data_transaccion.data.id": evento.id }, { "data_transaccion.data.status": evento.status, "status_wompi": evento.status }, { returnDocument: 'after' })
                if (operacion.url_solicitante) {
                    axios.post(operacion.url_solicitante, evento, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': authHeader
                        }
                    })
                        .then(response => {
                            resolve(response.data);
                        })
                        .catch(error => {
                            resolve(error.response);
                        });
                } else {
                    console.log("no existe a donde avisar!");
                }
            } catch (error) {
                resolve(error);
                //AQUI TOCA NOTIFICAR POR SLACK??:::
            }
        });
    },
    async getFuentePago(email) {
        return new Promise(async function (resolve, reject) {
            try {
                let fuente_pago = await FuentesPago.find({ customer_email: email }).lean();
                resolve(fuente_pago)
            } catch (error) {
                resolve(error);
                //AQUI TOCA NOTIFICAR POR SLACK??:::
            }
        });
    },
    async deletePaymentSource(payload) {
        return new Promise(async function (resolve, reject) {
            try {
                const find_company = await models.findOne('wallet_companies', { company: payload.company_id }, null)
                if (find_company.error) {
                    resolve({
                        error: true,
                        err: find_company.error
                    });
                } else if (!find_company.error && !find_company.data) {
                    resolve({
                        error: true,
                        err: {
                            message: 'Company wallet not found',
                            query: { company: payload.company_id }
                        }
                    });
                } else {
                    const wallet = find_company.data
                    let payment_sources = wallet.payment_sources_wompi
                    if (payment_sources?.length > 0) {
                        let filter = payment_sources.filter(payment => payment.fuente_id.toString() !== payload.fuente_id)
                        const update_wallet = await models.findOneAndUpdate('wallet_companies', { company: payload.company_id }, { payment_sources_wompi: filter?.length > 0 ? filter : [] }, { new: true })
                        if (update_wallet.error) {
                            resolve({
                                error: true,
                                err: update_wallet.error
                            });
                        } else if (!update_wallet.error && !update_wallet.data) {
                            resolve({
                                error: true,
                                err: {
                                    message: 'Company wallet not found',
                                    query: { company: payload.company_id }
                                }
                            });
                        } else {
                            resolve({
                                error: null,
                                data: update_wallet.data.payment_sources_wompi
                            });
                        }
                    }
                }
            } catch (error) {
                resolve({
                    error: true,
                    err: error
                })
                // console.log("deletePaymentSource error", error)
            }
        })
    },
    async renewPlanWithFuentePago(admin, payload) {
        return new Promise(async function (resolve, reject) {
            try {
                const find_admin = await models.findOne("user", { _id: admin, deleted: false, userType: "admin" });
                if (find_admin.error) {
                    resolve({
                        error: true,
                        err: find_admin.error,
                        data: null,
                        message: "Ha ocurrido un error al consultar el usuario admin",
                    });
                } else if (!find_admin.error && !find_admin.data) {
                    resolve({
                        error: null,
                        data: null,
                        message: "El usuario no existe o está deshabilidato",
                    });
                } else {
                    const find_company = await models.findById('companies', payload.company_id)
                    if (find_company.error) {
                        resolve({
                            error: true,
                            err: find_company.error,
                            message: "Ha ocurrido un error al consultar la compañia",
                        });
                    } else if (!find_company.error && !find_company.data) {
                        resolve({
                            error: null,
                            data: null,
                            message: "La compañia no existe",
                        });
                    } else {
                        const company = find_company.data
                        const wallet = company.wallet
                        if (wallet.operations_wompi?.length > 0) {
                            let operation = (wallet.operations_wompi).find(op => op.referencia === payload.referencia)
                            if (operation !== null && operation !== undefined) {
                                const fuente_pago = operation.data_transaccion.payment_source_id
                                let query_fuente
                                if (payload.type === 'CARD') {
                                    query_fuente = { "payment_sources_wompi.fuente_id": Number(fuente_pago), "company": payload.company_id, "payment_sources_wompi.status": "AVAILABLE", "payment_sources_wompi.type": "CARD" }
                                } else if (payload.type === 'NEQUI') {
                                    query_fuente = { "payment_sources_wompi.fuente_id": Number(fuente_pago), "company": payload.company_id, "payment_sources_wompi.status": "AVAILABLE", "payment_sources_wompi.type": "NEQUI" }
                                } else {
                                    resolve({
                                        error: true,
                                        err: {
                                            msg: 'Type payment method no exist in body'
                                        }
                                    })
                                }
                                const find_fuente_pago = await models.findOne('wallet_companies', query_fuente)
                                if (find_fuente_pago.error) {
                                    resolve({
                                        error: true,
                                        err: find_fuente_pago.error,
                                        message: "Ha ocurrido un error al consultar la fuente de pago",
                                    });
                                } else if (!find_fuente_pago && !find_fuente_pago.data) {
                                    resolve({
                                        error: null,
                                        data: null,
                                        message: "La fuente de pago no existe o está suspendida",
                                    });
                                } else {
                                    const amount = operation.data_transaccion.amount_in_cents / 100
                                    const find_plan = await models.findById('price_plans', operation.plan)
                                    if (find_plan.error) {
                                        resolve({
                                            error: true,
                                            err: find_plan.error,
                                            message: "Ha ocurrido un error al consultar el plan",
                                        });
                                    } else if (!find_plan.error && !find_plan.data) {
                                        resolve({
                                            error: null,
                                            data: null,
                                            message: "El plan no existe",
                                        });
                                    } else {
                                        const plan = find_plan.data
                                        const renovation = plan.renovation
                                        //Preguntar a ronald si el precio es diferente al pago anterior se le pregunta al usuario si desea continuar con la compra o no
                                        if (amount.toString() === plan.price_plan) {
                                            let test_flag = payload.hasOwnProperty('test') ? (payload.test === true ? true : false) : false
                                            let url = test_flag === true ? WOMPI_URL + '/transactions' : WOMPI_PROD_URL + '/transactions';
                                            let pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV
                                            let authHeader = 'Bearer ' + pub_key
                                            let last_four = payload.company_id.substring(payload.company_id.length - 4)
                                            const transaction = {
                                                amount_in_cents: Number(operation.data_transaccion.amount_in_cents),
                                                currency: 'COP',
                                                reference: last_four + moment().format(),
                                                customer_email: company.company_email,
                                                payment_method: {
                                                    installments: 1,
                                                },
                                                payment_source_id: fuente_pago,
                                                recurrent: true
                                            }
                                            axios.post(url, transaction, {
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': authHeader
                                                }
                                            }).then(async response => {
                                                if (response.data.data !== null) {
                                                    let data_db = {
                                                        referencia: transaction.reference,
                                                        data_transaccion: response.data.data,
                                                        status_wompi: response.data.data.status,
                                                        app_solicitante: payload.app_solicitante ? payload.app_solicitante : "s/a",
                                                        url_solicitante: payload.url_solicitante ? payload.url_solicitante : "s/a",
                                                        fuente_pago: true,
                                                        plan: plan._id,
                                                        renew: true,
                                                        old_operation: payload.referencia
                                                    }
                                                    const update_wallet_operation = await models.findOneAndUpdate('wallet_companies', { company: company._id }, { $push: { operations_wompi: data_db } }, { new: true });
                                                    if (update_wallet_operation.error) {
                                                        resolve({
                                                            error: true,
                                                            err: update_wallet_operation.error
                                                        });
                                                    } else if (!update_wallet_operation.error && !update_wallet_operation.data) {
                                                        resolve({
                                                            error: true,
                                                            err: {
                                                                message: 'Company wallet not found',
                                                                data: update_wallet_operation,
                                                                query: { company: payload.company_id }
                                                            }
                                                        });
                                                    } else {
                                                        let future_renovation
                                                        if (renovation === 'Mensual') {
                                                            future_renovation = moment().add(1, 'M').format();
                                                        } else if (renovation === 'Trimestral') {
                                                            future_renovation = moment().add(3, 'M').format();
                                                        } else {
                                                            future_renovation = 'n/a'
                                                        }
                                                        await models.findOneAndUpdate('companies', { _id: payload.company_id }, { plan: plan._id, plan_renovation: future_renovation })
                                                        resolve({
                                                            error: null,
                                                            data: response.data.data
                                                        });
                                                    }
                                                }
                                            }).catch(error => {
                                                resolve({ error: true, err: error });
                                            })
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.log("renewPlanWithFuentePago ~ error:", error);
                resolve({
                    error: true,
                    err: error
                })
            }
        })
    },

    async cronRenewPlan() {
        try {
            const query = { "wallet": { $exists: true }, "plan": { $exists: true }, "plan_renovation": { $lte: new Date() }, "status": "Active", "defaulter": { $ne: true } }
            const find_companies = await models.findLean('companies', query)
            if (find_companies.error) {
                console.log({
                    error: true,
                    query: query,
                    err: find_companies.error,
                    message: 'Error consultando compañias in cronRenewPlan'
                })
            } else if (!find_companies.error && find_companies.data !== null) {
                const companies = find_companies.data
                for (const company of companies) {
                    const company_id = company._id.toString();
                    const { wallet, plan } = company;
                    const { operations_wompi, payment_sources_wompi } = wallet;
                    //Filtramos las operaciones anteriores que hayan sido para el mismo plan y con fuente de pago
                    const old_operations = operations_wompi.filter(op => op.plan === plan._id.toString() && op.fuente_pago === true);
                    const last_operation = old_operations?.length > 0 ? old_operations[old_operations.length - 1] : false;
                    if (last_operation) {
                        const { data_transaccion } = last_operation;
                        const { payment_method_type, payment_source_id } = data_transaccion;
                        //Buscamos la fuente de pago con status AVAILABLE
                        let payment_source = payment_sources_wompi.find(pay => pay.fuente_id === payment_source_id && pay.type === payment_method_type && pay.status === 'AVAILABLE');
                        if (payment_source) {
                            const test = true;
                            const test_flag = test ? (test === true ? true : false) : false;
                            const url = test_flag === true ? WOMPI_URL + '/transactions' : WOMPI_PROD_URL + '/transactions';
                            const pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV;
                            const authHeader = 'Bearer ' + pub_key;
                            const last_four = company_id.substring(company_id.length - 4);
                            const price = plan.price_plan + '00';
                            const amount_in_cents = parseInt(price);
                            const transaction = {
                                amount_in_cents: Number(amount_in_cents),
                                currency: 'COP',
                                reference: last_four + moment().format(),
                                customer_email: company.company_email,
                                payment_method: {
                                    installments: 1,
                                },
                                payment_source_id: payment_source.fuente_id.toString(),
                                recurrent: true
                            };
                            axios.post(url, transaction, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': authHeader
                                }
                            }).then(async response => {
                                if (response.data.data !== null) {
                                    let data_db = {
                                        referencia: transaction.reference,
                                        data_transaccion: response.data.data,
                                        status_wompi: response.data.data.status,
                                        app_solicitante: 'talent-pay',
                                        url_solicitante: '',
                                        fuente_pago: true,
                                        plan: plan._id,
                                        renew: true,
                                        old_operation: last_operation.referencia
                                    }
                                    const update_wallet_operation = await models.findOneAndUpdate('wallet_companies', { company: company_id }, { $push: { operations_wompi: data_db } }, { new: true });
                                    if (update_wallet_operation.error) {
                                        console.log({
                                            error: true,
                                            err: update_wallet_operation.error,
                                            message: 'Error agregando la operación a la wallet de la compañia in cronRenewPlan'
                                        });
                                    } else if (!update_wallet_operation.error && !update_wallet_operation.data) {
                                        console.log({
                                            error: true,
                                            err: {
                                                message: 'Company wallet not found in cronRenewPlan',
                                                data: update_wallet_operation.data,
                                                query: { company: company_id }
                                            }
                                        });
                                    } else {
                                        let data_status = {
                                            company_id: company_id,
                                            wallet_id: update_wallet_operation.data._id,
                                            plan: plan,
                                            id: response.data.data.id
                                        }
                                        await statusTransaccion(data_status, true);
                                    }
                                }
                            }).catch(error => {
                                console.log({ error: true, err: error });
                            })

                        }
                    }
                }
            }
        } catch (error) {
            console.log("cronRenewPlan error:", error)
        }
    },

    async cronDefaulters() {
        try {
            const query = { "wallet": { $exists: true }, "plan": { $exists: true }, "plan_renovation": { $exists: true }, "status": "Active", "defaulter": true }
            const find_companies = await models.findLean('companies', query)
            if (find_companies.error) {
                console.log({
                    error: true,
                    err: find_companies.error,
                    message: 'Ha ocurrido un error al consultar las empreas morosas',
                    query: query
                });
            } else if (!find_companies.error && !find_companies.data) {
                console.log({
                    error: null,
                    data: null,
                    message: 'No existen empresas morosas',
                    query: query
                });
            } else {
                const companies = find_companies.data
                for (const company of companies) {
                    const company_id = company._id.toString();
                    const { wallet, plan } = company;
                    const { operations_wompi, payment_sources_wompi } = wallet;
                    //Filtramos las operaciones anteriores que hayan sido para el mismo plan y con fuente de pago
                    const old_operations = operations_wompi.filter(op => op.plan === plan._id.toString() && op.fuente_pago === true);
                    const last_operation = old_operations?.length > 0 ? old_operations[old_operations.length - 1] : false;
                    if (last_operation) {
                        const { data_transaccion } = last_operation;
                        const { payment_method_type, payment_source_id } = data_transaccion;
                        //Buscamos la fuente de pago con status AVAILABLE
                        const payment_source = payment_sources_wompi.find(pay => pay.fuente_id === payment_source_id && pay.type === payment_method_type && pay.status === 'AVAILABLE');
                        if (payment_source) {
                            const test = true;
                            const test_flag = test ? (test === true ? true : false) : false;
                            const url = test_flag === true ? WOMPI_URL + '/transactions' : WOMPI_PROD_URL + '/transactions';
                            const pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV;
                            const authHeader = 'Bearer ' + pub_key;
                            const last_four = company_id.substring(company_id.length - 4);
                            const price = plan.price_plan + '00';
                            const amount_in_cents = parseInt(price);
                            const transaction = {
                                amount_in_cents: Number(amount_in_cents),
                                currency: 'COP',
                                reference: last_four + moment().format(),
                                customer_email: company.company_email,
                                payment_method: {
                                    installments: 1,
                                },
                                payment_source_id: payment_source.fuente_id.toString(),
                                recurrent: true
                            };
                            axios.post(url, transaction, {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': authHeader
                                }
                            }).then(async response => {
                                if (response.data.data !== null) {
                                    let data_db = {
                                        referencia: transaction.reference,
                                        data_transaccion: response.data.data,
                                        status_wompi: response.data.data.status,
                                        app_solicitante: 'talent-pay',
                                        url_solicitante: '',
                                        fuente_pago: true,
                                        plan: plan._id,
                                        renew: true,
                                        old_operation: last_operation.referencia
                                    }
                                    const update_wallet_operation = await models.findOneAndUpdate('wallet_companies', { company: company_id }, { $push: { operations_wompi: data_db } }, { new: true });
                                    if (update_wallet_operation.error) {
                                        console.log({
                                            error: true,
                                            err: update_wallet_operation.error,
                                            message: 'Error agregando la operación a la wallet de la compañia in cronRenewPlan'
                                        });
                                    } else if (!update_wallet_operation.error && !update_wallet_operation.data) {
                                        console.log({
                                            error: true,
                                            err: {
                                                message: 'Company wallet not found in cronRenewPlan',
                                                data: update_wallet_operation.data,
                                                query: { company: company_id }
                                            }
                                        });
                                    } else {
                                        let data_status = {
                                            company_id: company_id,
                                            wallet_id: update_wallet_operation.data._id,
                                            payment_source_id: payment_source.fuente_id,
                                            plan: plan,
                                            id: response.data.data.id
                                        }
                                        await statusTransaccion(data_status, true, true);
                                    }
                                }
                            }).catch(error => {
                                console.log({ error: true, err: error });
                            })

                        }
                    }
                }

            }

        } catch (error) {
            console.log("cronDefaulters ~ error:", error);
        }
    },

    async makeTransaction(payload) {
        return new Promise(function (resolve, reject) {
            try {
        console.log("🚀 ~ file: wompiService.js:1440 ~ makeTransaction ~ payload:", payload)

                let test_flag = payload.test ? true : false
                console.log("🚀 ~ file: wompiService.js:1443 ~ test_flag:", test_flag)
                let url = test_flag === true ? WOMPI_URL + '/transactions' : WOMPI_PROD_URL + '/transactions'
                console.log("🚀 ~ file: wompiService.js:1444 ~ url:", url)
                let pub_key = test_flag === true ? WOMPI_PIV : WOMPI_PROD_PIV
                let authHeader = 'Bearer ' + pub_key
                const cardData = {
                    amount_in_cents: Number(payload.amount_in_cents),
                    currency: 'COP', // HARDCODEADO PORQUE AUN NO PERMITE USD
                    reference: payload.reference,
                    "payment_method_type": "CARD",
                    customer_email: payload.customer_email,
                    payment_method: {
                        "type": "CARD",
                        token: payload.id,
                        installments: 1,
                    },
                    acceptance_token: payload.token,
                };
                console.log("🚀 ~ file: wompiService.js:1464 ~ cardData:", cardData)
                axios.post(url, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authHeader
                    }
                })
                    .then(async response => {
                        console.log("🚀 ~ file: wompiService.js:1456 ~ response:", response)
                        // if (response.data.data?.type == "unprocessable") {
                        // } else {
                        //     //GUARDAR  ESTO EN OPERACION???!!         
                        //     let data_db = {
                        //         referencia: payload.reason,
                        //         data_transaccion: response.data,
                        //         status_wompi: response.data.data.status,
                        //         app_solicitante: payload.app_solicitante ? payload.app_solicitante : "s/a",
                        //         url_solicitante: payload.url_solicitante ? payload.url_solicitante : "s/a",
                        //         tipo_operacion: "anulacion",
                        //     }
                        //     await Operaciones.create(data_db)
                        // }
                        // resolve(response.data);
                    })
                    .catch(error => {
                        console.log("🚀 ~ file: wompiService.js:1473 ~ error:", error)
                        resolve(error);
                    });
            } catch (error) {
                console.log('makeTransaction error: ', error);
                resolve(error);
            }
        });
    }



}
