 const envAsInt = (name: string, default_: number): number => {
     const value = process.env[name];
     if(value) {
           return parseInt(value, 10);
         } else {
               return default_;
             }
 };

export type HttpConfig = {
    port: number,
};

export type DbConfig = {
    user: string,
    host: string,
    password: string,
    port: number,
    database: string,
    migrationTable: string,
};

export type Config = {
    http: HttpConfig,
    db: DbConfig,
};

export const config: Config =
  {
      http: {
            port: envAsInt('PORT', 4444),
          },
      db: {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            password: process.env.DB_PASSWORD || 'password',
            port: envAsInt('DB_PORT', 5432),
            database: process.env.DB_DATABASE || 'bujo',
            migrationTable: '__migration',
          },
  };

