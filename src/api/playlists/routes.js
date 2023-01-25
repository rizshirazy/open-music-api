const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: (request, h) => handler.postPlaylistHandler(request, h),
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: (request, h) => handler.getPlaylistsHandler(request, h),
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: (request, h) => handler.deletePlaylistByIdHandler(request, h),
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.postSongToPlaylistByIdHandler(request, h),
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: (request, h) => handler.getPlaylistByIdWithSongHandler(request, h),
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: (request, h) =>
      handler.deleteSongFromPlaylistByIdHandler(request, h),
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{id}/activities',
    handler: (request, h) =>
      handler.getPlaylistActivitesByIdHandler(request, h),
    options: {
      auth: 'openmusicapi_jwt',
    },
  },
];

module.exports = routes;
