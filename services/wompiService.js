const axios = require('axios');
const models = require("../helpers/models");
const { URL_SANDBOX_WOMPI, PUB_TEST, URL_PROD_WOMPI, PUB_PROD, INTEGRITY_PROD } = process.env
// const { Operaciones, FuentesPago, trm } = require('../models');
// const { WOMPI_PUB, WOMPI_URL, WOMPI_PIV, WOMPI_PROD_URL, WOMPI_PROD_PUB, WOMPI_PROD_PIV } = process.env;
// const trmcol = require('trmcol');
// const moment = require('moment');

// async function statusTransaccion(transaccion_id, test, defaulter) {
//     // console.log('deleted', deleted)
//     try {
//         let query = transaccion_id.id ? { "client_id": transaccion_id.client_id, "operations_wompi.data_transaccion.id": transaccion_id.id } :
//             transaccion_id.referencia ? { "client_id": transaccion_id.client_id, "operations_wompi.referencia": transaccion_id.referencia } : "n/a";
//         let pub_key = test == true ? WOMPI_PUB : WOMPI_PROD_PUB
//         let url = test == true ? WOMPI_URL + "/transactions/" : WOMPI_PROD_URL + "/transactions/"
//         let authHeader = 'Bearer ' + pub_key
//         if (query == "n/a") {
//             console.log({
//                 error: true,
//                 err: "faltan parametros para consultar en statusTransaccion"
//             });
//         } else {
//             const find_operation = await models.findOne('operations', query);
//             if (find_operation.error) {
//                 console.log({
//                     error: true,
//                     err: find_operation.error,
//                     message: 'Ha ocurrido un error al consultar la operación in statusTransaccion'
//                 });
//             } else if (!find_operation.error && !find_operation.data) {
//                 console.log({
//                     error: true,
//                     err: {
//                         data: find_operation,
//                         query: query
//                     },
//                     message: 'Client operation not found in statusTransaccion',
//                 });
//             } else {
//                 const operacion = find_operation.data
//                 let type = transaccion_id.id ? 'id' : transaccion_id.referencia ? 'referencia' : 'n/a'
//                 if (type !== 'n/a') {
//                     let operation = null
//                     let all_operations = operacion.operations_wompi
//                     if (type === 'id') {
//                         operation = all_operations.filter(op => op.data_transaccion.id === transaccion_id.id);
//                     } else if (type === 'referencia') {
//                         operation = all_operations.filter(op => op.referencia === transaccion_id.referencia);
//                     }
//                     if (operation?.length > 0) {
//                         operation = operation[0]
//                         axios.get(url + operation.data_transaccion.id, {
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'Authorization': authHeader
//                             }
//                         })
//                             .then(async response => {
//                                 const update_operation = await models.findOneAndUpdate('operations', query, { "operations_wompi.$.data_transaccion.status": response.data.data.status, "operations_wompi.$.status_wompi": response.data.data.status })
//                                 if (update_operation.error) {
//                                     console.log({
//                                         error: true,
//                                         err: update_operation.error,
//                                         message: 'Ha ocurrido un error al consultar la wallet in statusTransaccion'
//                                     });
//                                 } else if (!update_operation.error && !update_operation.data) {
//                                     console.log({
//                                         error: true,
//                                         err: {
//                                             message: 'Company wallet not found in statusTransaccion',
//                                             data: update_operation,
//                                             query: query
//                                         }
//                                     });
//                                 } else {
//                                     let all_operations = update_operation.data.operations_wompi
//                                     let result = null
//                                     if (type === 'id') {
//                                         result = all_operations.find(op => op.data_transaccion.id === transaccion_id.id);
//                                     } else if (type === 'referencia') {
//                                         result = all_operations.find(op => op.referencia === transaccion_id.referencia);
//                                     }
//                                     if (result !== null && result !== undefined) {
//                                         if (result.data_transaccion.status === 'PENDING') {
//                                             // console.log('pending')
//                                             ///Mientras el status de la transacción sea PENDING, se repite la función
//                                             await statusTransaccion(transaccion_id, test, defaulter)
//                                         } else if (result.data_transaccion.status === 'DECLINED') {
//                                             // console.log('DECLINED')
//                                             if (defaulter === true) {
//                                                 await planDeclined(transaccion_id)
//                                             } else {
//                                                 const update_company = await models.findOneAndUpdate('companies', { _id: transaccion_id.company_id }, { defaulter: true })
//                                             }
//                                         } else if (result.data_transaccion.status === 'APPROVED') {
//                                             console.log('DECLINED forced ( approved )')
//                                             await activePlan(transaccion_id)
//                                             // if (defaulter === true) {
//                                             //   await planDeclined(transaccion_id)
//                                             // } else {
//                                             //   const update_company = await models.findOneAndUpdate('companies', { _id: transaccion_id.company_id }, { defaulter: true }, { new: true });
//                                             //   console.log("update_company:", update_company);
//                                             // }
//                                         }
//                                     }
//                                 }
//                             })
//                             .catch(error => {
//                                 console.log({
//                                     error: true,
//                                     err: error,
//                                     message: 'statusTransaccion request transactions error'
//                                 })
//                             });
//                     }
//                 } else {
//                     resolve({
//                         error: true,
//                         err: 'no existen id o referencia'
//                     })
//                 }
//             }
//         }
//     } catch (error) {
//         console.log("statusTransaccion ~ error:", error)
//         reject(error)
//     }
// }

