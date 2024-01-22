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
    postController
} = require('../controllers/main/manager');
// =============================================================================
// REST FUNCTIONS
// =============================================================================

app.get('/get', isValidToken, postController.get.getPost);
app.get('/getAll', isValidToken, postController.get.getAllPost);
app.post('/create', isValidToken, postController.post.createPost);
app.post('/update', isValidToken, postController.post.updatePost);
app.post('/delete', isValidToken, postController.post.deletePost);

module.exports = app;