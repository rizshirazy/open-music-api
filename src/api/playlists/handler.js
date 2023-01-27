class PlaylistsHandler {
  constructor(
    playlistsService,
    playlistActivitesService,
    songsService,
    validator,
  ) {
    this._playlistsService = playlistsService;
    this._playlistActivitesService = playlistActivitesService;
    this._songsService = songsService;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { userId: owner } = request.auth.credentials;
    const { name } = request.payload;

    const playlistId = await this._playlistsService.addPlaylist({
      name,
      owner,
    });

    return h
      .response({
        status: 'success',
        data: {
          playlistId,
        },
      })
      .code(201);
  }

  async getPlaylistsHandler(request, h) {
    const { userId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylists(userId);

    return h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    await this._playlistsService.deletePlaylistById(playlistId);

    return h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });
  }

  async postSongToPlaylistByIdHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayloadSchema(request.payload);

    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.getSongById(songId);

    await this._playlistsService.addSongToPlaylist(playlistId, songId);

    await this._playlistActivitesService.addSongToPlaylist({
      playlistId,
      songId,
      userId,
    });

    return h
      .response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan',
      })
      .code(201);
  }

  async getPlaylistByIdWithSongHandler(request, h) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const playlist = await this._playlistsService.getPlaylistWithSongsById(
      playlistId,
    );

    return h.response({
      status: 'success',
      data: {
        playlist,
      },
    });
  }

  async deleteSongFromPlaylistByIdHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayloadSchema(request.payload);

    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);
    await this._songsService.getSongById(songId);

    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    await this._playlistActivitesService.removeSongFromPlaylist({
      playlistId,
      songId,
      userId,
    });

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });
  }

  async getPlaylistActivitesByIdHandler(request, h) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

    const activities =
      await this._playlistActivitesService.getPlaylistActivitiesById(
        playlistId,
      );

    return h.response({
      status: 'success',
      data: { playlistId, activities },
    });
  }
}

module.exports = PlaylistsHandler;
