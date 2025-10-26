import warehouses from '../../seed/warehouses.json';
import skus from '../../seed/skus.json';
import inventory from '../../seed/inventory.json';
import orders from '../../seed/orders.json';
import shipments from '../../seed/shipments.json';

export const data = {
  warehouses,
  skus,
  inventory,
  orders,
  shipments
};

export type Event = {
  id: string;
  type: string;
  entity: string;
  payload: any;
  ts: string;
};

export type Action = {
  type: string;
  params: any;
};

export type Recommendation = {
  id: string;
  title: string;
  score: number;
  rationale: string;
  actions: Action[];
};
