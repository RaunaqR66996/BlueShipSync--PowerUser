# 🚢 Container Tracking System Guide

## Overview

The Container Tracking System provides real-time maritime vessel and container tracking capabilities, similar to professional vessel tracking services. It displays comprehensive voyage data, interactive maps, and detailed vessel information.

## Features

### ✅ Implemented Features

1. **Real-time Vessel Tracking**
   - Live position updates via AIS (Automatic Identification System)
   - Interactive Mapbox-powered map visualization
   - Vessel position markers with status indicators

2. **Comprehensive Voyage Data**
   - Origin and destination ports
   - ETA with countdown timer
   - Course and speed information
   - Navigation status (Under way, At anchor, Moored, etc.)
   - Last position update timestamp

3. **Vessel Information**
   - IMO and MMSI numbers
   - Callsign and flag
   - Vessel type (Cargo ship, Container ship, etc.)
   - Physical dimensions (length, beam)
   - Current draught

4. **Port Call History**
   - Recent port calls with arrival/departure times
   - Port duration calculations
   - Country and port name information

5. **Container Information**
   - Container ID tracking
   - Container type and size
   - Seal number verification
   - On-vessel status

## Usage

### Accessing Container Tracking

1. **From Orders Page**
   - Navigate to `/orders`
   - Click on "Container Tracking" card
   - Enter container number or vessel name

2. **Direct Access**
   - Navigate to `/container-tracking`
   - Use the search bar to enter:
     - Container number (e.g., `MSCU1234567`)
     - Vessel name (e.g., `MSC MANYA`)
     - IMO number (e.g., `9275397`)
     - MMSI number (e.g., `636015233`)

### Search Examples

```
Container Number: MSCU1234567, MSCU1234568, MSCU1234569
Vessel Name: MSC MANYA, MAERSK ESSEX
IMO Number: 9275397, 9321483
MMSI Number: 636015233, 219018448
```

## API Integration

### Endpoint: `/api/container-tracking`

#### GET Request - Search for Container or Vessel

**Query Parameters:**
- `query` (required): Container number, vessel name, IMO, or MMSI
- `type` (optional): 'vessel' or 'container'

**Example:**
```bash
# Search by container
GET /api/container-tracking?query=MSCU1234567&type=container

# Search by vessel name
GET /api/container-tracking?query=MSC%20MANYA&type=vessel
```

**Response:**
```json
{
  "success": true,
  "vessel": {
    "id": "vessel-001",
    "name": "MSC MANYA",
    "imo": "9275397",
    "mmsi": "636015233",
    "latitude": 10.6596,
    "longitude": -61.5089,
    "course": 126,
    "speed": 17.0,
    "navigationStatus": "Under way",
    ...
  },
  "containerId": "MSCU1234567"
}
```

#### POST Request - Position Update Webhook

**Body:**
```json
{
  "vesselId": "vessel-001",
  "latitude": 10.6596,
  "longitude": -61.5089,
  "course": 126,
  "speed": 17.0,
  "navigationStatus": "Under way"
}
```

## Component Usage

### Basic Implementation

```tsx
import { ContainerTracking } from '@/components/container-tracking';

const vesselData = {
  id: 'vessel-001',
  name: 'MSC MANYA',
  imo: '9275397',
  mmsi: '636015233',
  callsign: 'A8ZK7',
  flag: 'Liberia',
  type: 'Cargo ship (HAZ-D)',
  origin: 'Port of Spain, Trinidad & Tobago',
  destination: 'TTPOS > BRVLC',
  eta: new Date('2025-10-03T15:00:00'),
  latitude: 10.6596,
  longitude: -61.5089,
  course: 126,
  speed: 17.0,
  draught: 8.5,
  navigationStatus: 'Under way',
  lastPositionUpdate: new Date(),
  length: 235,
  beam: 32,
  lastPort: 'Port of Spain, Trinidad & Tobago',
  lastPortDate: new Date('2025-09-29T18:47:00'),
  portCalls: [
    {
      port: 'Port of Spain',
      country: 'Trinidad & Tobago',
      arrival: new Date('2025-09-29T18:47:00'),
      departure: new Date('2025-09-29T23:30:00'),
    },
  ],
};

export default function MyPage() {
  return (
    <ContainerTracking 
      vesselData={vesselData} 
      containerId="MSCU1234567"
    />
  );
}
```

## Integration with Real AIS Providers

To integrate with real-time AIS data providers, you can use services like:

1. **VesselFinder API** - https://www.vesselfinder.com/api
2. **MarineTraffic API** - https://www.marinetraffic.com/en/ais-api-services
3. **AIS Hub** - https://www.aishub.net
4. **ShipStation** - https://shipstation.com

