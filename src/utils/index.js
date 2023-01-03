/* eslint-disable camelcase */

const NotFoundError = require('../exceptions/NotFoundError');

const isAlbumExists = async (id, pool) => {
  if (id !== null) {
    const album = await pool.query({
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    });

    if (album.rows.length !== 1) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
};

const mapSongResponse = (song) => ({
  id: song.id,
  title: song.title,
  performer: song.performer,
});

module.exports = { isAlbumExists, mapSongResponse };
