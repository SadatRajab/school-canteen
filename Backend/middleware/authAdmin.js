const jwt = require('jsonwebtoken');

/**
 * Middleware to protect admin routes
 * Verifies JWT token and ensures user is authenticated
 */
const protectAdmin = async (req, res, next) => {
    try {
        let token;

        // Extract token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach admin info to request
            req.admin = {
                email: decoded.email,
                iat: decoded.iat,
                exp: decoded.exp
            };

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired'
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = protectAdmin;
