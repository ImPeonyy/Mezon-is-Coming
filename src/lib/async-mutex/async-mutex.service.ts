import { AsyncMutexMsg } from '@/constants';
import { Injectable } from '@nestjs/common';
import { Mutex } from 'async-mutex';

@Injectable()
export class AsyncMutexService {
    private locks: Map<string, Mutex> = new Map();

    private getKey({ userId, type }: AsyncMutexMsg): string {
        return `${type}-${userId}`;
    }

    private getMutex(key: string): Mutex {
        if (!this.locks.has(key)) {
            this.locks.set(key, new Mutex());
        }
        return this.locks.get(key)!;
    }

    isLocked({ userId, type }: AsyncMutexMsg): boolean {
        const key = this.getKey({ userId, type });
        const mutex = this.locks.get(key);
        return mutex ? mutex.isLocked() : false;
    }

    async runExclusive<T>({ userId, type }: AsyncMutexMsg, fn: () => Promise<T>): Promise<T> {
        const key = this.getKey({ userId, type });
        const mutex = this.getMutex(key);

        return await mutex.runExclusive(async () => {
            try {
                return await fn();
            } finally {
                if (!mutex.isLocked()) {
                    this.locks.delete(key);
                }
            }
        });
    }
}
