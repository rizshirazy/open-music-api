require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const albums = require('./api/albums');
const authentications = require('./api/authentications');
const collaborations = require('./api/collaborations');
const playlists = require('./api/playlists');
const songs = require('./api/songs');
const users = require('./api/users');
const _exports = require('./api/exports');

const ClientError = require('./exceptions/ClientError');
const AlbumsService = require('./services/postgres/AlbumsService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const PlaylistActivitiesService = require('./services/postgres/PlaylistActivitiesService');
const PlaylistsService = require('./services/postgres/PlaylistService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const StorageService = require('./services/S3/StorageService');
const CacheService = require('./services/redis/CacheService');

const TokenManager = require('./tokenize/TokenManager');
const AlbumsValidator = require('./validator/albums');
const AuthenticationsValidator = require('./validator/authentications');
const CollaborationsValidator = require('./validator/collaborations');
const PlaylistsValidator = require('./validator/playlists');
const SongsValidator = require('./validator/songs');
const UsersValidatior = require('./validator/users');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

const init = async () => {
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
  const cacheService = new CacheService();
  const albumsService = new AlbumsService(cacheService);
  const songsService = new SongsService();
  const collaborationsService = new CollaborationsService(usersService);
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistActivitesService = new PlaylistActivitiesService();
  const storageService = new StorageService();

  const server = Hapi.server({
    port: process.env.PORT || '5000',
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusicapi_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        albumsService,
        storageService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        songsService,
        albumsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidatior,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        playlistsService,
        playlistActivitesService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        producerService: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        return h
          .response({
            status: 'fail',
            message: response.message,
          })
          .code(response.statusCode);
      }

      if (!response.isServer) {
        return h.continue;
      }

      return h
        .response({
          status: 'error',
          message: 'Terjadi kegagalan pada server kami',
        })
        .code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
