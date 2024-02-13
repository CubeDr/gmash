import { DatabaseReference } from 'firebase/database';

import Member from './member';

export default interface Game {
  team1: Member[];
  team2: Member[];
  ref?: DatabaseReference;
}
