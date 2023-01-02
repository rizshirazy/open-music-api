const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration = null,
    albumId = null,
  }) {
    console.log(albumId);
    if (albumId) {
      const albumQuery = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [albumId],
      };

      const album = await this._pool.query(albumQuery);
      if (album.rows.length !== 1) {
        throw new NotFoundError(
          'Gagal menambahkan lagu. Album tidak ditemukan'
        );
      }
    }

    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    console.log(result);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query({ text: 'SELECT * FROM songs' });

    return result.rows;
  }

  async getSongById(id) {
    const result = await this._pool.query({
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows;
  }

  async editSongById(
    id,
    { title, year, genre, performer, duration = null, albumId = null }
  ) {
    if (albumId) {
      const album = await this._pool.query({
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [albumId],
      });

      if (album.rows.length !== 1) {
        throw new NotFoundError(
          'Gagal memperbarui lagu. Album tidak ditemukan'
        );
      }
    }

    const result = await this._pool.query({
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumId = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Album tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const result = await this._pool.query({
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus lagu. Data tidak ditemukan');
    }
  }
}

module.exports = SongsService;
