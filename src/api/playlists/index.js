const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (
    server,
    { playlistsService, playlistActivitesService, validator },
  ) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      playlistActivitesService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
