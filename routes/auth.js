// =============================================================================
// PACKAGES
// =============================================================================
const express   = require('express');
const app       = express.Router();
// =============================================================================
// MIDDLEWARES
// =============================================================================
const {isValidToken} = require("../middleware/index");
// =============================================================================
// CONTROLLER
// =============================================================================
const { 
	authController
} = require('../controllers/main/manager');
//==============================================================================
// HOME PAGES
//==============================================================================
// Las rutas apuntan al controlador de Index, si quieres coloca el sistema de login también ahí, así dejamos acá solo rutas <=====

app.post('/login', authController.post.validateLogin);
// app.post('/reset-password',isValidToken, authController.post.resetPassword); 
// app.post('/first-login',isValidToken, authController.post.resetPassFirstLogin); 
// app.post('/disable',isValidToken, authController.post.disableAccount);

module.exports = app;