const Joi = require('joi');

const PlaylistsPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostSongToPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

const DeleteSongFromPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PlaylistsPayloadSchema,
  PostSongToPlaylistPayloadSchema,
  DeleteSongFromPlaylistPayloadSchema,
};
