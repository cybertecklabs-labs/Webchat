import Olm from '@matrix-org/olm';

let olmInitialized = false;

class EncryptionService {
    private userId: string;
    private account: Olm.Account | null = null;
    private sessions: Map<string, Olm.Session> = new Map();
    private _oneTimeKeys: any = null;

    private outboundGroupSessions: Map<string, Olm.OutboundGroupSession> = new Map();
    private inboundGroupSessions: Map<string, Olm.InboundGroupSession> = new Map();

    constructor(userId: string) {
        this.userId = userId;
    }

    async init() {
        if (!olmInitialized) {
            await Olm.init({ locateFile: () => '/olm.wasm' });
            olmInitialized = true;
        }
        this.account = new Olm.Account();
        this.account.create();
        this.persistAccount();
    }

    persistAccount() {
        if (!this.account) return;
        const pickled = this.account.pickle('your-strong-password');
        localStorage.setItem(`olm_account_${this.userId}`, pickled);
    }

    loadAccount() {
        const pickled = localStorage.getItem(`olm_account_${this.userId}`);
        if (pickled) {
            this.account = new Olm.Account();
            this.account.unpickle('your-strong-password', pickled);
        }
    }

    generateOneTimeKeys(count = 10) {
        if (!this.account) throw new Error('Account not initialized');
        this.account.generate_one_time_keys(count);
        const otkJson = JSON.parse(this.account.one_time_keys());
        this._oneTimeKeys = otkJson;
        return otkJson;
    }

    // Megolm - Group Encryption
    createOutboundGroupSession(channelId: string) {
        const session = new Olm.OutboundGroupSession();
        session.create();
        this.outboundGroupSessions.set(channelId, session);
        return {
            sessionId: session.session_id(),
            sessionKey: session.session_key()
        };
    }

    createInboundGroupSession(channelId: string, senderKey: string, sessionKey: string) {
        const session = new Olm.InboundGroupSession();
        session.create(sessionKey);
        this.inboundGroupSessions.set(`${channelId}:${senderKey}`, session);
        return session.session_id();
    }

    encryptGroupMessage(channelId: string, plaintext: string) {
        const session = this.outboundGroupSessions.get(channelId);
        if (!session) throw new Error('No outbound group session for this channel');
        return session.encrypt(plaintext);
    }

    decryptGroupMessage(channelId: string, senderKey: string, ciphertext: string) {
        const session = this.inboundGroupSessions.get(`${channelId}:${senderKey}`);
        if (!session) throw new Error('No inbound group session for this sender');
        return session.decrypt(ciphertext);
    }

    // Olm - One-to-One Encryption
    createOutboundSession(otherUserId: string, theirOneTimeKey: string) {
        if (!this.account) throw new Error('Account not initialized');
        const session = new Olm.Session();
        session.create_outbound(this.account, '', theirOneTimeKey); // Identity key can be empty for simple E2EE
        this.sessions.set(otherUserId, session);
        return session;
    }

    createInboundSession(theirUserId: string, ciphertext: string) {
        if (!this.account) throw new Error('Account not initialized');
        const session = new Olm.Session();
        session.create_inbound(this.account, ciphertext);
        this.sessions.set(theirUserId, session);
        return session;
    }

    encryptMessage(recipientUserId: string, plaintext: string) {
        const session = this.sessions.get(recipientUserId);
        if (!session) throw new Error('No session with this user');
        return session.encrypt(plaintext);
    }

    decryptMessage(senderUserId: string, ciphertext: { type: number, body: string }) {
        const session = this.sessions.get(senderUserId);
        if (!session) throw new Error('No session with this user');
        return session.decrypt(ciphertext.type, ciphertext.body);
    }
}

export default EncryptionService;
