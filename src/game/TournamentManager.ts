import type {
    TournamentType,
    TournamentState,
    MatchResult,
    EntityType
} from '../types/game';

export class TournamentManager {
    static getInitialState(type: TournamentType = 'single'): TournamentState {
        return {
            type,
            currentRound: 1,
            wins: { rock: 0, paper: 0, scissors: 0 },
            history: [],
            champion: null,
            stats: {
                totalRounds: 0,
                averageRoundTime: 0,
                longestRound: 0,
                shortestRound: 0,
                champion: null
            }
        };
    }

    static getWinsNeeded(type: TournamentType): number {
        switch (type) {
            case 'bo3': return 2;
            case 'bo5': return 3;
            case 'bo7': return 4;
            default: return 1;
        }
    }

    static addRoundResult(
        state: TournamentState,
        winner: EntityType,
        duration: number
    ): TournamentState {
        const newWins = { ...state.wins, [winner]: state.wins[winner] + 1 };
        const newHistory: MatchResult[] = [
            ...state.history,
            { round: state.currentRound, winner, duration }
        ];

        const winsNeeded = this.getWinsNeeded(state.type);
        let champion = state.champion;
        if (newWins[winner] >= winsNeeded) {
            champion = winner;
        }

        const totalRounds = newHistory.length;
        const totalDuration = newHistory.reduce((sum, r) => sum + r.duration, 0);
        const durations = newHistory.map(r => r.duration);

        const stats = {
            totalRounds,
            averageRoundTime: totalDuration / totalRounds,
            longestRound: Math.max(...durations),
            shortestRound: Math.min(...durations),
            champion
        };

        return {
            ...state,
            wins: newWins,
            history: newHistory,
            champion,
            stats,
            currentRound: champion ? state.currentRound : state.currentRound + 1
        };
    }
}
