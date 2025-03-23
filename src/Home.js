import React, { useState } from "react";
import axios from "axios";
import Map from "./components/Map";
import Feedback from "./components/Feedback";
import './Home.css'; 

const Home = () => {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [route, setRoute] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:5000/get_safe_route", {
                start: start.split(",").map(Number),
                end: end.split(",").map(Number),
            });
            console.log("Route data received:", response.data);
            setRoute(response.data); 
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    return (
        <div className="home-container">
            <section className="map-section">
                <h2>Find Your Route</h2>
                <form onSubmit={handleSubmit} className="route-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Start (Latitude,Longitude)"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="End (Latitude,Longitude)"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" onClick = {handleSubmit} className="find-route-btn">Search</button>
                </form>
                <Map route={route} />
            </section>
            <Feedback />
        </div>
    );
};

export default Home;
