import { createServer } from "node:http"
import { createSchema, createYoga } from "graphql-yoga"
import { typeDefs } from "./db/graphql/schema.ts"
import { resolvers } from "./db/graphql/resolvers.ts"
import { initDB } from "./db/database.ts"

async function start() {

  await initDB()

  const schema = createSchema({
    typeDefs,
    resolvers
  })

  const yoga = createYoga({
    schema
  })

  const server = createServer(yoga)

  server.listen(4000, () => {
    console.log("🚀 GraphQL API ready")
    console.log("http://localhost:4000/graphql")
  })
}

start()