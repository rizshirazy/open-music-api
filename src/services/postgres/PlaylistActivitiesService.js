const { nanoid } = require('nanoid');
const { Pool } = require('pg');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity({ playlistId, songId, userId, action }) {
    const id = `ps-activity-${nanoid(16)}`;
    const time = new Date().toISOString();

    await this._pool.query({
      text: `INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
      values: [id, playlistId, songId, userId, action, time],
    });
  }

  async addSongToPlaylist({ playlistId, songId, userId }) {
    await this.addActivity({ playlistId, songId, userId, action: 'add' });
  }

  async removeSongFromPlaylist({ playlistId, songId, userId }) {
    await this.addActivity({ playlistId, songId, userId, action: 'delete' });
  }

  async getPlaylistActivitiesById(id) {
    const { rows } = await this._pool.query({
      text: `SELECT u.username, s.title, action, time
            FROM playlist_song_activities psa
            JOIN users u ON u.id = psa.user_id
            JOIN songs s ON s.id = psa.song_id
            WHERE playlist_id = $1`,
      values: [id],
    });

    return rows;
  }
}

module.exports = PlaylistActivitiesService;
