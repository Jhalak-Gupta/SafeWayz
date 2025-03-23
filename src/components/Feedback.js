import React, { useState } from "react";
import axios from "axios";
import './Feedback.css';

const Feedback = () => {
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:5000/submit_feedback", {
                latitude,
                longitude,
                comment,
                rating,
            });
            alert("Feedback submitted successfully!");
        } 
        catch (error) {
            console.error("Error submitting feedback:", error);
        }
    };

    return (
        <div className="feedback-container">
            <h2>Submit Feedback</h2>
            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="left-section">
                    <input 
                        type="text" 
                        placeholder="Latitude" 
                        value={latitude} 
                        onChange={(e) => setLatitude(e.target.value)} 
                        required 
                    />
                    <input 
                        type="text" 
                        placeholder="Longitude" 
                        value={longitude} 
                        onChange={(e) => setLongitude(e.target.value)} 
                        required 
                    />
                    <input 
                        type="number" 
                        min="1" max="5" 
                        placeholder="Rating (1-5)" 
                        value={rating} 
                        onChange={(e) => setRating(e.target.value)} 
                        required 
                    />
                </div>
                <div className="right-section">
                    <textarea 
                        placeholder="Comment..." 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                        required 
                    />
                </div>
                <div className="submit-container">
                    <button type="submit" onClick = {handleSubmit}>Submit</button>
                </div>                
            </form> 
        </div>
    );
};

export default Feedback;