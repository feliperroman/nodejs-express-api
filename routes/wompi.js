// =============================================================================
// PACKAGES
// =============================================================================
const express = require('express');
const app = express.Router();
// =============================================================================
// MIDDLEWARES
// =============================================================================
const { isValidToken } = require("../middleware/index");
const { validateTarjeta, validateTransaction, validateFuentePAgo, validateRefund, validateFuentePagoNequi } = require('../validators/wompi');
// =============================================================================
// CONTROLLERS
// =============================================================================
const {
    wompiController
} = require('../controllers/main/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================
app.get('/token_prefirmado', wompiController.tokenPreAceptacionFirmado)
app.post('/tokenization', validateTarjeta, wompiController.makeTokenCard)
app.post('/pay', validateTransaction, wompiController.makePayment)
app.post('/pay_status', wompiController.getTransaccionStatus)
app.post('/fuente_pago', validateFuentePAgo, wompiController.makeFuentePago)
app.post('/rec_pay', wompiController.makePaymentWhitFuentePago)
app.post('/void', validateRefund, wompiController.makeRefund)
app.get('/trm', wompiController.getTRM)
app.get('/fuente_pago', wompiController.getFuentePago)
app.post('/make_transaction', wompiController.makeTransaction)

//Nequi
app.post('/nequi/tokenization', wompiController.makeTokenNequi)
app.post('/nequi/status', wompiController.checkNequiStatus)
app.post('/nequi/fuente_pago', validateFuentePagoNequi, wompiController.makeFuentePagoNequi)
app.post('/nequi/rec_pay', wompiController.makePaymentWithNequi)
app.post('/delete_payment', wompiController.deletePaymentSource)

module.exports = app;