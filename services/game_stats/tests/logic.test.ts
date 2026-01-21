import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { getDb, setDb, user_stats_table, match_history_table } from "../src/database";
import {
  recordMatch,
  getUserStats,
  getLeaderboard,
  updateStatsForUser,
  getUserMatchHistory,
  getMatchStats,
  MATCHES_PER_PAGE,
  USERS_PER_PAGE,
} from "../src/logic";
import { UserStats, MatchSubmissionData, MatchHistoryEntry } from "@shared/game_stats";
import { DB } from "@server/orm";

interface Schema {
  user_stats: UserStats;
  match_history: MatchHistoryEntry;
}

function setupInMemoryDb() {
  const db = new DB<Schema>();
  db.open(":memory:");
  db.create([user_stats_table, match_history_table]);
  setDb(db);
  return db;
}

describe("getUserStats", () => {
  beforeEach(() => {
    setupInMemoryDb();
  });

  test("should return null for non-existent user", () => {
    const stats = getUserStats(99999);
    assert.strictEqual(stats, null);
  });

  test("should return stats for existing user", () => {
    const db = getDb();
    db.from("user_stats").insert({
      user_id: 1,
      wins: 5,
      losses: 3,
      streak: 2,
      total_points: 100,
      rank: 1050,
      highest_score: 25,
    }).run();

    const stats = getUserStats(1);

    assert.ok(stats);
    assert.strictEqual(stats.user_id, 1);
    assert.strictEqual(stats.wins, 5);
    assert.strictEqual(stats.losses, 3);
    assert.strictEqual(stats.streak, 2);
    assert.strictEqual(stats.total_points, 100);
    assert.strictEqual(stats.rank, 1050);
    assert.strictEqual(stats.highest_score, 25);
  });
});

describe("updateStatsForUser - New User", () => {
  beforeEach(() => {
    setupInMemoryDb();
  });

  test("should create stats for new winner with correct initial values", () => {
    updateStatsForUser(1, true, 10);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.wins, 1);
    assert.strictEqual(stats.losses, 0);
    assert.strictEqual(stats.streak, 1);
    assert.strictEqual(stats.total_points, 10);
    assert.strictEqual(stats.rank, 1010); // 1000 + 10
    assert.strictEqual(stats.highest_score, 10);
  });

  test("should create stats for new loser with correct initial values", () => {
    updateStatsForUser(1, false, 5);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.wins, 0);
    assert.strictEqual(stats.losses, 1);
    assert.strictEqual(stats.streak, 0);
    assert.strictEqual(stats.total_points, 5);
    assert.strictEqual(stats.rank, 995); // 1000 - 5
    assert.strictEqual(stats.highest_score, 5);
  });
});

describe("updateStatsForUser - Existing User", () => {
  beforeEach(() => {
    const db = setupInMemoryDb();
    db.from("user_stats").insert({
      user_id: 1,
      wins: 5,
      losses: 3,
      streak: 2,
      total_points: 100,
      rank: 1050,
      highest_score: 25,
    }).run();
  });

  test("should increment wins and streak on win", () => {
    updateStatsForUser(1, true, 15);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.wins, 6);
    assert.strictEqual(stats.losses, 3);
    assert.strictEqual(stats.streak, 3);
    assert.strictEqual(stats.rank, 1060);
  });

  test("should increment losses and reset streak on loss", () => {
    updateStatsForUser(1, false, 8);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.wins, 5);
    assert.strictEqual(stats.losses, 4);
    assert.strictEqual(stats.streak, 0);
    assert.strictEqual(stats.rank, 1045);
  });

  test("should update highest_score when new score is higher", () => {
    updateStatsForUser(1, true, 50);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.highest_score, 50);
  });

  test("should not update highest_score when new score is lower", () => {
    updateStatsForUser(1, true, 10);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.highest_score, 25);
  });

  test("should accumulate total_points", () => {
    updateStatsForUser(1, true, 20);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.total_points, 120);
  });
});

