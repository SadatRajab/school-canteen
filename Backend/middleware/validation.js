const Joi = require('joi');

/**
 * Validation schemas for request bodies
 */

// Product validation
const productSchema = Joi.object({
    nameAr: Joi.string().required().trim().min(1),
    nameEn: Joi.string().required().trim().min(1),
    descAr: Joi.string().allow('').trim(),
    descEn: Joi.string().allow('').trim(),
    price: Joi.number().required().min(0),
    category: Joi.string().trim(),
    imageUrl: Joi.string().allow('').trim(),
    isAvailable: Joi.boolean()
});

// Order creation validation
const createOrderSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                productId: Joi.string().required().length(24).hex(),
                quantity: Joi.number().integer().required().min(1)
            })
        )
        .required()
        .min(1),
    // Explicitly reject any paymentMethod from client
    paymentMethod: Joi.forbidden()
});

// Admin login validation
const adminLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6)
});

/**
 * Validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        next();
    };
};

module.exports = {
    validate,
    productSchema,
    createOrderSchema,
    adminLoginSchema
};
