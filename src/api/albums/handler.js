class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { name, year } = request.payload;
    const albumId = await this._albumsService.addAlbum({ name, year });
    return h
      .response({
        status: 'success',
        data: {
          albumId,
        },
      })
      .code(201);
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);

    return h.response({
      status: 'success',
      data: {
        album,
      },
    });
  }

  async putAlbumByIdHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const { id } = request.params;
    const { name, year } = request.payload;

    await this._albumsService.editAlbumById(id, { name, year });

    return h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);
    return h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;

    await this._validator.validateAlbumCoverHeader(cover.hapi.headers);
    await this._albumsService.verifyAlbumExists(id);

    const coverUrl = await this._storageService.writeFile(
      cover,
      cover.hapi,
      id,
    );

    await this._albumsService.editAlbumCoverById(id, coverUrl);

    return h
      .response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
      })
      .code(201);
  }

  async likeAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    const { userId } = request.auth.credentials;

    const likeExist = await this._albumsService.likeAlbum(userId, albumId);

    return h
      .response({
        status: 'success',
        message: likeExist ? 'Batal menyukai album' : 'Berhasil menyukai album',
      })
      .code(201);
  }

  async getAlbumLikesByIdHandler(request, h) {
    const { id } = request.params;

    const { likes, isCache } = await this._albumsService.getAlbumLikes(id);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (isCache) {
      response.header('X-Data-Source', 'cache');
    }
    return response;
  }
}

module.exports = AlbumsHandler;
