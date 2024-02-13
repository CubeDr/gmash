export default interface Member {
  id: string;
  name: string;
  elo: number;
  role: 'member' | 'organizer';
  played?: number;
  upcoming?: number;
}
