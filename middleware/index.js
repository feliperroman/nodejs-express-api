// =============================================================================
// PACKAGES
// =============================================================================
const jwt = require("jsonwebtoken");
// =============================================================================
// HELPERS
// =============================================================================
// =============================================================================
// SERVICES
// =============================================================================
// =============================================================================
// REST FUNCTIONS
// =============================================================================
function isValidToken(req, res, next) {
  try {
    let token = req.get("token");
    if (token) {
      jwt.verify(token, process.env.SEED, (err, decode) => {
        if (err) {
          return res.status(501).json("Token no valido o expirado");
        }
        req.user = {
          email: decode.user,
          tipo: decode.tipo,
          id: decode.id
        }
        next();
      });
    } else {
      return res.status(501).json("Token no incluido");
    }
  } catch (error) {
    console.log(" isValidToken ~ error:", error)

  }
}

module.exports = {
  isValidToken
};