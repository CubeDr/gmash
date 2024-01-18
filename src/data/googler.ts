import { User } from 'firebase/auth';

export interface Googler {
    user: User;
    name?: string;
    elo?: number;
    role?: 'member' | 'organizer';
}