import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { createServer } from "http";

const app = express();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const PgSession = connectPgSimple(session);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the API on Vercel.");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const sessionStore = new PgSession({
  pool,
  tableName: "session",
  createTableIfMissing: true,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "flow-coaching-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    },
    store: sessionStore,
  })
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

const httpServer = createServer(app);
registerRoutes(httpServer, app);

export default app;
