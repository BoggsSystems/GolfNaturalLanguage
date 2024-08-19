import React, { useState } from "react";
import axios from "axios";
import './App.css'; // Make sure to create this file for custom styles

const App = () => {
  const [description, setDescription] = useState("");
  const [parsedInfo, setParsedInfo] = useState("");
  const [isListening, setIsListening] = useState(false); // State to track if the microphone is listening
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator

  // Function to handle speech recognition
  const handleSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true; // Continue listening until stopped
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true); // Indicate that the microphone is listening
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[event.results.length - 1][0].transcript;
      setDescription((prevDescription) => prevDescription + " " + speechResult); // Append the result to the description
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false); // Stop the listening indicator on error
    };

    recognition.onend = () => {
      setIsListening(false); // Stop the listening indicator when recognition ends
    };

    recognition.start();
  };

  const handleInputSubmit = async () => {
    setIsLoading(true); // Show loading indicator
    setIsListening(false); // Stop the microphone indicator
    try {
      const result = await axios.post("http://127.0.0.1:5000/api/parse_hole", {
        description: description,
      });

      setParsedInfo(result.data.parsed_info);
    } catch (error) {
      console.error("Error parsing hole description", error);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="golf-app-container">
      <h1 className="golf-header">Golf Round AI Assistant</h1>
      <textarea
        className="golf-textarea"
        placeholder="Enter your hole description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="button-group">
        <button onClick={handleInputSubmit} className="golf-submit-button">
          Submit
        </button>
        <button onClick={handleSpeechRecognition} className={`golf-microphone-button ${isListening ? 'listening' : ''}`}>
          🎤 {isListening ? 'Listening...' : 'Use Microphone'}
        </button>
      </div>

      {isLoading && (
        <div className="spinner"></div> // Display spinner while loading
      )}

      {parsedInfo && (
        <div className="golf-result">
          <h2>Parsed Hole Information:</h2>
          <div dangerouslySetInnerHTML={{ __html: parsedInfo }} />
        </div>
      )}
    </div>
  );
};

export default App;
