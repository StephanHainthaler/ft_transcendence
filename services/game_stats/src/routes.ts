import { FastifyInstance } from 'fastify';
import { GameStatsControllers } from './api';

/**
* Register all routes for the Game Stats microservice.
* !!! Currently routes are NOT protected !!!
*/

export async function gameStatsRoutes(fastify: FastifyInstance)
{
    fastify.get(
        '/stats/:userId', 
        GameStatsControllers.getUserStatsHandler
    );
    fastify.get(
        '/history/:userId', 
        GameStatsControllers.getUserMatchHistoryHandler
    );
    fastify.get(
        '/leaderboard', 
        // Немає preHandler
        GameStatsControllers.getLeaderboardHandler
    );
    fastify.post(
        '/match',
        GameStatsControllers.recordMatchHandler
    );
}