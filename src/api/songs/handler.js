class SongsHandler {
  constructor(songsService, albumsService, validator) {
    this._songsService = songsService;
    this._albumsService = albumsService;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { title, year, genre, performer, duration, albumId } =
      request.payload;

    if (albumId) {
      await this._albumsService.verifyAlbumExists(albumId);
    }

    const songId = await this._songsService.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    return h
      .response({
        status: 'success',
        data: {
          songId,
        },
      })
      .code(201);
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    const songs = await this._songsService.getSongs(title, performer);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._songsService.getSongById(id);
    return h.response({
      status: 'success',
      data: {
        song,
      },
    });
  }

  async putSongByIdHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { id } = request.params;
    const { title, year, genre, performer, duration, albumId } =
      request.payload;

    if (albumId) {
      await this._albumsService.verifyAlbumExists(albumId);
    }

    await this._songsService.editSongById(id, {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    });

    return h.response({
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    });
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._songsService.deleteSongById(id);

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });
  }
}

module.exports = SongsHandler;
