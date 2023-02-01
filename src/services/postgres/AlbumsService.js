const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
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

  async editAlbumById(id, { name, year }) {
    const { rowCount } = await this._pool.query({
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    });

    if (!rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Data tidak ditemukan');
    }
  }

  async editAlbumCoverById(id, coverUrl) {
    const { rowCount } = await this._pool.query({
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
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

  async likeAlbum(userId, albumId) {
    await this.verifyAlbumExists(albumId);

    const { rowCount } = await this._pool.query({
      text: 'SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });

    if (rowCount) {
      await this._pool.query({
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
        values: [userId, albumId],
      });
    } else {
      const id = `likes-${nanoid(16)}`;
      await this._pool.query({
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, userId, albumId],
      });
    }

    await this._cacheService.delete(`likes:${albumId}`);
    return rowCount;
  }

  async getAlbumLikes(albumId) {
    await this.verifyAlbumExists(albumId);

    try {
      const likes = await this._cacheService.get(`likes:${albumId}`);
      return {
        likes: parseInt(likes, 10),
        isCache: true,
      };
    } catch (error) {
      const { rowCount: likes } = await this._pool.query({
        text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      });

      await this._cacheService.set(`likes:${albumId}`, likes);

      return {
        likes,
      };
    }
  }
}

module.exports = AlbumsService;
