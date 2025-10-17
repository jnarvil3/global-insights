import * as THREE from 'three';

/**
 * Convert lat/lng coordinates to 3D sphere position
 * @param lat Latitude in degrees (-90 to 90)
 * @param lng Longitude in degrees (-180 to 180)
 * @param radius Sphere radius (default: 2 for Earth)
 * @returns THREE.Vector3 position on sphere
 */
export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number = 2
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Get position along a beam from surface to peak
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @param height Height above surface (0 to 1, where 1 is full beam height)
 * @param maxHeight Maximum beam height in units
 * @returns THREE.Vector3 position along beam
 */
export function getBeamPosition(
  lat: number,
  lng: number,
  height: number,
  maxHeight: number = 1.5
): THREE.Vector3 {
  const baseRadius = 2;
  const currentRadius = baseRadius + height * maxHeight;
  return latLngToVector3(lat, lng, currentRadius);
}

/**
 * Calculate distance between two lat/lng points (Haversine formula)
 * @param lat1 First point latitude
 * @param lng1 First point longitude
 * @param lat2 Second point latitude
 * @param lng2 Second point longitude
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate centroid of multiple lat/lng points
 * @param points Array of {lat, lng} coordinates
 * @returns Centroid {lat, lng}
 */
export function calculateCentroid(
  points: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (points.length === 0) return { lat: 0, lng: 0 };
  if (points.length === 1) return points[0];

  let x = 0;
  let y = 0;
  let z = 0;

  for (const point of points) {
    const latRad = (point.lat * Math.PI) / 180;
    const lngRad = (point.lng * Math.PI) / 180;

    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  }

  x /= points.length;
  y /= points.length;
  z /= points.length;

  const lngRad = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const latRad = Math.atan2(z, hyp);

  return {
    lat: (latRad * 180) / Math.PI,
    lng: (lngRad * 180) / Math.PI,
  };
}
