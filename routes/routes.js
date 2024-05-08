// =============================================================================
// PACKAGES
// =============================================================================
const express = require('express');
const app = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// =============================================================================
// MIDDLEWARES
// =============================================================================
const { isValidToken } = require("../middleware/index");
// =============================================================================
// CONTROLLERS
// =============================================================================
const {
    routesController
} = require('../controllers/main/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================

app.post('/get',  routesController.get.getRoute);
app.get('/getAll',  routesController.get.getAllRoutes);
app.post('/create', isValidToken, routesController.post.createNewRoute);
app.post('/update', isValidToken, routesController.post.updateRoute);
app.post('/delete', isValidToken, routesController.post.deleteRoute); 
app.post('/images',upload.any('images[]'), isValidToken, routesController.post.addImagesRoute); 
app.get('/getAllPrebook',  routesController.get.getAllPrebook);


module.exports = app;