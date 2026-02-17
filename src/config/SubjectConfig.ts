/**
 * Subject Configuration
 * Centralized subject definitions matching Notion database exactly
 */

interface SubjectEntry {
    name: string;
    aliases: string[];
    emoji: string;
}

/**
 * Official subject list — must match Notion database exactly.
 * Aliases are stored in lowercase for case-insensitive matching.
 */
const SUBJECTS: SubjectEntry[] = [
    { name: 'KIK-A', aliases: ['kika', 'kik a'], emoji: '🧪' },
    { name: 'MTK', aliases: ['mat', 'math'], emoji: '🔢' },
    { name: 'MK-1', aliases: ['mk1', 'mk 1'], emoji: '💻' },
    { name: 'MK-2', aliases: ['mk2', 'mk 2'], emoji: '💻' },
    { name: 'MK-3', aliases: ['mk3', 'mk 3'], emoji: '💻' },
    { name: 'MK-4', aliases: ['mk4', 'mk 4'], emoji: '💻' },
    { name: 'B. Indonesia', aliases: ['bindo', 'b.indo', 'bahasa indonesia', 'b indonesia'], emoji: '📖' },
    { name: 'PPc/PKN', aliases: ['ppkn', 'ppc', 'pkn', 'ppn', 'ppc/pkn'], emoji: '🇮🇩' },
    { name: 'PAI', aliases: ['agama', 'agama islam'], emoji: '🕌' },
    { name: 'Sejarah', aliases: ['sej'], emoji: '📚' },
    { name: 'MP-1', aliases: ['mp1', 'mp 1'], emoji: '💻' },
    { name: 'PJOK', aliases: ['penjas', 'olahraga', 'penjaskes'], emoji: '🏃' },
    { name: 'B. Inggris', aliases: ['bing', 'b.inggris', 'bahasa inggris', 'b inggris', 'english'], emoji: '🌍' },
    { name: 'KIK-C', aliases: ['kikc', 'kik c'], emoji: '🧪' },
    { name: 'BK', aliases: ['bimbingan konseling', 'konseling'], emoji: '🧠' },
    { name: 'B. Jawa', aliases: ['baja', 'b.jawa', 'bahasa jawa', 'b jawa'], emoji: '🎭' },
    { name: 'Matematika', aliases: ['mtk'], emoji: '🔢' },
];

/**
 * Get all official subject names
 */
export function getSubjectNames(): string[] {
    return SUBJECTS.map(s => s.name);
}

/**
 * Get subject choices for Discord slash commands (max 25)
 */
export function getSubjectChoices(): { name: string; value: string }[] {
    return SUBJECTS.map(s => ({ name: `${s.emoji} ${s.name}`, value: s.name }));
}

/**
 * Get all subjects with their aliases (for SubjectResolver)
 */
export function getSubjects(): SubjectEntry[] {
    return SUBJECTS;
}

/**
 * Get emoji for a subject name
 */
export function getSubjectEmoji(name: string): string {
    const subject = SUBJECTS.find(s => s.name.toLowerCase() === name.toLowerCase());
    return subject?.emoji || '📝';
}
