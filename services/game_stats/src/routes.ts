import { FastifyInstance } from 'fastify';
import { GameStatsControllers } from './api';

/**
* Register all routes for the Game Stats microservice.
* !!! Currently routes are NOT protected !!!
*/
export async function gameStatsRoutes(fastify: FastifyInstance)
{
    fastify.get('/user/:userId', GameStatsControllers.getUserStatsHandler);
    fastify.get('/history/:userId', GameStatsControllers.getUserMatchHistoryHandler);
    fastify.get('/leaderboard', GameStatsControllers.getLeaderboardHandler);
    fastify.post('/match', GameStatsControllers.recordMatchHandler);
}