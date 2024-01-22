const WompiService = require('../services/wompiService')

module.exports = {
    /*
    * Obtiene el token de aceptacion prefirmado, debe ir presente en todas las peticiones.
    * @param {*} req 
    * @param {*} res 
    * @param {Function} next callback 
    * @returns 
    */
    async tokenPreAceptacionFirmado(req, res) {
        try {
            //este token es de un solo uso!
            let test = req.query && req.query.test == "true" || req.query.test == true ? true : false;
            let infoTienda = await WompiService.getTienda(test);
            // console.log('infoTienda: ', infoTienda);
            let presigned_acceptance = infoTienda.data.presigned_acceptance;
            res.status(200).json({ error: null, data: { token: presigned_acceptance, types_payment: infoTienda.data.payment_methods } })
        } catch (error) {
            res.status(200).json({ error: error, data: null, message:'Ha ocurrido un error' })
        }
    },
    /*
    * Obtiene el token de una tarjeta, no debe almacenarse mas que para 1 transaccion.
    * @param {*} req 
    * @param {*} res 
    * @param number: String, exp_month: String,exp_year: payload.exp_year,cvc: payload.cvc,card_holder: payload.card_holder, next callback 
    * @returns 
    */
    async makeTokenCard(req, res) {
        try {
            let tokenCard = await WompiService.getCCToken(req.body);
            res.status(200).json({ error: null, data: tokenCard })
        } catch (error) {
            res.status(200).json({ error: error, data: null })
        }
    },

    async makeTokenNequi(req, res) {
        try {
            const tokenNequi = await WompiService.tokenizationNequi(req.body);
            if (tokenNequi.error) {
                res.json({
                    error: true,
                    err: tokenNequi.err,
                    message: 'Ha ocurrido un error al tokenizar el numero nequi'
                })
            } else {
                res.json({
                    error: null,
                    data: tokenNequi.data
                })
            }

        } catch (error) {
            console.log("makeTokenNequi ~ error:", error);
            res.json({
                error: true,
                err: error
            })
        }
    },

    async checkNequiStatus(req, res) {
        try {
            const checkStatus = await WompiService.checkStatusNequi(req.body)
            if (checkStatus.error) {
                res.json({
                    error: true,
                    err: checkStatus.err,
                    message: 'Ha ocurrido un error al verificar el estatus'
                });
            } else {
                res.json({
                    error: null,
                    data: checkStatus.data
                });
            }

        } catch (error) {
            console.log("checkNequiStatus ~ error:", error);
        }
    },

    async makeFuentePagoNequi(req, res) {
        try {
            const make_fuente = await WompiService.makeFuentePagoNequi(req.body);
            if (make_fuente.error) {
                res.json({
                    error: true,
                    err: make_fuente.err,
                    message: 'Ha ocurrido un error al crear la fuente de pago'
                });
            } else {
                res.json({
                    error: null,
                    data: make_fuente.data
                });
            }
        } catch (error) {
            console.log("makeFuentePagoNequi ~ error:", error);
        }
    },
    async makePayment(req, res) {
        try {
            let transactions = await WompiService.makePayment(req.body);
            res.status(200).json({ error: null, data: { transaccion: transactions } })
        } catch (error) {
            console.log('error: ', error);
            res.status(200).json({ error: error, data: null })
        }
    },
    async  makeTransaction(req, res){
        try {
            const transaction = await WompiService.makeTransaction(req.body)
        } catch (error) {
            console.log("makeTransaction ~ error:", error)
        }
    },
    async getTransaccionStatus(req, res) {
        try {
            let test = req.body && req.body.test === true ? true : false;
            let transaction_status = await WompiService.getStatusTransaccion(req.body, test);
            if (transaction_status.error) {
                res.json({
                    error: transaction_status.error,
                    err: transaction_status.err
                });
            } else {
                res.json({
                    error: transaction_status.error ? transaction_status.error : null,
                    data: transaction_status.data
                });
            }
        } catch (error) {
            console.log('error: ', error);
            res.status(200).json({ error: true, data: null, err: error })
        }
    },

    //debes tener: 1>)token de aceptacion 2)tokenizar una tdc
    async makeFuentePago(req, res) {
        try {
            let transaction_status = await WompiService.makeFuentePago(req.body);
            if (transaction_status.error) {
                res.json({
                    error: transaction_status.error,
                    err: transaction_status.err
                });
            } else {
                res.json({
                    error: transaction_status.error ? transaction_status.error : null,
                    data: transaction_status.data
                });
            }
            // let error_wompi = transaction_status.data?.error
            // res.status(200).json({ error: error_wompi === undefined ? null : error_wompi, data: transaction_status.data })
        } catch (error) {
            res.status(200).json({ error: true, data: null, err: error })
        }
    },


    async makePaymentWhitFuentePago(req, res) {
        try {
            let transaction_status = await WompiService.makePaymentWhitFuentePago(req.body);
            if (transaction_status.error) {
                res.json({
                    error: transaction_status.error,
                    err: transaction_status.err
                });
            } else {
                res.json({
                    error: transaction_status.error ? transaction_status.error : null,
                    data: transaction_status.data
                });
            }
        } catch (error) {
            res.status(200).json({ error: true, data: null, err: error })
        }
    },
    async makePaymentWithNequi(req, res) {
        try {
            let payment_nequi = await WompiService.makePaymentWhitNequi(req.body)
            if (payment_nequi.error) {
                res.json({
                    error: payment_nequi.error,
                    err: payment_nequi.err
                });
            } else {
                res.json({
                    error: payment_nequi.error ? payment_nequi.error : null,
                    data: payment_nequi.data
                });
            }
        } catch (error) {
            console.log("makePaymentWithNequi ~ error:", error)
        }
    },
    async getTRM(req, res) {
        try {
            let trm_tasa = await WompiService.getTRM();
            res.status(200).json({ error: null, data: trm_tasa })

        } catch (error) {
            console.log('error: ', error);
            res.status(200).json({ error: error, data: null })
        }
    },
    async makeRefund(req, res) {
        try {

            let trm_tasa = await WompiService.makeRefund(req.body);
            res.status(200).json({ error: null, data: trm_tasa })

        } catch (error) {
            console.log('error: ', error);
            res.status(200).json({ error: error, data: null })
        }
    },
    async getFuentePago(req, res) {
        try {

            let fuentePago = await WompiService.getFuentePago(req.query.email);
            res.status(200).json({ error: null, data: fuentePago })

        } catch (error) {
            console.log('error: ', error);
            res.status(200).json({ error: error, data: null })
        }
    },

    async deletePaymentSource(req, res) {
        try {
            let delete_payment = await WompiService.deletePaymentSource(req.body)
            if (delete_payment.error) {
                res.json({
                    error: delete_payment.error,
                    err: delete_payment.err
                });
            } else {
                res.json({
                    error: delete_payment.error ? delete_payment.error : null,
                    data: delete_payment.data
                });
            }
        } catch (error) {
            console.log("deletePaymentSource error", error);
            res.json({
                error: true,
                err: error
            });
        }
    },

    async renewPlan(req, res) {
        try {
            const admin = req.user.id
            const body = req.body
            if (!admin || !body) {
                res.json({
                    error: true,
                    err: {
                        message: 'Token Admin or Body no includes in request',
                        body: body,
                        admin: admin
                    }
                });
            } else {
                const renew_plan = await WompiService.renewPlanWithFuentePago(admin, body)
                if (renew_plan.error) {
                    res.json({
                        error: renew_plan.error,
                        err: renew_plan.err,
                        message: renew_plan?.message
                    });
                } else {
                    res.json({
                        error: renew_plan.error ? renew_plan.error : null,
                        data: renew_plan.data,
                        message: renew_plan?.message
                    });
                }
            }
        } catch (error) {
            console.log("renewPlan ~ error:", error);
            res.json({
                error: true,
                err: error
            });
        }
    }

}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}