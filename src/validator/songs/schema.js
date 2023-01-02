const Joi = require('joi');

const currentYear = new Date().getFullYear();

const SongsPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(currentYear).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().optional(),
  albumId: Joi.string().optional(),
});

module.exports = { SongsPayloadSchema };
