// =============================================================================
// PACKAGES
// =============================================================================
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
// =============================================================================
// HELPERS
// =============================================================================
const models = require("../helpers/models");
// =============================================================================
// MODELS
// =============================================================================
const User = require('../models/users');
// =============================================================================
// REST FUNCTIONS
// =============================================================================
const service = {}
/**
 * 
 * @param {String} id - token for reset password 
 * @returns boolean
 */

service.validatePassword = (tipo, data) => {
    return new Promise(async (resolve, reject) => {
        if (tipo === 'admin') {
            let find_admin = await models.findLean('users', { email: data.email });
            find_admin = find_admin.error == null ? find_admin.data : null;
            if (find_admin != null && find_admin.length > 0) {
                if (bcrypt.compareSync(data.password, find_admin[0].password)) {
                    resolve({ error: null, data: find_admin[0] });
                } else {
                    resolve({ error: true, message: 'Contraseña incorrecta' });
                }
            } else {
                resolve({ error: true, message: 'Contraseña incorrecta' });
            }
        } else if (tipo == 'user') {
            let find_companie = await models.findLean('companies', { company_email: data.email });
            find_companie = find_companie.error == null ? find_companie.data : null;
            if (find_companie != null && find_companie.length > 0) {
                if (bcrypt.compareSync(data.password, find_companie[0].password)) {
                    resolve({ error: null, data: find_companie[0] });
                } else {
                    resolve({ error: 'Contraseña incorrecta' });
                }
            } else {
                resolve({ error: 'Este correo no existe' });
            }
        } else if (tipo == 'visitor') {
            let find_admin = await models.findLean('user', { email: data.email });
            find_admin = find_admin.error == null ? find_admin.data : null;
            if (find_admin != null && find_admin.length > 0) {
                if (bcrypt.compareSync(data.password, find_admin[0].password)) {
                    resolve({ error: null, data: find_admin[0] });
                } else {
                    resolve({ error: 'Contraseña incorrecta' });
                }
            } else {
                resolve({ error: 'Este correo no existe' });
            }
        } else {
            resolve({ error: 'tipo no presente o invalido' });
        }
    });
};

service.generateToken = (email, id, tipo) => {

    return new Promise(async (resolve, reject) => {

        let token = jwt.sign({ user: email, id: id, tipo: tipo }, process.env.SEED, {

            expiresIn: process.env.EXP,
        });
        resolve(token)
    });

};

module.exports = service;