### Example Integration (VesselFinder)

```typescript
// lib/ais-provider.ts
export async function fetchVesselData(imo: string) {
  const response = await fetch(
    `https://api.vesselfinder.com/vessel?imo=${imo}&apikey=${process.env.VESSELFINDER_API_KEY}`
  );
  
  const data = await response.json();
  
  return {
    id: data.IMO,
    name: data.NAME,
    imo: data.IMO,
    mmsi: data.MMSI,
    latitude: data.LAT,
    longitude: data.LON,
    course: data.COURSE,
    speed: data.SPEED,
    navigationStatus: data.NAVSTAT,
    // ... map other fields
  };
}
```

## Customization

### Styling

The component uses Tailwind CSS classes and can be customized by modifying the component styles:

```tsx
// Customize map height
<div ref={mapContainer} className="w-full h-[600px]" />

// Customize card appearance
<Card className="border-2 border-blue-500">
  {/* content */}
</Card>
```

### Map Styles

Change the Mapbox map style by modifying the `style` parameter:

```typescript
map.current = new mapboxgl.Map({
  container: mapContainer.current,
  style: 'mapbox://styles/mapbox/satellite-streets-v12', // or other styles:
  // 'mapbox://styles/mapbox/streets-v12'
  // 'mapbox://styles/mapbox/dark-v11'
  // 'mapbox://styles/mapbox/light-v11'
  // 'mapbox://styles/mapbox/outdoors-v12'
  center: [vesselData.longitude, vesselData.latitude],
  zoom: 6,
});
```

## Sample Data

The system includes sample vessel data for testing:

### Vessel 1: MSC MANYA
- **Route:** Trinidad & Tobago → Brazil
- **Container IDs:** MSCU1234567, MSCU1234568, MSCU1234569
- **Status:** Under way
- **ETA:** 3 days

### Vessel 2: MAERSK ESSEX
- **Route:** Shanghai → Los Angeles
- **Container IDs:** MAEU7654321, MAEU7654322, MAEU7654323
- **Status:** Under way
- **ETA:** 7 days

## Real-time Updates

To enable real-time position updates:

1. Set up a webhook endpoint for your AIS provider
2. Configure the provider to send updates to `/api/container-tracking`
3. The system will automatically update vessel positions

Example webhook configuration:
```json
{
  "webhook_url": "https://your-domain.com/api/container-tracking",
  "update_interval": 300,
  "vessels": ["9275397", "9321483"]
}
```

## Environment Variables

Add to your `.env.local`:

```bash
# Mapbox (already configured)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoicm9hZHN0ZXIyNzA4IiwiYSI6ImNtZjZ1cTUxcDBrbHkyaXB4dHBkMjNkdXcifQ.PvB9LzOy7gQHpmn5cdr0AQ

# AIS Provider API Keys (optional)
VESSELFINDER_API_KEY=your_api_key_here
MARINETRAFFIC_API_KEY=your_api_key_here
```

## Navigation Status Codes

The system supports standard AIS navigation status codes:

- **Under way** - Vessel is moving
- **At anchor** - Vessel is anchored
- **Moored** - Vessel is moored to a dock
- **Not under command** - Vessel has lost control
- **Restricted maneuverability** - Limited movement capability
- **Constrained by draught** - Limited by water depth
- **Engaged in fishing** - Fishing vessel
- **Under way sailing** - Sailing vessel

## Troubleshooting

### Map Not Loading
- Verify Mapbox token is valid
- Check browser console for errors
- Ensure `mapbox-gl` is installed: `npm install mapbox-gl`

### Vessel Not Found
- Verify container/vessel ID format
- Check API endpoint is accessible
- Review sample data in `/api/container-tracking/route.ts`

### Position Not Updating
- Confirm AIS provider webhook is configured
- Check webhook logs in API route
- Verify vessel is actively transmitting AIS signals

## Future Enhancements

- [ ] Weather overlay on map
- [ ] Route prediction algorithms
- [ ] Multiple vessel tracking on single map
- [ ] Email/SMS notifications for ETA changes
- [ ] Historical voyage playback
- [ ] Port congestion indicators
- [ ] Customs documentation integration
- [ ] Carbon footprint tracking

## Support

For issues or questions:
1. Check this documentation
2. Review the component code in `components/container-tracking.tsx`
3. Check API route in `app/api/container-tracking/route.ts`
4. Review Mapbox documentation: https://docs.mapbox.com

---

**Last Updated:** September 30, 2025
**Version:** 1.0.0





















