// async function activePlan(data) {
//     try {
//         const { company_id, wallet_id, plan } = data
//         const update_wallet = await models.findOneAndUpdate('wallet_companies', { _id: wallet_id }, { $inc: { tokens: plan.credits_plan } })
//         if (update_wallet.error) {
//             console.log({
//                 error: true,
//                 err: update_wallet.error,
//                 message: 'Ha ocurrido un error al actualizar la wallet'
//             })
//         } else if (!update_wallet.error && !update_wallet.data) {
//             console.log({
//                 error: null,
//                 data: null,
//                 message: 'No existe wallet con ese id'
//             });
//         } else {
//             const wallet = update_wallet.data
//             const renovation = plan.renovation
//             let future_renovation
//             if (renovation === 'Mensual') {
//                 future_renovation = moment().add(1, 'M').format();
//             } else if (renovation === 'Trimestral') {
//                 future_renovation = moment().add(3, 'M').format();
//             } else {
//                 future_renovation = 'n/a'
//             }
//             const update_company = await models.findOneAndUpdate('companies', { _id: company_id }, { plan: plan._id, plan_renovation: future_renovation }, { new: true })
//             if (update_company.error) {
//                 console.log({
//                     error: true,
//                     err: update_company.error,
//                     message: 'Ha ocurrido un error al actualizar la empresa'
//                 })
//             } else if (!update_company.error && !update_company.data) {
//                 console.log({
//                     error: null,
//                     data: null,
//                     message: 'No existe compañia con ese id'
//                 });
//             } else {
//                 console.log({
//                     error: null,
//                     data: update_company.data,
//                     message: 'Renovación de plan activada'
//                 });
//             }
//         }
//     } catch (error) {
//         console.log("activePlan ~ error:", error);
//     }
// }

