import { AsyncMutexMsg } from '@/constants';
import { Injectable } from '@nestjs/common';
import { Mutex } from 'async-mutex';

@Injectable()
export class AsyncMutexService {
    private locks: Map<string, Mutex> = new Map();

    private getKey({ mezonId, type }: AsyncMutexMsg): string {
        return `${type}-${mezonId}`;
    }

    private getMutex(key: string): Mutex {
        if (!this.locks.has(key)) {
            this.locks.set(key, new Mutex());
        }
        return this.locks.get(key)!;
    }

    isLocked({ mezonId, type }: AsyncMutexMsg): boolean {
        const key = this.getKey({ mezonId, type });
        const mutex = this.locks.get(key);
        return mutex ? mutex.isLocked() : false;
    }

    async runExclusive<T>({ mezonId, type }: AsyncMutexMsg, fn: () => Promise<T>): Promise<T> {
        const key = this.getKey({ mezonId, type });
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
