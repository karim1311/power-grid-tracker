// import { Pool } from '@neondatabase/serverless';
// import { Queryable } from './util';
// import { createOutageRepo } from './outages';
// import { createUserRepo } from './users';
// import { createLocationRepo } from './locations';

// /**
//  * The one place the app connects to the database.
//  *
//  * Needs this environment variable (set it in .env.local for local dev, and in
//  * the Vercel project settings for deployment):
//  *
//  *   DATABASE_URL={the db URL}
//  *
//  * Only import this file from server code (API routes, server components),
//  * never from a client component, or the connection string could leak.
//  */

// let pool: Pool | undefined;

// function getPool(): Pool {
//   if (!pool) {
//     const connectionString = process.env.DATABASE_URL;
//     if (!connectionString) {
//       throw new Error(
//         'DATABASE_URL is not set. Add it to .env.local (see .env.example) or the Vercel project settings.',
//       );
//     }
//     pool = new Pool({ connectionString });
//   }
//   return pool;
// }

// /**
//  * The pool is created lazily on the first query, so importing this file never
//  * crashes (e.g. during `next build`) just because the variable isn't set yet.
//  */
// export const db: Queryable = {
//   query: (text, params) => getPool().query(text, params as any[]),
// };

// // Ready-to-use repos. Routes import these instead of building their own.
// export const outages = createOutageRepo(db);
// export const users = createUserRepo(db);
// export const locations = createLocationRepo(db);