// =============================================================================
// PACKAGES
// =============================================================================
const bcrypt = require('bcrypt');
// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
// =============================================================================
// SERVICES
// =============================================================================
const Auth = require('../services/authService');
const jwt = require("jsonwebtoken");

// =============================================================================
// REST FUNCTIONS
// =============================================================================
async function validateLogin(req, res) {
    try {
        let validate_user = await Auth.validatePassword(req.body.type_user, req.body);
        if (validate_user.error == null) {
            let token = await Auth.generateToken(validate_user.data.email, validate_user.data._id, req.body.type_user);
            jwt.verify(token, process.env.SEED, (err, decode) => {
                if (err) {
                    return res.json({
                        error: true,
                        err: err,
                        message: 'Token expirado o invalido'
                    });
                }else{
                req.user = {
                    email: decode.user,
                    tipo: decode.tipo,
                    id: decode.id
                }
                res.status(200).json({
                    user: {
                        email: decode.user,
                        type: decode.tipo,
                    },
                    token: token,
                }); 
                }
                
            });
        } else {
            res.json(validate_user);
        }
    } catch (error) {
        console.log('error: ', error);
        res.json("error")
    }
};


module.exports = {
    render: {
    },
    get: {

    },
    post: {
        validateLogin
    }
};