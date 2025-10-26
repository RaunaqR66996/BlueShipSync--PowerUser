'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { createClient } from 'urql';

// GraphQL client
const client = createClient({
  url: 'http://localhost:4000/graphql',
});

// Query client for React Query
const queryClient = new QueryClient();

// Mock data types
interface Event {
  id: string;
  type: string;
  entity: string;
  payload: any;
  ts: string;
}

interface Recommendation {
  id: string;
  title: string;
  score: number;
  rationale: string;
  actions: Array<{
    type: string;
    params: any;
  }>;
}

// 3D Warehouse Component
function Warehouse3D() {
  const [selectedBin, setSelectedBin] = useState<string | null>(null);
  
  // Mock warehouse bins with occupancy data
  const bins = [
    { id: 'A1', x: -2, z: -2, occupancy: 0.8, sku: 'SKU-004' },
    { id: 'A2', x: 0, z: -2, occupancy: 0.3, sku: 'SKU-010' },
    { id: 'A3', x: 2, z: -2, occupancy: 0.9, sku: 'SKU-001' },
    { id: 'B1', x: -2, z: 0, occupancy: 0.6, sku: 'SKU-004' },
    { id: 'B2', x: 0, z: 0, occupancy: 0.1, sku: 'SKU-010' },
    { id: 'B3', x: 2, z: 0, occupancy: 0.7, sku: 'SKU-001' },
  ];

  return (
    <div className="h-full w-full">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {bins.map((bin) => (
          <group key={bin.id}>
            <Box
              position={[bin.x, 0, bin.z]}
              args={[1, bin.occupancy * 2, 1]}
              onClick={() => setSelectedBin(bin.id)}
            >
              <meshStandardMaterial 
                color={bin.occupancy > 0.7 ? '#ef4444' : bin.occupancy > 0.4 ? '#f59e0b' : '#10b981'} 
                transparent 
                opacity={0.8}
              />
            </Box>
            <Text
              position={[bin.x, bin.occupancy * 2 + 0.5, bin.z]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {bin.id}
            </Text>
          </group>
        ))}
        
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      
      {selectedBin && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h3 className="font-semibold">Bin {selectedBin}</h3>
          <p>Occupancy: {Math.round(bins.find(b => b.id === selectedBin)?.occupancy! * 100)}%</p>
          <p>SKU: {bins.find(b => b.id === selectedBin)?.sku}</p>
        </div>
      )}
    </div>
  );
}

// Live Feed Component
function LiveFeed() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Mock live events - in real app, this would be a GraphQL subscription
    const interval = setInterval(() => {
      const newEvent: Event = {
        id: `evt_${Date.now()}`,
        type: ['INVENTORY_UPDATE', 'ORDER_STATUS_CHANGE', 'SHIPMENT_UPDATE'][Math.floor(Math.random() * 3)],
        entity: ['INVENTORY', 'ORDER', 'SHIPMENT'][Math.floor(Math.random() * 3)],
        payload: { message: `Live event ${events.length + 1}` },
        ts: new Date().toISOString()
      };
      setEvents(prev => [...prev.slice(-9), newEvent]);
    }, 2000);

    return () => clearInterval(interval);
  }, [events.length]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Live Feed</h3>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="text-sm border-l-2 border-blue-500 pl-2">
            <span className="text-blue-400">{event.type}</span>
            <span className="text-gray-400 ml-2">{event.payload.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recommendations Component
function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
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
  ]);

  const handleApply = (recId: string) => {
    console.log('Applying recommendation:', recId);
    // In real app, this would call the GraphQL mutation
  };

  const handleSimulate = (recId: string) => {
    console.log('Simulating recommendation:', recId);
    // In real app, this would show simulation results
  };

  const handleExplain = (recId: string) => {
    console.log('Explaining recommendation:', recId);
    // In real app, this would show detailed explanation
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Recommendations</h3>
      {recommendations.map((rec) => (
        <div key={rec.id} className="bg-white p-4 rounded-lg shadow border">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{rec.title}</h4>
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {Math.round(rec.score * 100)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{rec.rationale}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleApply(rec.id)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Apply
            </button>
            <button
              onClick={() => handleSimulate(rec.id)}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Simulate
            </button>
            <button
              onClick={() => handleExplain(rec.id)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Explain
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Data Tables Component
function DataTables() {
  const [activeTab, setActiveTab] = useState('orders');

  const orders = [
    { id: 'SO-1009', warehouse: 'CHI', sku: 'SKU-004', qty: 12, promise: 'today 17:00', status: 'Picking' },
    { id: 'SO-1010', warehouse: 'CHI', sku: 'SKU-010', qty: 4, promise: 'today 19:00', status: 'Allocated' },
    { id: 'TO-129', warehouse: 'DAL', sku: 'SKU-004', qty: 40, promise: 'tomorrow', status: 'Scheduled' }
  ];

  const shipments = [
    { id: 'SHP-5007', order: 'SO-1009', carrier: 'FastX EXP', eta: 'tomorrow 10:00', status: 'In Transit' },
    { id: 'SHP-5008', order: 'SO-1010', carrier: 'Econo STD', eta: 'Fri 15:00', status: 'Tendered' }
  ];

  const tabs = [
    { id: 'orders', label: 'Orders', data: orders },
    { id: 'staging', label: 'Staging', data: [] },
    { id: 'shipments', label: 'Shipments', data: shipments }
  ];

  const currentData = tabs.find(tab => tab.id === activeTab)?.data || [];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.warehouse}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.qty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'Picking' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'Allocated' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                      item.status === 'In Transit' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// JIT Transfer Button
function JITTransferButton() {
  const handleJITTransfer = () => {
    console.log('Initiating JIT Transfer...');
    // In real app, this would call the GraphQL mutation
  };

  return (
    <button
      onClick={handleJITTransfer}
      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
    >
      JIT Transfer
    </button>
  );
}

// Main Dashboard Component
function Dashboard() {
  const [selectedWarehouse, setSelectedWarehouse] = useState('CHI');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Blue Ship Sync – Power User</h1>
            <div className="flex items-center space-x-4">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="CHI">Chicago DC</option>
                <option value="DAL">Dallas DC</option>
              </select>
              <input
                type="text"
                placeholder="Search..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <JITTransferButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Left Navigation */}
        <nav className="w-64 bg-white shadow-sm">
          <div className="p-6">
            <ul className="space-y-2">
              <li><a href="#" className="block px-3 py-2 text-blue-600 font-medium">Dashboard</a></li>
              <li><a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Inventory</a></li>
              <li><a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Orders</a></li>
              <li><a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Shipments</a></li>
              <li><a href="#" className="block px-3 py-2 text-gray-600 hover:text-gray-900">Analytics</a></li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* 3D Warehouse View */}
          <div className="flex-1 p-6">
            <div className="h-96 bg-white rounded-lg shadow mb-6">
              <Warehouse3D />
            </div>
            
            {/* Data Tables */}
            <DataTables />
          </div>

          {/* Right Rail */}
          <div className="w-80 bg-white shadow-sm border-l p-6">
            <Recommendations />
          </div>
        </div>
      </div>

      {/* Bottom Live Feed */}
      <div className="fixed bottom-0 left-0 right-0 h-32">
        <LiveFeed />
      </div>
    </div>
  );
}

// Main App Component
export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
