// Mock data for initial state
export const INITIAL_USERS = [
  { id: 'u1', name: 'Commander Reyes', role: 'dispatcher', avatar: '👤', online: true },
  { id: 'u2', name: 'Pilot Nova', role: 'pilot', avatar: '🧑‍✈️', online: true, crewId: 'c1' },
  { id: 'u3', name: 'Engineer Kaz', role: 'crew', avatar: '🔧', online: true, crewId: 'c1' },
  { id: 'u4', name: 'Medic Chen', role: 'crew', avatar: '⚕️', online: true, crewId: 'c1' },
  { id: 'u5', name: 'Pilot Vance', role: 'pilot', avatar: '🧑‍✈️', online: true, crewId: 'c2' },
  { id: 'u6', name: 'Gunner Thorne', role: 'crew', avatar: '🎯', online: false, crewId: 'c2' },
  { id: 'u7', name: 'Dispatcher Orion', role: 'dispatcher', avatar: '📡', online: true },
];

export const INITIAL_CREWS = [
  {
    id: 'c1',
    name: 'Phoenix Squadron',
    callsign: 'PHOENIX-1',
    ship: 'Cutlass Red',
    status: 'available',
    capabilities: ['SAR', 'Medical', 'CSAR'],
    location: 'Crusader - Port Olisar',
    members: ['u2', 'u3', 'u4']
  },
  {
    id: 'c2',
    name: 'Starrunner Team',
    callsign: 'STARRUN-7',
    ship: 'Starfarer',
    status: 'on-mission',
    capabilities: ['Refueling', 'Cargo'],
    location: 'Stanton - ARC-L1',
    members: ['u5', 'u6']
  },
];

export const INITIAL_REQUESTS = [
  {
    id: 'r1',
    type: 'SAR',
    priority: 'high',
    status: 'pending',
    location: 'Daymar - Shubin Mining SMO-18',
    description: 'Pilot stranded after ship malfunction. Low oxygen reported.',
    requesterId: 'client1',
    requesterName: 'Citizen_Jake',
    createdAt: Date.now() - 1200000,
    assignedCrew: null,
    dispatcherId: null,
  },
  {
    id: 'r2',
    type: 'Refueling',
    priority: 'medium',
    status: 'assigned',
    location: 'CRU-L4 - Deep Space',
    description: 'Hull C requires emergency refuel. Quantum fuel depleted.',
    requesterId: 'client2',
    requesterName: 'HaulerMax',
    createdAt: Date.now() - 3600000,
    assignedCrew: 'c2',
    dispatcherId: 'u1',
  },
];
