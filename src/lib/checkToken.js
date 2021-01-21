const jwt = require("jsonwebtoken");
const jwtKey = process.env.JWT_KEY
class Token{
    constructor() {}
    authenticateToken(req, res, next) {
  
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.status(403).json({message: 'You have no authorization to enter here'})
        jwt.verify(token, jwtKey, (err, data) => {
          if (err) return res.status(403).json({message: 'You have no authorization to enter here'})
          req.userId = data.id_user
          next() 
        })
      }
}
module.exports = Token