// =============================================================================
// PACKAGES
// =============================================================================
const express = require('express');
const app = express.Router();
// =============================================================================
// MIDDLEWARES
// =============================================================================
const { isValidToken } = require("../middleware/index");
// =============================================================================
// CONTROLLERS
// =============================================================================
const {
    sistecreditoController
} = require('../controllers/main/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================

app.get('/getBanks', sistecreditoController.get.getBankList);
app.post('/createPay', sistecreditoController.post.createPayment);


module.exports = app;