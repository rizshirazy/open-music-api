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
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(title = '', performer = '') {
    const { rows } = await this._pool
      .query({
        text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 and performer ILIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      })
      .catch((e) => console.error(e));

    return rows;
  }

  async getSongById(id) {
    const result = await this._pool.query({
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async editSongById(
    id,
    { title, year, genre, performer, duration = null, albumId = null },
  ) {
    const result = await this._pool
      .query({
        text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
        values: [title, year, genre, performer, duration, albumId, id],
      })
      .catch((e) => {
        console.error(e.message);
      });

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu. Album tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const result = await this._pool.query({
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu. Data tidak ditemukan');
    }
  }
}

module.exports = SongsService;
