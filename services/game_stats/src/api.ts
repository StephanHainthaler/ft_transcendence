import { ApiError } from '@server/error/apiError';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as logic from './logic';
import { MatchSubmissionData } from '@shared/game_stats'
import { UserStats } from '@shared/game_stats';

function safeParseInt(value: any, name: string, min: number = 0): number
{
	const nb = parseInt(value);
	if (isNaN(nb) || nb < min)
	{
		throw new ApiError({ 
			message: `Invalid or missing parameter: ${name}. Must be an integer >= ${min}.`, 
			code: 400 
		});
	}
	return (nb);
}

function handleControllerError(e: any, reply: FastifyReply, request: FastifyRequest) {
	let status = 500;
	let message = 'Internal server error';
	if (e instanceof ApiError)
	{
		status = e.code;
		message = e.message;
		request.log.warn(`Client/Logic Error ${status}: ${message}`);
	}
	else if (e instanceof Error)
		request.log.error(e, `Unhandled exception from logic/DB, returning ${status}`);
	else
		request.log.error(e, `Unhandled error in controller, returning ${status}`);
	return reply.status(status).send({ success: false, message });
}

export const GameStatsControllers = {

	getUserStatsHandler: async (request: FastifyRequest, reply: FastifyReply) =>
	{
		try {
			const params = request.params as { userId: string };
			const userId = safeParseInt(params.userId, 'userId', 1);
			const stats = logic.getUserStats(userId);
			return reply.status(200).send(stats || { user_id: userId, wins: 0, losses: 0, rank: 1000, total_points: 0, highest_score: 0, streak: 0 } as UserStats);
		} catch (e: any) {
			return handleControllerError(e, reply, request);
		}
	},
	
	getUserMatchHistoryHandler: async (request: FastifyRequest, reply: FastifyReply) =>
	{
		try {
			const params = request.params as { userId: string };
			const query = request.query as { page: string };
			const userId = safeParseInt(params.userId, 'userId', 1);
			const page = safeParseInt(query.page || '1', 'page', 1); 
			const history = logic.getUserMatchHistory(userId, page);
			return reply.status(200).send(history || []);
		} catch (e: any) {
			return handleControllerError(e, reply, request);
		}
	},
	
	getLeaderboardHandler: async (request: FastifyRequest, reply: FastifyReply) =>
	{
		try {
			const query = request.query as { page: string };
			const page = safeParseInt(query.page || '1', 'page', 1); 
			const leaderboard = logic.getLeaderboard(page);
			return reply.status(200).send(leaderboard || []);
		} catch (e: any) {
			return handleControllerError(e, reply, request);
		}
	},

	recordMatchHandler: async (request: FastifyRequest, reply: FastifyReply) =>
	{
		try {
			const body = request.body as any;
			const data: MatchSubmissionData = {
				player_one_id: safeParseInt(body.player_one_id, 'player_one_id', 0),
				player_two_id: safeParseInt(body.player_two_id, 'player_two_id', 0),
				winner_id: safeParseInt(body.winner_id, 'winner_id', 1),
				p1_score: safeParseInt(body.p1_score, 'p1_score', 0),
				p2_score: safeParseInt(body.p2_score, 'p2_score', 0),
				duration: safeParseInt(body.duration || 0, 'duration', 0),
				timestamp: safeParseInt(body.timestamp || 0, 'timestamp', 0) //ADDED BY STEPHAN
			};
			if (data.player_one_id === data.player_two_id)
				throw new ApiError({ message: 'Players must be different.', code: 400 });
			if (data.winner_id !== data.player_one_id && data.winner_id !== data.player_two_id)
				throw new ApiError({ message: 'Winner ID must match one of the players.', code: 400 });
			logic.recordMatch(data);
			return reply.status(201).send({ message: 'Match recorded successfully' });
		} catch (e: any) {
			return handleControllerError(e, reply, request);
		}
	}
};