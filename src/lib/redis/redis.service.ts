import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private redisClient: Redis;

    constructor() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: Number(process.env.REDIS_PORT) || 6379,
            username: 'default',
            password: process.env.REDIS_PASSWORD || undefined,
        });
    }

    async onModuleInit() {
        this.redisClient.on('connect', () => {
            console.log('🌸 Redis connected');
        });

        this.redisClient.on('error', (err) => {
            console.error('❌ Redis error:', err);
        });
    }

    async onModuleDestroy() {
        await this.redisClient.disconnect();
    }

    getClient(): Redis {
        return this.redisClient;
    }

    async logUserOnline(userId: string, username?: string): Promise<void> {
        try {
            const logKey = `user:online:${userId}:${username}`;

            const exists = await this.redisClient.exists(logKey);
            console.log(exists);
            if (exists === 1) {
                await this.redisClient.hincrby(logKey, 'count', 3);
                await this.redisClient.hset(logKey, 'lastAt', Date.now());
            } else {
                await this.redisClient.hset(logKey, {
                    count: 1,
                    lastAt: Date.now(),
                });
            }
        } catch (error) {
            console.error('❌ Lỗi khi log user online:', error);
        }
    }
}
