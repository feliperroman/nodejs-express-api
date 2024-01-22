// =============================================================================
// PACKAGES
// =============================================================================
const { check, query, param } = require('express-validator')
const { validateResult } = require('../config/policies') //modificar
// =============================================================================
// SCHEMAS VALIDATIONS
// =============================================================================

const validateTarjeta = [
    //isCreditCard
    check('number')
        .exists()
        .isCreditCard()
        .withMessage('El número de tarjeta no es válido')
        .not()
        .isEmpty(),

    check('exp_month')
        .exists()
        .isLength({ min: 2, max: 2 })
        .isNumeric().withMessage('El mes de expiración no es válido')
        .not()
        .isEmpty(),

    check('exp_year')
        .exists()
        .isLength({ min: 2, max: 2 })
        .isNumeric()
        .withMessage('El año de expiración no es válido')
        .not()
        .isEmpty(),

    check('cvc')
        .exists()
        .isLength({ min: 3, max: 4 })
        .isNumeric()
        .withMessage('El código de seguridad no es válido')
        .not()
        .isEmpty(),

    check('card_holder')
        .exists()
        .isString()
        .isLength({ min: 5 })
        .withMessage('El nombre del tarjetahabiente no es válido')  
        .not()
        .isEmpty(),

    (req, res, next) => {
        validateResult(req, res, next)
    }
]

const validateTransaction = [
    check('acceptance_token')
        .notEmpty()
        .withMessage('El acceptance_token es requerido'),
    check('amount_in_cents')
        .notEmpty()
        .withMessage('El amount_in_cents es requerido')
        .isInt()
        .withMessage('El amount_in_cents debe ser un número entero'),
    check('customer_email')
        .notEmpty()
        .withMessage('El customer_email es requerido')
        .isEmail()
        .withMessage('El customer_email debe ser una dirección de correo válida'),
    check('payment_type')
        .notEmpty()
        .withMessage('El type es requerido')
        .equals('CARD')
        .withMessage('El type debe ser "CARD"'),
    check('token')
        .notEmpty()
        .withMessage('El payment_method.token es requerido'),
    check('reference')
        .notEmpty()
        .withMessage('El reference es requerido'),
    check('cuotas')
        .notEmpty()
        .withMessage('El cuotas es requerido')
        .isInt({ min: 1, max: 36 })
        .withMessage('El cuotas debe ser un número entero del 1 al 36'),

    (req, res, next) => {
        validateResult(req, res, next)
    }
  
]

const validateFuentePAgo = [
  
    check('customer_email')
        .isEmail()
        .withMessage('El correo electrónico del pagador debe ser válido.'),
    check('type')
        .isIn(['NEQUI', 'CARD'])
        .withMessage('El tipo de medio de pago debe ser "NEQUI" o "CARD".'),
    check('token')
        .notEmpty()
        .withMessage('El token de Nequi o Tarjeta es requerido.'),        
    check('brand')
        .notEmpty()
        .withMessage('El tipo de la tarjeta es requerida'),   
    check('acceptance_token')
        .notEmpty()
        .withMessage('El token de aceptación es requerido.'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
  
]

const validateFuentePagoNequi = [
  
    check('customer_email')
        .isEmail()
        .withMessage('El correo electrónico del pagador debe ser válido.'),
    check('type')
        .isIn(['NEQUI'])
        .withMessage('El tipo de medio de pago debe ser "NEQUI".'),
    check('token')
        .notEmpty()
        .withMessage('El token de Nequi o Tarjeta es requerido.'),        
    check('acceptance_token')
        .notEmpty()
        .withMessage('El token de aceptación es requerido.'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
  
]

const validateRefund = [
    check('amount_in_cents')
        .isInt().withMessage('El campo amount_in_cents debe ser un número entero')
        .isFloat({ float: false }).withMessage('El campo amount_in_cents no debe contener decimales'),
    check('reason')
        .exists()
        .withMessage('El campo reason es requerido'),
    check('transaction_id')
        .exists()
        .withMessage('El campo reason es requerido'),
    (req, res, next) => {
        validateResult(req, res, next)
    }
  
]

module.exports = {
    validateTarjeta,
    validateTransaction,
    validateFuentePAgo,
    validateRefund,
    validateFuentePagoNequi
}