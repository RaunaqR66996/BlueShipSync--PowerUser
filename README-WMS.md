# Warehouse Management System (WMS) - Full Stack MVP

A comprehensive Warehouse Management System built with Next.js, TypeScript, Prisma, and PostgreSQL. Features both web manager console and handheld PWA for warehouse operations.

## 🚀 Features

### Core WMS Flows
- **Receive** - ASN processing, barcode scanning, receiving workflows
- **Store (Putaway)** - Intelligent slotting, putaway planning, location management
- **Pick** - Wave planning, pick lists, guided picking
- **Ship** - Packing, cartonization, shipping labels, carrier integration

### Advanced Features
- **Inventory Management** - Real-time tracking, multi-location support
- **Cycle Counting** - Automated counting sessions, variance reconciliation
- **Replenishment** - Smart replenishment suggestions, task automation
- **Returns** - RMA processing, return disposition
- **Reports** - Inventory accuracy, productivity metrics, space utilization

### Technical Features
- **3D Warehouse Visualization** - Interactive 3D warehouse view with React Three Fiber
- **Barcode Scanning** - Camera-based barcode scanning for mobile devices
- **PWA Support** - Installable handheld app for warehouse workers
- **Real-time Updates** - Live inventory and task updates
- **RBAC** - Role-based access control (Admin, Supervisor, Associate, Viewer)
- **API Integration** - RESTful APIs with webhook support for ERP/TMS integration

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **3D Graphics**: React Three Fiber, Three.js
- **Mobile**: PWA with barcode scanning
- **Testing**: Vitest (unit), Playwright (e2e)
- **Database**: PostgreSQL with Docker

## 📋 Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd wms-system
npm install
```

### 2. Environment Setup
```bash
cp env.example .env.local
# Edit .env.local with your database URL and JWT secret
```

### 3. Start Database
```bash
npm run docker:up
```

### 4. Setup Database
```bash
npm run db:push
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access the Application
- **Web App**: http://localhost:3000
- **Handheld PWA**: http://localhost:3000/handheld
- **Database Studio**: `npm run db:studio`

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| Supervisor | supervisor@example.com | Supervisor@123 |
| Associate | associate1@example.com | Associate@123 |
| Viewer | viewer@example.com | Viewer@123 |

## 📱 Handheld PWA

The handheld interface is optimized for mobile devices and warehouse workers:

- **Installable PWA** - Add to home screen for native app experience
- **Barcode Scanning** - Camera-based scanning for receiving and picking
- **Large Touch Targets** - Optimized for gloves and quick operations
- **Offline Support** - Works offline with sync when connection restored
- **Haptic Feedback** - Vibration feedback for successful scans

### Installing the PWA
1. Open http://localhost:3000/handheld on mobile device
2. Tap "Add to Home Screen" when prompted
3. Use the installed app for warehouse operations

## 🏗 Architecture

### Database Schema
- **Users** - Authentication and role management
- **Warehouses** - Multi-warehouse support
- **Locations** - Bins, zones, aisles with 3D positioning
- **Items** - SKU master data with dimensions and tracking
- **Inventory** - Real-time stock levels with lot/serial tracking
- **Orders** - Sales orders, purchase orders, RMAs
- **Tasks** - Work orders for all warehouse operations
- **Shipments** - Shipping and carrier integration
- **Count Sessions** - Cycle counting and variance tracking
- **Replenishment** - Smart replenishment planning
- **Outbox** - Integration message queue

### API Design
- **RESTful APIs** with proper HTTP methods
- **Zod validation** for all inputs
- **JWT authentication** with role-based permissions
- **Transaction support** for data consistency
- **Error handling** with proper HTTP status codes

### Frontend Architecture
- **App Router** - Next.js 14 with server components
- **Component Library** - shadcn/ui with Tailwind CSS
- **State Management** - Zustand for client state
- **Data Fetching** - TanStack Query for server state
- **3D Graphics** - React Three Fiber for warehouse visualization

## 🔄 Core Workflows

### 1. Receive → Putaway
```
ASN Upload → PO Creation → RECEIVE Tasks → PUTAWAY Planning → Associate Execution
```

### 2. Pick → Pack → Ship
```
SO Creation → Allocation → Wave Planning → PICK Tasks → Packing → Shipment
```

### 3. Cycle Count
```
Count Session → Handheld Counting → Variance Analysis → Reconciliation
```

### 4. Replenishment
```
Low Stock Detection → Replenishment Suggestions → Task Creation → Execution
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
- **Unit Tests**: Business logic, slotting, replenishment algorithms
- **E2E Tests**: Complete user workflows, API integration
- **Component Tests**: UI component behavior

## 📊 Monitoring & Analytics

### Key Metrics
- **Inventory Accuracy** - Cycle count variances
- **Pick Productivity** - Items picked per hour
- **Space Utilization** - Warehouse capacity usage
- **Task Completion** - Task completion rates by type

### Reports
- **Inventory Reports** - Stock levels, aging, ABC analysis
- **Productivity Reports** - Worker performance, task metrics
- **Utilization Reports** - Space usage, capacity planning

## 🔌 Integrations

### ERP Integration
- **ASN Processing** - Automated purchase order creation
- **Inventory Sync** - Real-time stock level updates
- **Order Management** - Sales order integration

### TMS Integration
- **Shipment Creation** - Automated shipping labels
- **Tracking Updates** - Real-time shipment status
- **Carrier Integration** - Multi-carrier support

### Webhook Support
- **Outbox Pattern** - Reliable message delivery
- **Retry Logic** - Failed message retry
- **Event Sourcing** - Audit trail for all operations

## 🚀 Deployment

### Production Setup
1. **Database**: PostgreSQL with connection pooling
2. **Application**: Next.js with PM2 or similar
3. **Reverse Proxy**: Nginx for SSL and load balancing
4. **Monitoring**: Application and database monitoring
5. **Backup**: Automated database backups

### Environment Variables
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secure-jwt-secret"
NEXT_PUBLIC_APP_NAME="WMS"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 📈 Performance

### Optimization Features
- **Database Indexing** - Optimized queries for large datasets
- **Caching** - Redis for session and data caching
- **3D Rendering** - Efficient warehouse visualization
- **Mobile Performance** - Optimized for handheld devices

### Scalability
- **Horizontal Scaling** - Stateless application design
- **Database Scaling** - Read replicas for reporting
- **CDN Support** - Static asset optimization

## 🔒 Security

### Security Features
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **RBAC** - Role-based access control
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Prisma ORM
- **XSS Protection** - React built-in protection

## 📚 API Documentation

### Authentication
```bash
POST /api/auth/login
GET /api/me
```

### Inventory
```bash
GET /api/inventory
POST /api/items
```

### Receiving
```bash
POST /api/receive/asn
POST /api/receive/scan
```

### Picking
```bash
POST /api/pick/wave
POST /api/pick/scan
```

### Shipping
```bash
POST /api/ship/manifest
POST /api/ship/labels
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

---

**Built with ❤️ for modern warehouse operations**
































































