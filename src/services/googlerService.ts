import { User } from 'firebase/auth';

import { Googler } from '../data/googler';
import firebase from '../firebase';
import TypedStream from '../typedStream';

class GooglerService {
    private user: User | null = null;
    private googler: Googler | null = null;
    readonly googlerStream = new TypedStream<Googler | null>();

    constructor() {
        firebase.onAuthStateChanged(user => {
            this.user = user;
            this.updateGoogler();
        });
    }

    register() {
        if (this.user == null) return;

        firebase.register(this.user.uid, this.user.displayName!).then(() => {
            this.updateGoogler();
        });
    }

    private async updateGoogler() {
        const googler = await this.getGooglerForUser();
        if (googler != this.googler) {
            this.googler = googler;
            this.googlerStream.write(this.googler);
        }
    }

    private async getGooglerForUser() {
        if (this.user == null) return null;

        return await firebase.getGoogler(this.user);
    }
}

export default new GooglerService();
