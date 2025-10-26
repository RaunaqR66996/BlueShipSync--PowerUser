import { v4 as uuidv4 } from 'uuid';
import { data, Event, Action, Recommendation } from './data';

let eventCounter = 0;
const events: Event[] = [];

// Generate mock events every 2 seconds
setInterval(() => {
  const eventTypes = ['INVENTORY_UPDATE', 'ORDER_STATUS_CHANGE', 'SHIPMENT_UPDATE', 'SYSTEM_ALERT'];
  const entities = ['INVENTORY', 'ORDER', 'SHIPMENT', 'SYSTEM'];
  
  const event: Event = {
    id: `evt_${++eventCounter}`,
    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    entity: entities[Math.floor(Math.random() * entities.length)],
    payload: {
      message: `Mock event ${eventCounter}`,
      timestamp: new Date().toISOString()
    },
    ts: new Date().toISOString()
  };
  
  events.push(event);
  
  // Keep only last 100 events
  if (events.length > 100) {
    events.shift();
  }
}, 2000);

export const resolvers = {
  Query: {
    feed: (_: any, { warehouseId, limit = 50 }: { warehouseId?: string; limit?: number }) => {
      let filteredEvents = events;
      if (warehouseId) {
        filteredEvents = events.filter(event => 
          event.payload.warehouseId === warehouseId || 
          event.entity === 'SYSTEM'
        );
      }
      return filteredEvents.slice(-limit);
    },
    
    recommendations: (_: any, { warehouseId }: { warehouseId?: string }) => {
      const mockRecommendations: Recommendation[] = [
        {
          id: 'rec_001',
          title: 'Optimize SKU-004 Transfer',
          score: 0.85,
          rationale: 'High demand in CHI warehouse, excess stock in DAL',
          actions: [
            { type: 'CREATE_TRANSFER', params: { from: 'DAL', to: 'CHI', sku: 'SKU-004', qty: 20 } },
            { type: 'CREATE_SHIPMENT', params: { carrier: 'FastX EXP', priority: 'high' } }
          ]
        },
        {
          id: 'rec_002',
          title: 'Reorder SKU-010',
          score: 0.72,
          rationale: 'Low stock levels, high order frequency',
          actions: [
            { type: 'CREATE_PURCHASE_ORDER', params: { sku: 'SKU-010', qty: 100, supplier: 'Supplier A' } }
          ]
        }
      ];
      
      return mockRecommendations;
    }
  },
  
  Mutation: {
    planJIT: (_: any, { skuId, qty, destWarehouseId }: { skuId: string; qty: number; destWarehouseId: string }) => {
      // Find source warehouse with available stock
      const sourceInventory = data.inventory.find(inv => 
        inv.sku === skuId && inv.qty >= qty && inv.warehouse !== destWarehouseId
      );
      
      if (!sourceInventory) {
        throw new Error(`No available stock for ${skuId} in sufficient quantity`);
      }
      
      const recommendation: Recommendation = {
        id: `jit_${uuidv4()}`,
        title: `JIT Transfer: ${skuId}`,
        score: 0.9,
        rationale: `Transfer ${qty} units of ${skuId} from ${sourceInventory.warehouse} to ${destWarehouseId}`,
        actions: [
          { 
            type: 'CREATE_TRANSFER', 
            params: { 
              from: sourceInventory.warehouse, 
              to: destWarehouseId, 
              sku: skuId, 
              qty: qty 
            } 
          },
          { 
            type: 'CREATE_SHIPMENT', 
            params: { 
              carrier: 'FastX EXP', 
              priority: 'urgent',
              eta: '2 hours'
            } 
          }
        ]
      };
      
      return recommendation;
    },
    
    applyAction: (_: any, { recommendationId, actionType, params }: { recommendationId: string; actionType: string; params: any }) => {
      const event: Event = {
        id: `evt_${++eventCounter}`,
        type: 'ACTION_APPLIED',
        entity: 'RECOMMENDATION',
        payload: {
          recommendationId,
          actionType,
          params,
          status: 'completed'
        },
        ts: new Date().toISOString()
      };
      
      events.push(event);
      return event;
    }
  },
  
  Subscription: {
    events: {
      subscribe: (_: any, { warehouseId }: { warehouseId?: string }) => {
        // In a real implementation, this would use WebSocket subscriptions
        // For now, we'll return a mock async iterator
        return {
          [Symbol.asyncIterator]: async function* () {
            while (true) {
              await new Promise(resolve => setTimeout(resolve, 2000));
              const latestEvent = events[events.length - 1];
              if (latestEvent && (!warehouseId || latestEvent.payload.warehouseId === warehouseId)) {
                yield { events: latestEvent };
              }
            }
          }
        };
      }
    },
    
    recs: {
      subscribe: (_: any, { warehouseId }: { warehouseId?: string }) => {
        // Mock subscription for recommendations
        return {
          [Symbol.asyncIterator]: async function* () {
            while (true) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              yield { 
                recs: {
                  id: `rec_${Date.now()}`,
                  title: 'New Recommendation',
                  score: Math.random(),
                  rationale: 'System generated recommendation',
                  actions: []
                }
              };
            }
          }
        };
      }
    }
  }
};
