import { FastifyInstance } from 'fastify';
import { GameStatsControllers } from './api';

export async function gameStatsRoutes(fastify: FastifyInstance)
{
    fastify.get('/user/:userId', GameStatsControllers.getUserStatsHandler);
    fastify.get('/history/:userId', GameStatsControllers.getUserMatchHistoryHandler);
    fastify.get('/leaderboard', GameStatsControllers.getLeaderboardHandler);
    fastify.post('/match', GameStatsControllers.recordMatchHandler);
}