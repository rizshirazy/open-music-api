const InvariantError = require('../../exceptions/InvariantError');
const { UserPayloadSchema } = require('./schema');

const UsersValidatior = {
  validateUserPayload: (payload) => {
    const validationResult = UserPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidatior;
