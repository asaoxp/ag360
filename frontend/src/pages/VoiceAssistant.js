import React, { useState, useEffect, useRef } from 'react';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [commandHistory, setCommandHistory] = useState([
    { id: 1, command: "Turn on irrigation for Zone A", response: "Irrigation for Zone A has been turned on", time: "10:25 AM" },
    { id: 2, command: "What is the soil moisture in Zone B?", response: "The soil moisture in Zone B is currently at 38%", time: "9:45 AM" },
    { id: 3, command: "Check for disease in tomato plants", response: "No diseases detected in tomato plants", time: "8:30 AM" }
  ]);
  const recognitionRef = useRef(null);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
  ];

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
          
        setTranscript(transcript);
        
        if (event.results[0].isFinal) {
          handleVoiceCommand(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const handleVoiceCommand = (command) => {
    // Mock responses for different commands
    let responseText = '';
    
    if (command.toLowerCase().includes('irrigation') || command.toLowerCase().includes('water')) {
      responseText = 'Irrigation system activated for all zones. Watering for 15 minutes.';
    } else if (command.toLowerCase().includes('soil moisture')) {
      responseText = 'Current soil moisture levels: Zone A: 42%, Zone B: 38%, Zone C: 35%';
    } else if (command.toLowerCase().includes('temperature')) {
      responseText = 'Current temperature is 28°C with humidity at 58%';
    } else if (command.toLowerCase().includes('disease')) {
      responseText = 'Scanning plants for diseases... No diseases detected at this time.';
    } else if (command.toLowerCase().includes('weather')) {
      responseText = 'Current weather: Sunny, 28°C. No rain expected today.';
    } else {
      responseText = 'I understood your command: "' + command + '". However, I\'m not sure how to respond to that specific request. Try asking about irrigation, soil moisture, or plant health.';
    }
    
    setResponse(responseText);
    
    // Add to command history
    const newCommand = {
      id: commandHistory.length + 1,
      command: command,
      response: responseText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setCommandHistory([newCommand, ...commandHistory]);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setResponse('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const handleTextCommand = (e) => {
    e.preventDefault();
    const command = e.target.command.value;
    if (command.trim()) {
      handleVoiceCommand(command);
      e.target.command.value = '';
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Voice Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Voice Control</h2>
          <p className="mb-6 text-gray-600">Control your farm operations using voice commands</p>
          
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Voice Input</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl mb-4 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-green-500 hover:bg-green-600'
                  } transition duration-300`}
                >
                  {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
                <p className="text-gray-600">
                  {isListening ? 'Listening... Speak now' : 'Click microphone to start'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Or Type Your Command</label>
            <form onSubmit={handleTextCommand}>
              <div className="flex">
                <input 
                  type="text" 
                  name="command"
                  placeholder="Type your command here..."
                  className="flex-grow border border-gray-300 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 rounded-r-lg hover:bg-green-700 transition duration-300"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Voice Assistant Response</h2>
          
          <div className="border border-gray-200 rounded-lg p-6 mb-6 min-h-40">
            {transcript && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">You said:</p>
                <p className="text-lg font-medium">{transcript}</p>
              </div>
            )}
            
            {response ? (
              <div>
                <p className="text-sm text-gray-500">Assistant:</p>
                <p className="text-lg font-medium text-green-700">{response}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No response yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Speak or type a command to get a response
                </p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-3">Available Voice Commands</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
                <p className="ml-2">"Turn on irrigation for Zone A"</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
                <p className="ml-2">"What is the soil moisture in Zone B?"</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
                <p className="ml-2">"Check for diseases in tomato plants"</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
                <p className="ml-2">"What is the current temperature?"</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">•</div>
                <p className="ml-2">"Show me the weather forecast"</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Command History</h2>
          <button className="text-green-600 hover:text-green-800 font-medium">
            Clear History
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Command</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {commandHistory.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{entry.command}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{entry.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;