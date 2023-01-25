class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { userId: owner } = request.auth.credentials;
    const { name } = request.payload;

    const playlistId = await this._service.addPlaylist({ name, owner });

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

    const playlists = await this._service.getPlaylists(userId);

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
    await this._service.verifyPlaylistOwner(playlistId, userId);

    await this._service.deletePlaylistById(playlistId);

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

    await this._service.verifyPlaylistOwner(playlistId, userId);

    await this._service.addSongToPlaylist(playlistId, songId);

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

    await this._service.verifyPlaylistOwner(playlistId, userId);

    const playlist = await this._service.getPlaylistWithSongsById(playlistId);

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

    await this._service.verifyPlaylistOwner(playlistId, userId);

    await this._service.deleteSongFromPlaylist(playlistId, songId);

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });
  }
}

module.exports = PlaylistsHandler;
