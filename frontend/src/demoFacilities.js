// =====================================================
// PROTOTYPE DEMO FACILITIES
// =====================================================
// These are prototype-only facilities.
// They are generated around the user's live/search location.
// They must NOT be presented as official facilities.
// =====================================================

export function createDemoFacilities(centerLocation) {
  if (!centerLocation) {
    return []
  }

  const now = new Date().toISOString()

  return [
    {
      facility_id: 'demo-toilet-wheelchair',
      name: 'Accessible Community Toilet',
      facility_type: 'toilet',
      latitude: centerLocation.latitude + 0.0018,
      longitude: centerLocation.longitude + 0.0015,
      address: 'Demo location near you',
      operator: 'Prototype Facility',
      access: 'yes',
      accessibility: 'Accessible',
      accessibility_options: ['wheelchair'],
      availability: 'Available',
      condition: 'Good',
      status_updated_at: now,
      source: 'Prototype Demo',
      source_updated_at: now,
      responsible_local_body: 'Kochi Local Body',
      verification_status: 'Prototype Demo',
      is_demo: true,
    },

    {
      facility_id: 'demo-toilet-male',
      name: 'Community Toilet — Male',
      facility_type: 'toilet',
      latitude: centerLocation.latitude - 0.0022,
      longitude: centerLocation.longitude + 0.0018,
      address: 'Demo location near you',
      operator: 'Prototype Facility',
      access: 'yes',
      accessibility: 'Male',
      accessibility_options: ['male'],
      availability: 'Available',
      condition: 'Good',
      status_updated_at: now,
      source: 'Prototype Demo',
      source_updated_at: now,
      responsible_local_body: 'Kochi Local Body',
      verification_status: 'Prototype Demo',
      is_demo: true,
    },

    {
      facility_id: 'demo-toilet-female',
      name: 'Community Toilet — Female',
      facility_type: 'toilet',
      latitude: centerLocation.latitude + 0.0025,
      longitude: centerLocation.longitude - 0.002,
      address: 'Demo location near you',
      operator: 'Prototype Facility',
      access: 'yes',
      accessibility: 'Female',
      accessibility_options: ['female'],
      availability: 'Available',
      condition: 'Good',
      status_updated_at: now,
      source: 'Prototype Demo',
      source_updated_at: now,
      responsible_local_body: 'Kochi Local Body',
      verification_status: 'Prototype Demo',
      is_demo: true,
    },

    {
      facility_id: 'demo-toilet-unisex',
      name: 'Accessible Unisex Toilet',
      facility_type: 'toilet',
      latitude: centerLocation.latitude - 0.0015,
      longitude: centerLocation.longitude - 0.0025,
      address: 'Demo location near you',
      operator: 'Prototype Facility',
      access: 'yes',
      accessibility: 'Unisex',
      accessibility_options: ['unisex'],
      availability: 'Available',
      condition: 'Good',
      status_updated_at: now,
      source: 'Prototype Demo',
      source_updated_at: now,
      responsible_local_body: 'Kochi Local Body',
      verification_status: 'Prototype Demo',
      is_demo: true,
    },

    {
      facility_id: 'demo-water-nearby',
      name: 'Public Drinking Water Point',
      facility_type: 'drinking_water',
      latitude: centerLocation.latitude + 0.001,
      longitude: centerLocation.longitude - 0.0015,
      address: 'Demo location near you',
      operator: 'Prototype Facility',
      access: 'yes',
      accessibility: 'Accessible',
      accessibility_options: ['wheelchair'],
      availability: 'Available',
      condition: 'Good',
      status_updated_at: now,
      source: 'Prototype Demo',
      source_updated_at: now,
      responsible_local_body: 'Kochi Local Body',
      verification_status: 'Prototype Demo',
      is_demo: true,
    },

    {
      facility_id: 'demo-water-accessible',
      name: 'Accessible Drinking Water Station',
      facility_type: 'drinking_water',
      latitude: centerLocation.latitude - 0.001,
      longitude: centerLocation.longitude + 0.003,
      address: 'Demo location near you',
      operator: 'Prototype Facility',
      access: 'yes',
      accessibility: 'Accessible',
      accessibility_options: ['wheelchair'],
      availability: 'Available',
      condition: 'Good',
      status_updated_at: now,
      source: 'Prototype Demo',
      source_updated_at: now,
      responsible_local_body: 'Kochi Local Body',
      verification_status: 'Prototype Demo',
      is_demo: true,
    },
  ]
}