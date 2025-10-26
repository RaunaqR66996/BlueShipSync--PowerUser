import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar JSON

  type Event {
    id: ID!
    type: String!
    entity: String!
    payload: JSON!
    ts: String!
  }

  type Action {
    type: String!
    params: JSON!
  }

  type Recommendation {
    id: ID!
    title: String!
    score: Float!
    rationale: String!
    actions: [Action!]!
  }

  type Query {
    feed(warehouseId: ID, limit: Int = 50): [Event!]!
    recommendations(warehouseId: ID): [Recommendation!]!
  }

  type Mutation {
    planJIT(skuId: ID!, qty: Int!, destWarehouseId: ID!): Recommendation!
    applyAction(recommendationId: ID!, actionType: String!, params: JSON!): Event!
  }

  type Subscription {
    events(warehouseId: ID): Event!
    recs(warehouseId: ID): Recommendation!
  }
`;