describe("recordMatch", () => {
  beforeEach(() => {
    const db = setupInMemoryDb();
    // Pre-create user stats
    db.from("user_stats").insert({ user_id: 1, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();
    db.from("user_stats").insert({ user_id: 2, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();
  });

  test("should record match and update both player stats", () => {
    const matchData: MatchSubmissionData = {
      player_one_id: 1,
      player_two_id: 2,
      winner_id: 1,
      p1_score: 10,
      p2_score: 5,
      duration: 120,
    };

    const matchId = recordMatch(matchData);

    assert.ok(matchId);

    const stats1 = getUserStats(1);
    const stats2 = getUserStats(2);

    assert.strictEqual(stats1!.wins, 1);
    assert.strictEqual(stats1!.losses, 0);
    assert.strictEqual(stats2!.wins, 0);
    assert.strictEqual(stats2!.losses, 1);
  });

  test("should correctly assign winner when player_two wins", () => {
    const matchData: MatchSubmissionData = {
      player_one_id: 1,
      player_two_id: 2,
      winner_id: 2,
      p1_score: 3,
      p2_score: 10,
      duration: 90,
    };

    recordMatch(matchData);

    const stats1 = getUserStats(1);
    const stats2 = getUserStats(2);

    assert.strictEqual(stats1!.wins, 0);
    assert.strictEqual(stats1!.losses, 1);
    assert.strictEqual(stats2!.wins, 1);
    assert.strictEqual(stats2!.losses, 0);
  });

  test("should handle zero duration", () => {
    const matchData: MatchSubmissionData = {
      player_one_id: 1,
      player_two_id: 2,
      winner_id: 1,
      p1_score: 5,
      p2_score: 0,
      duration: 0,
    };

    const matchId = recordMatch(matchData);
    assert.ok(matchId);
  });
});

describe("getMatchStats", () => {
  beforeEach(() => {
    const db = setupInMemoryDb();
    db.from("user_stats").insert({ user_id: 1, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();
    db.from("user_stats").insert({ user_id: 2, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();
  });

  test("should return null for non-existent match", () => {
    const match = getMatchStats(99999);
    assert.strictEqual(match, null);
  });

  test("should return match details for existing match", () => {
    const matchData: MatchSubmissionData = {
      player_one_id: 1,
      player_two_id: 2,
      winner_id: 1,
      p1_score: 10,
      p2_score: 7,
      duration: 180,
    };

    const matchId = recordMatch(matchData);
    const match = getMatchStats(Number(matchId));

    assert.ok(match);
    assert.strictEqual(match.player_one_id, 1);
    assert.strictEqual(match.player_two_id, 2);
    assert.strictEqual(match.winner_id, 1);
    assert.strictEqual(match.p1_score, 10);
    assert.strictEqual(match.p2_score, 7);
  });
});

describe("getUserMatchHistory", () => {
  beforeEach(() => {
    const db = setupInMemoryDb();
    db.from("user_stats").insert({ user_id: 1, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();
    db.from("user_stats").insert({ user_id: 2, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();
    db.from("user_stats").insert({ user_id: 3, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();
  });

  test("should return empty array for user with no matches", () => {
    const history = getUserMatchHistory(1, 1);
    assert.ok(Array.isArray(history));
    assert.strictEqual(history.length, 0);
  });

  test("should return matches where user is player_one", () => {
    recordMatch({ player_one_id: 1, player_two_id: 2, winner_id: 1, p1_score: 5, p2_score: 3, duration: 60 });

    const history = getUserMatchHistory(1, 1);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].player_one_id, 1);
  });

  test("should return matches where user is player_two", () => {
    recordMatch({ player_one_id: 2, player_two_id: 1, winner_id: 2, p1_score: 5, p2_score: 3, duration: 60 });

    const history = getUserMatchHistory(1, 1);
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].player_two_id, 1);
  });

  test("should not return matches user did not participate in", () => {
    recordMatch({ player_one_id: 2, player_two_id: 3, winner_id: 2, p1_score: 5, p2_score: 3, duration: 60 });

    const history = getUserMatchHistory(1, 1);
    assert.strictEqual(history.length, 0);
  });

  test("should paginate results correctly", () => {
    // Create more matches than MATCHES_PER_PAGE
    for (let i = 0; i < MATCHES_PER_PAGE + 2; i++) {
      recordMatch({ player_one_id: 1, player_two_id: 2, winner_id: 1, p1_score: 5, p2_score: 3, duration: 60 });
    }

    const page1 = getUserMatchHistory(1, 1);
    const page2 = getUserMatchHistory(1, 2);

    assert.strictEqual(page1.length, MATCHES_PER_PAGE);
    assert.strictEqual(page2.length, 2);
  });
});

describe("getLeaderboard", () => {
  beforeEach(() => {
    setupInMemoryDb();
  });

  test("should return empty array when no users", () => {
    const leaderboard = getLeaderboard(1);
    assert.ok(Array.isArray(leaderboard));
    assert.strictEqual(leaderboard.length, 0);
  });

  test("should sort by rank descending", () => {
    const db = getDb();
    db.from("user_stats").insert({ user_id: 1, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 900, highest_score: 0 }).run();
    db.from("user_stats").insert({ user_id: 2, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1100, highest_score: 0 }).run();
    db.from("user_stats").insert({ user_id: 3, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();

    const leaderboard = getLeaderboard(1);

    assert.strictEqual(leaderboard[0].user_id, 2); // Highest rank
    assert.strictEqual(leaderboard[1].user_id, 3);
    assert.strictEqual(leaderboard[2].user_id, 1); // Lowest rank
  });

  test("should paginate correctly", () => {
    const db = getDb();
    for (let i = 1; i <= USERS_PER_PAGE + 3; i++) {
      db.from("user_stats").insert({ user_id: i, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000 + i, highest_score: 0 }).run();
    }

    const page1 = getLeaderboard(1);
    const page2 = getLeaderboard(2);

    assert.strictEqual(page1.length, USERS_PER_PAGE);
    assert.strictEqual(page2.length, 3);
  });
});

describe("Edge Cases", () => {
  beforeEach(() => {
    setupInMemoryDb();
  });

  test("should handle score of zero", () => {
    updateStatsForUser(1, true, 0);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.total_points, 0);
    assert.strictEqual(stats.highest_score, 0);
  });

  test("should handle very large scores", () => {
    updateStatsForUser(1, true, 999999);

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.strictEqual(stats.total_points, 999999);
    assert.strictEqual(stats.highest_score, 999999);
  });

  test("rank should not go below zero after many losses", () => {
    const db = getDb();
    db.from("user_stats").insert({ user_id: 1, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 10, highest_score: 0 }).run();

    // 10 losses at -5 each should bring rank to 0, not negative
    for (let i = 0; i < 10; i++) {
      updateStatsForUser(1, false, 0);
    }

    const stats = getUserStats(1);
    assert.ok(stats);
    assert.ok(stats.rank >= 0, "Rank should not be negative");
  });

  test("should handle page number 0 gracefully", () => {
    const db = getDb();
    db.from("user_stats").insert({ user_id: 1, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();

    // Page 0 would result in negative offset, which might cause issues
    const leaderboard = getLeaderboard(0);
    // Should either return results or empty array, not crash
    assert.ok(Array.isArray(leaderboard));
  });

  test("should handle very large page numbers", () => {
    const db = getDb();
    db.from("user_stats").insert({ user_id: 1, wins: 0, losses: 0, streak: 0, total_points: 0, rank: 1000, highest_score: 0 }).run();

    const leaderboard = getLeaderboard(9999);
    assert.ok(Array.isArray(leaderboard));
    assert.strictEqual(leaderboard.length, 0);
  });
});
