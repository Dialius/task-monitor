/**
 * Subject Resolver Service
 * Resolves user input to official subject names using exact, alias, and fuzzy matching
 */

import { getSubjects, getSubjectNames } from '../config/SubjectConfig';

export class SubjectResolver {
    /**
     * Resolve user input to an official subject name.
     * Strategy: exact match → alias match → fuzzy match (Levenshtein, ≥60%)
     * Returns null if no match found.
     */
    static resolve(input: string): string | null {
        if (!input || input.trim() === '') return null;

        const trimmed = input.trim();
        const lower = trimmed.toLowerCase();
        const subjects = getSubjects();

        // 1. Exact match (case-insensitive)
        for (const subject of subjects) {
            if (subject.name.toLowerCase() === lower) {
                return subject.name;
            }
        }

        // 2. Alias match (case-insensitive)
        for (const subject of subjects) {
            if (subject.aliases.includes(lower)) {
                return subject.name;
            }
        }

        // 3. Fuzzy match using Levenshtein distance
        const SIMILARITY_THRESHOLD = 0.6;
        let bestMatch: string | null = null;
        let bestSimilarity = 0;

        for (const subject of subjects) {
            // Compare against official name
            const nameSimilarity = this.similarity(lower, subject.name.toLowerCase());
            if (nameSimilarity > bestSimilarity) {
                bestSimilarity = nameSimilarity;
                bestMatch = subject.name;
            }

            // Compare against all aliases
            for (const alias of subject.aliases) {
                const aliasSimilarity = this.similarity(lower, alias);
                if (aliasSimilarity > bestSimilarity) {
                    bestSimilarity = aliasSimilarity;
                    bestMatch = subject.name;
                }
            }
        }

        if (bestSimilarity >= SIMILARITY_THRESHOLD && bestMatch) {
            return bestMatch;
        }

        return null;
    }

    /**
     * Get formatted list of available subjects for error messages
     */
    static getAvailableSubjectsMessage(): string {
        return getSubjectNames().join(', ');
    }

    /**
     * Calculate similarity between two strings (0-1)
     */
    private static similarity(a: string, b: string): number {
        const maxLen = Math.max(a.length, b.length);
        if (maxLen === 0) return 1;
        const distance = this.levenshteinDistance(a, b);
        return 1 - distance / maxLen;
    }

    /**
     * Levenshtein distance implementation
     */
    private static levenshteinDistance(a: string, b: string): number {
        const m = a.length;
        const n = b.length;

        // Use single row optimization
        let prev = new Array(n + 1);
        let curr = new Array(n + 1);

        for (let j = 0; j <= n; j++) prev[j] = j;

        for (let i = 1; i <= m; i++) {
            curr[0] = i;
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                curr[j] = Math.min(
                    curr[j - 1] + 1,        // insertion
                    prev[j] + 1,            // deletion
                    prev[j - 1] + cost      // substitution
                );
            }
            [prev, curr] = [curr, prev];
        }

        return prev[n];
    }
}
