import asyncio
import json
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from google.genai import types

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TripStop(BaseModel):
    city: str
    days: int
    hotel_location: Optional[str] = "City Center"

class TripRequest(BaseModel):
    country: str
    arrival_city_or_airport: str
    departure_city_or_airport: str
    stops: List[TripStop]
    total_days: int
    budget: float
    currency: str
    interests: List[str]
    flight_arrival_time: Optional[str] = "10:00 AM"
    flight_departure_time: Optional[str] = "06:00 PM"

# Supported stable endpoints
MODELS_TO_TRY = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite"
]

@app.post("/api/generate-itinerary")
async def generate_itinerary(request: TripRequest):
    async def event_generator():
        try:
            if not client:
                yield f"data: {json.dumps({'status': 'Error: Missing GEMINI_API_KEY in backend environment.'})}\n\n"
                return

            interests_str = ", ".join(request.interests) if request.interests else "General Sightseeing"
            primary_interest = request.interests[0] if request.interests else "Exploration"
            
            yield f"data: {json.dumps({'status': 'Connecting to Gemini API...'})}\n\n"
            await asyncio.sleep(0.1)

            stops_summary = "\n".join([f"- {s.city}: {s.days} days (Hotel area: {s.hotel_location})" for s in request.stops])

            prompt = f"""
            You are an expert travel agent. Generate a complete, day-by-day travel itinerary for a {request.total_days}-day trip to {request.country}.

            Route & Cities:
            {stops_summary}

            Trip Constraints:
            - Arrival: {request.arrival_city_or_airport} at {request.flight_arrival_time} (Include customs clearance, luggage pick up, airport transfer, and hotel check-in).
            - Departure: {request.departure_city_or_airport} at {request.flight_departure_time} (Include hotel check-out, luggage storage, afternoon retrieval, and airport transfer).
            - Budget: {request.budget} {request.currency}
            - Primary User Interests: {interests_str}
            - Uniqueness: Ensure EVERY activity across all {request.total_days} days is completely unique with ZERO duplicate attractions.
            - Inter-city transitions: For multi-city stops, explicitly include morning check-out, train/bus transit, and new hotel check-in/luggage drop.

            Return ONLY a valid JSON array of objects representing each day from Day 1 to Day {request.total_days}.
            Exact JSON structure per item:
            {{
                "day": 1,
                "city": "{request.stops[0].city}",
                "title": "Day 1: {request.stops[0].city} Arrival & {primary_interest}",
                "recommended_stay": "{request.stops[0].hotel_location}",
                "activities": [
                    {{
                        "time": "10:00 AM",
                        "title": "Activity Name",
                        "cost": "{request.currency} 15",
                        "transit_info": "Subway / Bus details"
                    }}
                ]
            }}
            """

            response = None
            last_error = None

            for model_name in MODELS_TO_TRY:
                for attempt in range(2):
                    try:
                        yield f"data: {json.dumps({'status': f'Trying {model_name}...'})}\n\n"
                        
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt,
                            config=types.GenerateContentConfig(
                                response_mime_type="application/json"
                            )
                        )
                        if response and response.text:
                            break
                    except Exception as e:
                        last_error = e
                        err_str = str(e)
                        if "503" in err_str or "429" in err_str or "UNAVAILABLE" in err_str:
                            yield f"data: {json.dumps({'status': f'{model_name} busy or limited, failing over...'})}\n\n"
                            await asyncio.sleep(1.0)
                        else:
                            break
                if response and response.text:
                    break

            if not response or not response.text:
                raise last_error or Exception("No valid response returned from Gemini endpoints.")

            full_itinerary = json.loads(response.text)

            for day_plan in full_itinerary:
                yield f"data: {json.dumps({'type': 'DAY_PLAN', 'payload': day_plan})}\n\n"
                await asyncio.sleep(0.15)

            yield f"data: {json.dumps({'status': 'Itinerary successfully generated!'})}\n\n"

        except Exception as e:
            err_msg = str(e)
            yield f"data: {json.dumps({'status': f'Error: {err_msg}'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )