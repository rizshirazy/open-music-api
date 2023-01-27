const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const result = await this._pool.query({
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    });

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const { rows } = await this._pool.query({
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p
             LEFT JOIN collaborations c ON c.playlist_id = p.id
             LEFT JOIN users u ON p.owner = u.id
             WHERE p.owner = $1 OR c.user_id = $1
             GROUP BY p.id, u.username
            `,
      values: [userId],
    });

    return rows;
  }

  async deletePlaylistById(id) {
    const result = await this._pool.query({
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist. Data tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const result = await this._pool.query({
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(
          playlistId,
          userId,
        );
      } catch {
        throw error;
      }
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    await this.getPlaylistById(playlistId);

    const id = `playlist_song-${nanoid(16)}`;

    const result = await this._pool.query({
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getPlaylistById(id) {
    const playlist = await this._pool.query({
      text: `SELECT p.id, p.name, u.username 
             FROM playlists p
             JOIN users u ON p.owner = u.id 
             WHERE p.id = $1`,
      values: [id],
    });

    if (!playlist.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    return playlist.rows[0];
  }

  async getPlaylistWithSongsById(id) {
    const playlist = await this.getPlaylistById(id);

    const { rows } = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer
            FROM songs
            RIGHT JOIN playlist_songs ON songs.id = playlist_songs.song_id
            WHERE playlist_id = $1`,
      values: [playlist.id],
    });

    return { ...playlist, songs: rows };
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    await this.getPlaylistById(playlistId);

    const result = await this._pool.query({
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu. Data tidak ditemukan');
    }
  }
}

module.exports = PlaylistsService;
