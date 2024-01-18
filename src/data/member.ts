export interface Member {
    id: string;
    name: string;
    elo: number;
    role: 'member' | 'organizer';
}