namespace NodeJS {
  interface ProcessEnv {
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    ADMIN_COOKIE_SECRET: string;
    AUTH_COOKIE_VALUE: string;

    MONGODB_URI: string;
    MONGODB_DB: string;

    EMAIL_USER: string;
    EMAIL_PASS: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_SECURE: string;

    EMAIL_ADMIN_USERNAME: string;
    EMAIL_ADMIN_PASSWORD: string;
    EMAIL_ADMIN_COOKIE_SECRET: string;
  }
}
