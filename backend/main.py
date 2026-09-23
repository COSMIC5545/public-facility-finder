import json
import math
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Public Facility Finder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "facilities.json"
REPORTS_FILE = Path(__file__).resolve().parent.parent / "data" / "reports.json"
class ReportRequest(BaseModel):
    facility_id: str
    issue_type: str
    description: str
    photo_url: str | None = None

@app.get("/")
def root():
    return {
        "message": "Public Facility Finder API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }

@app.get("/facilities")
def get_facilities(facility_type: str | None = Query(default=None, alias="type")):
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    if facility_type:
        filtered_facilities = [
            facility
            for facility in data["facilities"]
            if facility["facility_type"] == facility_type
        ]

        return {
            **data,
            "facility_count": len(filtered_facilities),
            "facilities": filtered_facilities
        }

    return data

@app.get("/nearby")
def get_nearby_facilities(
    latitude: float,
    longitude: float,
    radius_km: float = Query(default=5.0, gt=0),
    facility_type: str | None = Query(default=None, alias="type")
):
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    nearby_facilities = []

    for facility in data["facilities"]:

        if facility_type and facility["facility_type"] != facility_type:
            continue

        facility_lat = facility["latitude"]
        facility_lon = facility["longitude"]

        lat1 = math.radians(latitude)
        lon1 = math.radians(longitude)
        lat2 = math.radians(facility_lat)
        lon2 = math.radians(facility_lon)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1)
            * math.cos(lat2)
            * math.sin(dlon / 2) ** 2
        )

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        distance_km = 6371 * c

        if distance_km <= radius_km:
            facility_with_distance = {
                **facility,
                "distance_km": round(distance_km, 2)
            }

            nearby_facilities.append(facility_with_distance)

    nearby_facilities.sort(key=lambda facility: facility["distance_km"])

    return {
        "user_location": {
            "latitude": latitude,
            "longitude": longitude
        },
        "radius_km": radius_km,
        "facility_count": len(nearby_facilities),
        "facilities": nearby_facilities
    }


@app.get("/reports")
def get_reports():
    with open(REPORTS_FILE, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data

@app.post("/reports")
def create_report(report: ReportRequest):
    ticket_id = f"TKT-{uuid.uuid4().hex[:8].upper()}"

    new_report = {
        "ticket_id": ticket_id,
        "facility_id": report.facility_id,
        "issue_type": report.issue_type,
        "description": report.description,
        "photo_url": report.photo_url,
        "status": "Submitted",
        "assigned_authority": "Kochi Local Body",
        "created_at": datetime.utcnow().isoformat()
    }
    with open(REPORTS_FILE, "r", encoding="utf-8") as file:
        reports_data = json.load(file)

    reports_data["reports"].append(new_report)

    with open(REPORTS_FILE, "w", encoding="utf-8") as file:
        json.dump(reports_data, file, indent=2, ensure_ascii=False)
        
        return new_report

