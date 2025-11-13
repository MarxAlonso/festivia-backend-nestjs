/*import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon as neonNode } from '@neondatabase/serverless-node';
import { neon as neonServerless } from '@neondatabase/serverless';

@Injectable()
export class DatabaseService {
  private readonly sql: ReturnType<typeof neonNode>;

  constructor(private readonly configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) throw new Error('DATABASE_URL is not set');

    // 👇 Usa cliente según entorno
    const isProd = process.env.NODE_ENV === 'production';
    const neonClient = isProd ? neonServerless : neonNode;

    this.sql = neonClient(databaseUrl);
  }

  async query<T = any>(strings: TemplateStringsArray, ...params: any[]): Promise<T[]> {
    const result = await (this.sql as any)(strings, ...params);
    return result as T[];
  }
}
*/