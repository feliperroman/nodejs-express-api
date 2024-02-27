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
app.get('/token_prefirmado', wompiController.tokenPreAceptacionFirmado);
app.get('/financial_institutions', wompiController.financial_institutions);
app.post('/pay',  wompiController.makePayment)
app.post('/longpolling', wompiController.longPolling)

module.exports = app;