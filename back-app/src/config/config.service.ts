import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

require('dotenv').config();

class ConfigService {

    constructor(private env: { [k: string]: string | undefined }) { }

    private getValue(key: string, throwOnMissing: false): string | undefined;
    private getValue(key: string, throwOnMissing?: boolean): string;
    private getValue(key: string, throwOnMissing = true): string | undefined {
        const value = this.env[key];
        if (!value && throwOnMissing) {
            throw new Error(`config error - missing env.${key}`);
        }

        return value;
    }

    public ensureValues(keys: string[]) {
        keys.forEach(k => this.getValue(k, true));
        return this;
    }

    public getPort() {
        return this.getValue('PORT', false) || '3000';
    }

    public isProduction() {
        const mode = this.getValue('MODE', false);
        return mode != 'DEV';
    }

    public getTypeOrmConfig(): TypeOrmModuleOptions {
        return {
            type: 'postgres',

            host: this.getValue('POSTGRES_HOST'),
            port: parseInt(this.getValue('POSTGRES_PORT')),
            username: this.getValue('POSTGRES_USER'),
            password: this.getValue('POSTGRES_PASSWORD'),
            database: this.getValue('POSTGRES_DATABASE'),

            entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],

            migrationsTableName: 'migration',

            migrations: [path.join(__dirname, '..', 'migration', '*.{ts,js}')],

            // Cria as tabelas automaticamente (apenas para DEV, não usar em PROD)
            synchronize: true,

            ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,    };
    }

}

const configService = new ConfigService(process.env)
    .ensureValues([
        'POSTGRES_HOST',
        'POSTGRES_PORT',
        'POSTGRES_USER',
        'POSTGRES_PASSWORD',
        'POSTGRES_DATABASE'
    ]);

export { configService };
