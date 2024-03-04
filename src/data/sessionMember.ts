export default interface SessionMember {
  played: number;
  upcoming: number;
  elo: number;
}

export interface IDBySessionMember {
  [key: string]: SessionMember;
}
