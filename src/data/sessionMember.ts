export default interface SessionMember {
    played: number;
    upcoming: number;
}

export interface IDBySessionMember {
    [key: string]: SessionMember
}