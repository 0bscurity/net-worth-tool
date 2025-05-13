import { expressjwt as jwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";
dotenv.config();

export const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header
  secret: jwksRsa.expressJwtSecret({
    cache: true,                     // enable key caching
    cacheMaxEntries: 5,              // how many keys to cache
    cacheMaxAge: 10 * 60 * 1000,     // cache duration (10 minutes)
    rateLimit: true,                 // enable jwks-rsa rate limiter
    jwksRequestsPerMinute: 60,       // allow up to 60 JWKs fetches per minute
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  // your API’s expected audience and issuer
  audience: process.env.AUTH0_AUDIENCE,
  issuer:   `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});
