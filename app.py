from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import openrouteservice
import pandas as pd
import geopandas as gpd
import sqlite3
from shapely.geometry import Point

app = Flask(__name__)
CORS(app)

ORS_API_KEY = "5b3ce3597851110001cf6248c715cad1f98642e5a1aae8e9178839d4"
CRIME_API_URL = "https://data.cityofnewyork.us/resource/5uac-w243.json"
client = openrouteservice.Client(key=ORS_API_KEY)

conn = sqlite3.connect("database.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    latitude REAL,
    longitude REAL,
    rating INTEGER
)
''')
conn.commit()

@app.route("/get_crime_data", methods=["GET"])
def get_crime_data():
    response = requests.get(CRIME_API_URL)
    if response.status_code == 200:
        crime_data = pd.DataFrame(response.json())
        if "latitude" in crime_data and "longitude" in crime_data:
            crime_data = crime_data[['latitude', 'longitude']].dropna()
            crime_data["latitude"] = crime_data["latitude"].astype(float)
            crime_data["longitude"] = crime_data["longitude"].astype(float)
            return jsonify(crime_data.to_dict(orient="records"))
    return jsonify({"error": "Could not fetch crime data"}), 500

def get_safety_score(lat, lon, crime_data, feedback_data, radius=300):
    point = Point(lon, lat)
    crime_gdf = gpd.GeoDataFrame(
        crime_data, geometry=gpd.points_from_xy(crime_data.longitude, crime_data.latitude)
    )
    crime_gdf.set_crs(epsg=4326, inplace=True)
    nearby_crimes = crime_gdf[crime_gdf.distance(point) < radius].shape[0]

    feedback_gdf = gpd.GeoDataFrame(
        feedback_data, geometry=gpd.points_from_xy(feedback_data.longitude, feedback_data.latitude)
    )
    feedback_gdf.set_crs(epsg=4326, inplace=True)
    nearby_feedback = feedback_gdf[feedback_gdf.distance(point) < radius]
    avg_rating = nearby_feedback["rating"].mean() if not nearby_feedback.empty else 3
    feedback_effect = (5 - avg_rating) * 2 

    safety_score = nearby_crimes + feedback_effect
    return safety_score

@app.route("/get_safe_route", methods=["POST"])
def get_safe_route():
    data = request.json
    start_coords = data["start"]
    end_coords = data["end"]

    crime_data = get_crime_data().json
    cursor.execute("SELECT latitude, longitude, rating FROM feedback")
    feedback_data = pd.DataFrame(cursor.fetchall(), columns=["latitude", "longitude", "rating"])

    route = client.directions(
        coordinates=[[start_coords[1], start_coords[0]], [end_coords[1], end_coords[0]]], 
        profile="foot-walking",
        format="geojson",
        radiuses=[1000, 1000]
    )

    safe_route = []
    for step in route["features"][0]["geometry"]["coordinates"]:
        lat, lon = step[1], step[0]
        safety_score = get_safety_score(lat, lon, pd.DataFrame(crime_data), feedback_data)
        safe_route.append({"lat": lat, "lon": lon, "safety_score": safety_score})

    return jsonify(safe_route)

@app.route("/submit_feedback", methods=["POST"])
def submit_feedback():
    data = request.json
    latitude = data["latitude"]
    longitude = data["longitude"]
    comment = data.get("comment", "")
    rating = data.get("rating", 0)

    cursor.execute("INSERT INTO feedback (latitude, longitude, comment, rating) VALUES (?, ?, ?, ?)",
                   (latitude, longitude, comment, rating))
    conn.commit()

    return jsonify({"message": "Feedback submitted successfully"}), 201

@app.route("/get_feedback", methods=["GET"])
def get_feedback():
    cursor.execute("SELECT * FROM feedback")
    feedback_data = cursor.fetchall()
    feedback_list = [
        {"latitude": row[1], "longitude": row[2], "comment": row[3], "rating": row[4]} for row in feedback_data
    ]
    return jsonify(feedback_list)

@app.route("/")
def home():
    return "Safe Route Recommendation System Backend is Running!"

if __name__ == "__main__":
    app.run(debug=True)
    
"""
Sample Input:
Start: 40.748817,-73.985428
End: 40.730610,-73.935242
"""
