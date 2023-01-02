class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);

    const { title, year, genre, performer, duration, albumId } =
      request.payload;

    const songId = await this._service.addSong({
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

  async getSongsHandler(h) {
    const songs = await this._service.getSongs();

    return h.response({
      status: 'sucess',
      data: {
        songs,
      },
    });
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._service.getSongById(id);
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

    await this._service.editSongById(id, {
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

    await this._service.deleteSongById(id);

    return h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });
  }
}

module.exports = SongsHandler;
