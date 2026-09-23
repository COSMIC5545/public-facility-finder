import json
from pathlib import Path


# Project paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

OUTPUT_FILE = DATA_DIR / "facilities.json"


# Raw OSM files
SOURCE_FILES = {
    "toilet": DATA_DIR / "kochi_toilets.geojson",
    "drinking_water": DATA_DIR / "kochi_drinking_water.geojson",
    "water_tap": DATA_DIR / "kochi_water_taps.geojson",
}


def get_coordinates(feature):
    """Extract latitude and longitude from a GeoJSON feature."""

    geometry = feature.get("geometry", {})
    geometry_type = geometry.get("type")

    if geometry_type == "Point":
        longitude, latitude = geometry["coordinates"][:2]
        return latitude, longitude

    return None, None


def get_accessibility(tags):
    """Convert OSM wheelchair information into a common field."""

    wheelchair = tags.get("wheelchair")

    if wheelchair == "yes":
        return "Accessible"
    elif wheelchair == "limited":
        return "Limited"
    elif wheelchair == "no":
        return "Not accessible"

    return "Unknown"


def normalize_feature(feature, facility_type, source_updated_at):
    """Convert one OSM feature into our common facility format."""

    properties = feature.get("properties", {})
    latitude, longitude = get_coordinates(feature)

    osm_id = properties.get("@id", "unknown")

    # Remove the OSM object type prefix for a cleaner ID
    clean_osm_id = osm_id.replace("/", "-")

    facility_id = f"{facility_type}-{clean_osm_id}"

    tags = properties

    name = tags.get("name")

    if not name:
        if facility_type == "toilet":
            name = "Public Toilet"
        elif facility_type == "drinking_water":
            name = "Drinking Water Point"
        else:
            name = "Drinking Water Tap"

    address_parts = []

    if tags.get("addr:housenumber"):
        address_parts.append(tags["addr:housenumber"])

    if tags.get("addr:street"):
        address_parts.append(tags["addr:street"])

    address = ", ".join(address_parts) if address_parts else None

    facility = {
        "facility_id": facility_id,
        "osm_id": osm_id,
        "name": name,
        "facility_type": facility_type,
        "latitude": latitude,
        "longitude": longitude,
        "address": address,
        "operator": tags.get("operator"),
        "access": tags.get("access"),
        "accessibility": get_accessibility(tags),

        # These fields will be populated by our application/reporting system.
        # We do not invent current facility conditions.
        "availability": "Unknown",
        "condition": "Unknown",
        "status_updated_at": None,

        # OSM source timestamp is kept separately from facility condition updates.
        "source": "OpenStreetMap",
        "source_updated_at": source_updated_at,

        # To be assigned by our application's ticket-routing system later.
        "responsible_local_body": None,

        # Current records originate from OSM; they are not automatically
        # government-certified facility records.
        "verification_status": "OSM-sourced",
    }

    return facility


def load_source_file(file_path):
    """Load a GeoJSON file."""

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def main():
    facilities = []

    for facility_type, file_path in SOURCE_FILES.items():

        data = load_source_file(file_path)

        source_updated_at = data.get("timestamp")

        for feature in data.get("features", []):
            facility = normalize_feature(
                feature,
                facility_type,
                source_updated_at
            )

            facilities.append(facility)

    output = {
        "city": "Kochi",
        "source": "OpenStreetMap",
        "source_method": "Overpass API",
        "facility_count": len(facilities),
        "facilities": facilities,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=2, ensure_ascii=False)

    print(f"Created: {OUTPUT_FILE}")
    print(f"Total facilities: {len(facilities)}")


if __name__ == "__main__":
    main()