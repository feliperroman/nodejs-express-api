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
    clientsController
} = require('../controllers/main/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================

app.get('/get', isValidToken,clientsController.post.getClient); 
app.get('/getAll', isValidToken,clientsController.get.getAllClients);
app.post('/create', clientsController.post.createClient);
app.post('/update', isValidToken, clientsController.post.updateClient);
app.post('/delete', isValidToken, clientsController.post.deleteClient); 
app.post('/bookRoute',  clientsController.post.bookingRoute);
app.post('/prebookRoute',  clientsController.post.prebookingRoute);
app.post('/createInvoice',  clientsController.post.createInvoicesClients);
app.get('/getGallery', clientsController.get.getAllGallery); 





module.exports = app;