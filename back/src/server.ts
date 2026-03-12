import { createServer } from "node:http"
import { createSchema, createYoga } from "graphql-yoga"
import { typeDefs } from "./db/graphql/schema.ts"
import { resolvers } from "./db/graphql/resolvers.ts"
import { initDB } from "./db/database.ts"
import { handleSync } from "./routes/sync.ts"

async function start() {
  await initDB()

  const schema = createSchema({ typeDefs, resolvers })
  const yoga = createYoga({ schema })

  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/sync') {
      return handleSync(req, res);
    }

    return yoga(req, res);
  })

  server.listen(4000, () => {
    console.log("🚀 GraphQL API ready")
    console.log("http://localhost:4000/graphql")
  })
}

start()