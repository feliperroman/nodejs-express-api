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
	usersController
} = require('../controllers/main/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================

app.get('/get', isValidToken, usersController.get.getUsers);
app.get('/getAll', isValidToken, usersController.get.getUsers);
app.get('/getAllRoutes', isValidToken, usersController.get.getAllRoutes);
app.post('/create',  usersController.post.createUser);
app.post('/update', isValidToken, usersController.post.updateUser);
app.post('/delete', isValidToken, usersController.post.deleteUser); 
app.post('/seeBookings', isValidToken, usersController.post.seeReservasClient); 
app.post('/preseeBookings', isValidToken, usersController.post.seePrereservasClient);  
app.post('/confirmPrebook', isValidToken, usersController.post.confirmPrebook);  
app.post('/images',upload.any('images[]'), isValidToken, usersController.post.addImagesGallery); 
app.post('/createComment', isValidToken, usersController.post.createComment);   
app.post('/imgComment',upload.any('image'), isValidToken, usersController.post.addImageComment); 
app.post('/video', isValidToken, usersController.post.createVideo); 
 








module.exports = app;