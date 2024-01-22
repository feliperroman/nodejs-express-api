const { validationResult } = require('express-validator')
module.exports = {

  validateResult(req,res, next){
    try {
        validationResult(req).throw()
        return next()
    } catch (error) {
        res.status(403)
        res.send({err: error.array()})
    }
  },
  /**
   * Middleware para proteger las rutas que necesitan autenticacion de usuario.
   * @param {*} req 
   * @param {*} res 
   * @param {Function} next callback 
   * @returns 
   */
 
}
