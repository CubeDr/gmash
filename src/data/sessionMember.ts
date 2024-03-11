export default interface SessionMember {
  played?: number;
  upcoming?: number;
  elo: number;
  canPlay: boolean;
}

export interface IDBySessionMember {
  [key: string]: SessionMember;
}
