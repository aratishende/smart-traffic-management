const VEHICLE_TYPES = ['Car', 'Bus', 'Bike', 'Truck', 'Ambulance', 'Van', 'Taxi', 'Scooter'];

export function vehicleId(n: number): string {
  return `${VEHICLE_TYPES[(n - 1) % VEHICLE_TYPES.length]} ${n}`;
}
