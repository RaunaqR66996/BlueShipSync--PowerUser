import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();
  
  // Enable CORS
  app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
  }));

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Use WebSocket server for GraphQL subscriptions
  useServer({ schema: server.schema }, wsServer);

  httpServer.listen(PORT, () => {
    console.log(`🚀 GraphQL Gateway running at http://localhost:${PORT}/graphql`);
    console.log(`🔌 WebSocket subscriptions available at ws://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);
