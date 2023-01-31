const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class AlbumsService {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const { rows, rowCount } = await this._pool.query({
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    });

    if (!rowCount) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const { rows, rowCount } = await this._pool.query(query);

    if (!rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const songs = await this._pool.query({
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [rows[0].id],
    });

    return { ...rows.map(mapDBToModel)[0], songs: songs.rows };
  }

  async editAlbumById(id, { name, year, coverUrl }) {
    const { rowCount } = await this._pool.query({
      text: 'UPDATE albums SET name = $1, year = $2, cover_url = $3 WHERE id = $4 RETURNING id',
      values: [name, year, coverUrl, id],
    });

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Data tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const { rowCount } = await this._pool.query({
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!rowCount) {
      throw new NotFoundError('Gagal menghapus album. Data tidak ditemukan');
    }
  }

  async verifyAlbumExists(id) {
    const album = await this._pool.query({
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    });

    if (album.rowCount !== 1) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
