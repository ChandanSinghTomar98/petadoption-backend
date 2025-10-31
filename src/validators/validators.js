const { body } = require('express-validator');

exports.registerValidator = [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

exports.petCreateValidator = [
  body('name').notEmpty().withMessage('Name required'),
  body('species').notEmpty().withMessage('Species required')
];

exports.applyValidator = [
  body('petId').notEmpty().withMessage('petId is required'),
];
