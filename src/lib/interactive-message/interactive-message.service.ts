import { Injectable } from '@nestjs/common';
import { InteractiveMessage } from '@/constants';
import { getTextMessage } from '@/utils';

@Injectable()
export class InteractiveMessageService {
    private activeMessages: Map<number, InteractiveMessage[]> = new Map();

    public getUserMessages(userId: number): InteractiveMessage[] {
        return this.activeMessages.get(userId) || [];
    }

    public has(userId: number, type?: string): boolean {
        const list = this.getUserMessages(userId);
        return type ? list.some((m) => m.type === type) : list.length > 0;
    }

    public get(userId: number, type: string): InteractiveMessage | undefined {
        return this.activeMessages.get(userId)?.find((m) => m.type === type);
    }

    public async register(msg: InteractiveMessage) {
        const duplicate = this.has(msg.userId, msg.type);
        if (duplicate) {
            await this.forceClose(msg.userId, msg.type, '🌸 Chúc bạn chơi vui vẻ!');
        }

        this.activeMessages.set(msg.userId, [msg]);
    }

    public async refreshExpireTimer(userId: number, type: string, duration: number = 3 * 60 * 1000) {
        const session = this.get(userId, type);
        if (!session) return;

        clearTimeout(session.expireTimer);

        session.expireTimer = setTimeout(() => {
            this.forceClose(userId, type, '🌸 Chúc bạn chơi vui vẻ!');
        }, duration);
    }

    public async forceClose(userId: number, type?: string, reason = '') {
        const list = this.getUserMessages(userId);
        if (list.length === 0) return false;

        const targets = type ? list.filter((m) => m.type === type) : list;

        for (const msg of targets) {
            if (msg.expireTimer) clearTimeout(msg.expireTimer);

            try {
                if (reason !== '') {
                    await msg.message.update(getTextMessage(reason));
                }
            } catch (err) {
                console.error('Error updating message:', err);
            }
        }

        const remaining = type ? list.filter((m) => m.type !== type) : [];
        if (remaining.length > 0) this.activeMessages.set(userId, remaining);
        else this.activeMessages.delete(userId);
        return true;
    }

    public async clearAll(reason = '🌸 Chúc bạn chơi vui vẻ!') {
        for (const [userId] of this.activeMessages) {
            await this.forceClose(userId, undefined, reason);
        }
        this.activeMessages.clear();
    }
}