// async function planDeclined(data) {
//     try {
//         const { company_id, wallet_id, plan, payment_source_id } = data
//         const cancel_plan = await models.findOneAndUpdate('companies', { _id: company_id }, { "defaulter": true, "plan_renovation": null }, { new: true })
//         if (cancel_plan.error) {
//             console.log({
//                 error: true,
//                 err: cancel_plan.error,
//                 message: 'Ha ocurrido un error al actualizar la empresa morosa por transacción rechazada',
//                 query: { _id: company_id }
//             })
//         } else if (!cancel_plan.error && !cancel_plan.data) {
//             console.log({
//                 error: null,
//                 data: null,
//                 message: 'No existe la empresa asociada al id'
//             });
//         } else {
//             const update_payment_method = await models.findOneAndUpdate('wallet_companies', { _id: wallet_id, "payment_sources_wompi.fuente_id": Number(payment_source_id) }, { "payment_sources_wompi.$.status": 'DEFAULTER' })
//             if (update_payment_method.error) {
//                 console.log({
//                     error: true,
//                     err: update_payment_method.error,
//                     message: 'Ha ocurrido un error al marcar la fuente de pago como morosa'
//                 });
//             } else if (!update_payment_method.error && !update_payment_method.data) {
//                 console.log({
//                     error: null,
//                     data: null,
//                     message: 'No se encontró la fuente de pago morosa'
//                 });
//             } else {
//                 const notification = {
//                     type: 'alert',
//                     texto: 'Tu plan y método de pago han sido desactivados por incumplimiento en el pago de tu plan, verifica o cambia tus métodos de pago',
//                     link: 'n/a',
//                     talent_id: null,
//                     date: new Date(),
//                     is_read: false
//                 }
//                 const create_notification = await models.findOneAndUpdate('notifications_companies', { company_id: company_id }, { $push: { notification: notification } }, { upsert: true, new: true });
//                 if (create_notification.error) {
//                     console.log({
//                         error: true,
//                         err: create_notification.error,
//                         message: 'Ha ocurrido un error al crear la notificacion para empresa'
//                     });
//                 } else if (!create_notification.error && !create_notification.data) {
//                     console.log({
//                         error: null,
//                         date: null,
//                         message: 'No fue posible crear la notifiación'
//                     });
//                 } else {
//                     console.log({
//                         error: null,
//                         data: create_notification.data,
//                         message: 'Notifiación creada'
//                     });
//                 }
//             }
//         }
//     } catch (error) {
//         console.log("planDeclined ~ error:", error)

//     }
// }


// async function createNotificationForCompanies(company_id, type, texto, link, talent_id) {
//     try {
//         // const notificationData = {
//         //   company_id: company_id,
//         //   notification: [{
//         //     type: type,
//         //     texto: texto,
//         //     link: link,
//         //     talent_id: talent_id ? talent_id : null,
//         //     date: new Date(),
//         //     is_read: false
//         //   }]
//         // };
//         const notification = {
//             type: type,
//             texto: texto,
//             link: link,
//             talent_id: talent_id ? talent_id : null,
//             date: new Date(),
//             is_read: false
//         }
//         const create_notification = await models.findOneAndUpdate('notifications_companies', { company_id: company_id }, { $push: { notification: notification } }, { upsert: true, new: true })
//         if (create_notification.error) {
//             console.log({
//                 error: true,
//                 err: create_notification.error,
//                 message: 'Ha ocurrido un error al crear la notificacion para empresa'
//             });
//         } else if (!create_notification.error && !create_notification.data) {
//             console.log({
//                 error: null,
//                 date: null,
//                 message: 'No fue posible crear la notifiación'
//             });
//         } else {
//             console.log({
//                 error: null,
//                 data: create_notification.data,
//                 message: 'Notifiación creada'
//             });
//         }

//         // const find_company = await models.findOne('notifications_companies', { company_id: company_id });
//         // if (!find_company.error && find_company.data !== null) {
//         //   const update_company = await models.findOneAndUpdate('notifications_companies', { company_id: company_id }, { $push: { notification: notificationData.notification[0] } }, { new: true });
//         //   return update_company?.data;
//         // } else if (!find_company.error && !find_company.data) {
//         //   const create_notification = await models.newDocument("notifications_companies", notificationData);
//         //   return create_notification?.data;
//         // }
//     } catch (error) {
//         console.log("createNotificationForCompanies ~ error:", error);
//         return error;
//     }

// }




