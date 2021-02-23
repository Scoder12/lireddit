import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import express from "express";
import session from "express-session";
import getenv from "getenv";
import Redis from "ioredis";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __PROD__ } from "./constants";
import MIKRO_CONFIG from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";

async function main() {
  const SESSION_SECRET = getenv("LIREDDIT_SESSION_SECRET");

  // mikro config uses values from environment variables on import
  const orm = await MikroORM.init(MIKRO_CONFIG);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        // This is safe because the type error is only caused by the versions of
        //  @types/ioredis are different between the root and @types/connect-redis's
        //  node_modules. An ioredis instance is valid here.
        client: redis as any,
        disableTouch: true,
        disableTTL: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // CSRF
        secure: __PROD__, // Should cookie only work over HTTPS
      },
      secret: SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );

  const schema = await buildSchema({
    resolvers: [HelloResolver, PostResolver, UserResolver],
    validate: false,
  });
  const apolloServer = new ApolloServer({
    schema,
    tracing: !__PROD__,
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: { origin: "http://localhost:3000", credentials: true },
  });

  const port = getenv.int("LIREDDIT_PORT", 4000);
  const iface = getenv("LIREDDIT_IFACE", "127.0.0.1");
  app.listen(port, iface, () => {
    console.log(`Server started on http://${iface}:${port}`);
  });
}

main();
