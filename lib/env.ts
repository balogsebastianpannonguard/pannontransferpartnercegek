const requiredEnvVars = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_COOKIE_SECRET",
  "AUTH_COOKIE_VALUE",
  "MONGODB_URI",
  "MONGODB_DB",
  "EMAIL_USER",
  "EMAIL_PASS",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "EMAIL_ADMIN_USERNAME",
  "EMAIL_ADMIN_PASSWORD",
  "EMAIL_ADMIN_COOKIE_SECRET",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

function validateEnvVars(): Record<RequiredEnvVar, string> {
  const missing: string[] = [];
  const result = {} as Record<RequiredEnvVar, string>;

  for (const key of requiredEnvVars) {
    const value = process.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    } else {
      result[key] = value;
    }
  }

  if (missing.length > 0) {
    console.error(
      `[ENV HIBA] A következő kötelező környezeti változók hiányzóak: ${missing.join(", ")}`
    );
    console.error(
      "Kérlek ellenőrizd a .env.local fájlt a projekt gyökerében."
    );
  }

  return result;
}

const validated = validateEnvVars();

export const env = {
  admin: {
    email: validated.ADMIN_EMAIL,
    password: validated.ADMIN_PASSWORD,
    cookieSecret: validated.ADMIN_COOKIE_SECRET,
    authCookieValue: validated.AUTH_COOKIE_VALUE,
  },
  mongodb: {
    uri: validated.MONGODB_URI,
    db: validated.MONGODB_DB,
  },
  email: {
    user: validated.EMAIL_USER,
    pass: validated.EMAIL_PASS,
    smtpHost: validated.SMTP_HOST,
    smtpPort: parseInt(validated.SMTP_PORT, 10),
    smtpSecure: validated.SMTP_SECURE === "true",
    adminUsername: validated.EMAIL_ADMIN_USERNAME,
    adminPassword: validated.EMAIL_ADMIN_PASSWORD,
    adminCookieSecret: validated.EMAIL_ADMIN_COOKIE_SECRET,
  },
} as const;

export type EnvConfig = typeof env;