module.exports = {

    async getTokenAcceptance(test) {
        return new Promise(function (resolve, reject) {
            try {
                const url_wompi_token = test == true ? URL_SANDBOX_WOMPI + "/merchants/" + PUB_TEST : URL_PROD_WOMPI + "/merchants/" + PUB_PROD
                axios.get(url_wompi_token)
                    .then(response => {
                        resolve(response.data)
                    })
                    .catch(error => {
                        resolve(error)
                    });
            } catch (error) {
                console.log("getTokenAcceptance ~ error:", error)
                reject(error)
            }
        });
    },
    async getFinancialInstitutions(test, token) {
        return new Promise(function (resolve, reject) {
            try {
                const url_wompi_token = test == true ? URL_SANDBOX_WOMPI + "/pse/financial_institutions/" : URL_PROD_WOMPI + "/pse/financial_institutions"
                axios.get(url_wompi_token, {
                    headers: {
                        'Authorization': token,
                    }
                }).then(response => {
                    resolve(response.data)
                }).catch(error => {
                    resolve(error)
                });
            } catch (error) {
                console.log("getFinancialInstitutions ~ error:", error)
                reject(error)
            }
        });
    },

    async makePayment(data_payment) {
        return new Promise(async function (resolve, reject) {
            try {
                const test_flag = data_payment.hasOwnProperty('test') ? (data_payment.test === true ? true : false) : false;
                const url = test_flag === true ? URL_SANDBOX_WOMPI + '/transactions' : URL_PROD_WOMPI + '/transactions';
                const pub_key = test_flag === true ? PUB_TEST : PUB_PROD;
                const { client_id, document, test, ...rest } = data_payment
                let reference = rest.reference
                let amount_in_cents = rest.amount_in_cents.toString()
                let currency = 'COP'

                let cadenaConcatenada = reference + amount_in_cents + currency + INTEGRITY_PROD
                //Ejemplo
                const encondedText = new TextEncoder().encode(cadenaConcatenada);
                const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                axios.post(url, { "signature": hashHex, ...rest }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + pub_key
                    }
                }).then(async response => {
                    const data_db = response.data.data
                    const update_wallet = await models.findOneAndUpdate('wallet_clients', { client: client_id, client_document: document }, { $push: { operations_wompi: data_db } }, { new: true })
                    resolve({ ...response.data, track_ids: { operation_id: update_wallet.data, } });
                }).catch(error => {
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

    async longpolling(transaccion, test) {
        return new Promise(async function (resolve, reject) {
            try {
                let query = transaccion.id ? { "client_document": transaccion.client_document, "operations_wompi.id": transaccion.id } : "n/a";
                let pub_key = test == true ? PUB_TEST : PUB_PROD
                let url = test == true ? URL_SANDBOX_WOMPI + "/transactions/" : URL_PROD_WOMPI + "/transactions/"
                let authHeader = 'Bearer ' + pub_key
                if (query == "n/a") {
                    resolve({
                        error: true,
                        message: "faltan parametros para consultar"
                    });
                } else {
                    const find_operation = await models.findOne('wallet_clients', query);
                    if (find_operation.error) {
                        resolve({
                            error: true,
                            err: find_operation.error,
                            message: 'Client wallet not found',
                        });
                    } else if (!find_operation.error && !find_operation.data) {
                        resolve({
                            error: true,
                            err: {
                                message: 'Client wallet not found',
                                data: find_operation,
                                query: query
                            },
                            message: 'Client wallet not found',
                        });
                    } else {
                        const operacion = find_operation.data
                        let type = transaccion.id ? 'id' : transaccion.referencia ? 'referencia' : 'n/a'
                        if (type !== 'n/a') {
                            let operation = null
                            let all_operations = operacion.operations_wompi
                            if (type === 'id') {
                                operation = all_operations.filter(op => op.id === transaccion.id);
                            } else if (type === 'referencia') {
                                operation = all_operations.filter(op => op.referencia === transaccion.referencia);
                            }
                            if (operation?.length > 0) {
                                operation = operation[0]
                                let urloperation = url + operation.id
                                axios.get(urloperation, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': authHeader
                                    }
                                }).then(async response => {
                                    await models.findOneAndUpdate('wallet_clients', query, { 'operations_wompi.$': response.data.data })
                                    resolve({
                                        error: null,
                                        data: response.data.data,
                                    });
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
                console.log("lognpolling ~ error:", error)
            }
        })
    }
}
