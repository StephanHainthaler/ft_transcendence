import { ApiError } from '@server/error/apiError';
import { FastifyReply, FastifyRequest } from 'fastify';
import * as logic from './logic';
import { MatchSubmissionData } from '@shared/game_stats'

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

export const GameStatsControllers = {

    /** GET /stats/:userId: Отримує статистику користувача. */
    getUserStatsHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { userId: string };
        const userId = safeParseInt(params.userId, 'userId', 1);

        const stats = logic.getUserStats(userId);
        
        // Повертаємо дефолтні значення, якщо гравець новий
        return stats || { user_id: userId, wins: 0, losses: 0, rank: 1000, total_points: 0, highest_score: 0, streak: 0 };
    },
    
    /** GET /history/:userId?page=N: Отримує пагіновану історію матчів. */
    getUserMatchHistoryHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        const params = request.params as { userId: string };
        const query = request.query as { page: string };
        
        const userId = safeParseInt(params.userId, 'userId', 1);
        const page = safeParseInt(query.page || '1', 'page', 1); 

        const history = logic.getUserMatchHistory(userId, page);
        
        return history || [];
    },
    
    /** GET /leaderboard?limit=N: Отримує глобальний рейтинг. */
    getLeaderboardHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        const query = request.query as { limit: string };
        
        const limit = safeParseInt(query.limit || '10', 'limit', 1); 

        const leaderboard = logic.(limit);
        
        return leaderboard || [];
    },

    /** POST /match: Записує результат нового матчу та оновлює статистику. */
    recordMatchHandler: async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;

        // --- Валідація тіла запиту ---
        const data: MatchSubmissionData = {
            player_one_id: safeParseInt(body.player_one_id, 'player_one_id', 1),
            player_two_id: safeParseInt(body.player_two_id, 'player_two_id', 1),
            winner_id: safeParseInt(body.winner_id, 'winner_id', 1),
            loser_id: body.winner_id === body.player_one_id ? body.player_two_id : body.player_one_id,
            p1_score: safeParseInt(body.p1_score, 'p1_score', 0),
            p2_score: safeParseInt(body.p2_score, 'p2_score', 0),
            duration: safeParseInt(body.duration || 0, 'duration', 0),
        };

        if (data.player_one_id === data.player_two_id) {
            throw new ApiError({ message: 'Players must be different.', code: 400 });
        }
        if (data.winner_id !== data.player_one_id && data.winner_id !== data.player_two_id) {
             throw new ApiError({ message: 'Winner ID must match one of the players.', code: 400 });
        }

        // --- Виклик Бізнес-Логіки ---
        logic.recordMatch(data);
        
        return reply.status(201).send({ message: 'Match recorded successfully' });
    }
};