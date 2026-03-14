// UI constants — seed data now lives in the backend DB
export const ALL_TIME_SLOTS = [
  '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM',
  '7:00 PM', '7:30 PM',
]

export const BLOCKED_SLOTS = ['12:00 PM', '7:30 AM']

export const STATUS_META = {
  pending: { label: 'Pending', color: '#ffab40' },
  inprogress: { label: 'In Progress', color: '#00d4ff' },
  done: { label: 'Done', color: '#00e676' },
  cancelled: { label: 'Cancelled', color: '#ff4d6a' },
}

export const NEXT_STATUSES = {
  pending: [['inprogress', '▶ Start'], ['cancelled', '✕ Cancel']],
  inprogress: [['done', '✓ Complete'], ['pending', '◀ Revert']],
  done: [['pending', '↩ Reopen']],
  cancelled: [['pending', '↩ Restore']],
}

export const SERVICES_LIST = ['Exterior Wash', 'Full Detail', 'Paint Polish', 'Ceramic Coating', 'Eco Waterless Wash', 'Engine Bay Clean']
export const VEHICLE_SIZES = ['Compact / Sedan', 'Hatchback / Coupe', 'SUV / Crossover', 'Pickup Truck', 'Minivan / Van', 'Luxury / Sports Car']
export const CONDITIONS = ['🌟 Excellent', '👍 Good', '🤔 Fair', '🧱 Heavily Soiled', '🔨 Needs Work']
export const ROLES = ['Senior Technician', 'Detailing Expert', 'Wash Technician', 'Pickup Driver', 'Reception', 'Supervisor']
export const SHIFTS = ['Morning', 'Afternoon', 'Full Day']


export const dateToIso = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export const todayStr = () => dateToIso()

export function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
export function fmtDateFull(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
