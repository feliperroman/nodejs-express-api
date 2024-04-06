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
    dashboardController
} = require('../controllers/main/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================

app.get('/getRecentRoutes', dashboardController.get.getRecentRoutes);
app.post('/createPrebookedNew', dashboardController.post.createPreBookedNewUser);
app.post('/createPrebookedOld',  dashboardController.post.createPreBookedOldUser); 
app.post('/validateClient',  dashboardController.post.validateClient);
app.get('/comments', dashboardController.get.getAllComments); 
app.get('/videos', dashboardController.get.getVideos); 
app.get('/cms', dashboardController.get.cms)

module.exports = app;