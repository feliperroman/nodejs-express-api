const WompiService = require('../services/wompiService')
module.exports = {
    /*
    * Get the pre-signed acceptance token, it must be present in all requests.
    * @param {*} req 
    * @param {*} res 
    * @param {Function} next callback 
    * @returns 
    */
    async tokenPreAceptacionFirmado(req, res) {
        try {
            const test = req.query && req.query.test == "true" || req.query.test == true ? true : false;
            const token_acceptance = await WompiService.getTokenAcceptance(test);
            const { presigned_acceptance, payment_methods } = token_acceptance.data
            res.status(200).json({ error: null, data: { token_acceptance: presigned_acceptance.acceptance_token, payment_methods: payment_methods } })
        } catch (error) {
            console.log("tokenPreAceptacionFirmado ~ error:", error)
            res.status(200).json({ error: true, err: error, message: 'Ha ocurrido un error' })
        }
    },
     /*
    * Get a list of financial institutions.
    * @param {*} req 
    * @param {*} res 
    * @param {Function} next callback 
    * @returns 
    */
    async financial_institutions(req, res) {
        try {
            const test = req.query && req.query.test == "true" || req.query.test == true ? true : false;
            const token_acceptance = req.query && req.query.token_acceptance ? req.query.token_acceptance : null
            if (!token_acceptance) {
                res.status(200).json({ error: true,  message: 'No existe el token_acceptance' })
            } else {
                const financial_institutions = await WompiService.getFinancialInstitutions(test, token_acceptance);
                if (financial_institutions?.data?.length > 0) {
                    res.status(200).json({ error: null, data:  financial_institutions.data });
                } else {
                    res.status(200).json({ error: true, err: financial_institutions, message: 'Error al obtener las instituciones financieras' });
                }
            }
        } catch (error) {
            console.log("financial_institutions ~ error:", error)
            res.status(200).json({ error: true, err: error, message: 'Error al obtener las instituciones financieras' })
        }
    },
    async longPolling(req, res) {
        try {
            let test = req.body && req.body.test === true ? true : false;
            let transaction_status = await WompiService.longpolling(req.body, test);
            if (transaction_status.error) {
                res.json({
                    error: transaction_status.error,
                    err: transaction_status.err
                });
            } else {
                res.json({
                    error: null,
                    data: transaction_status.data
                });
            }
        } catch (error) {
            console.log('error: ', error);
            res.status(200).json({ error: true, data: null, err: error })
        }
    },
    async makePayment(req, res) {
        try {
            let transactions = await WompiService.makePayment(req.body);
            res.status(200).json({ error: null, data: transactions })
        } catch (error) {
            console.log('error: ', error);
            res.status(200).json({ error: error, data: null })
        }
    },
}