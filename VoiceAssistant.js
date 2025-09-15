import React, { useState, useEffect, useRef, useCallback } from 'react';

const VoiceAssistant = ({ onNavigate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef(null);

  // Navigation keywords mapping (Kannada)
  const navigationKeywords = {
    'ಮುಖ್ಯ': 'home',
    'ಹೋಮ್': 'home',
    'ನೀರು': 'irrigation',
    'ಸಿಂಪಡಿಸುವಿಕೆ': 'irrigation',
    'ಸೆನ್ಸಾರ್': 'sensors',
    'ಮಾಪನ': 'sensors',
    'ರೋಗ': 'disease-detection',
    'ಬಳೆ': 'disease-detection',
    'ಗಿಡ': 'plant-info',
    'ಸಸ್ಯ': 'plant-info',
    'ನನ್ನ ಕ್ಷೇತ್ರ': 'my-farm',
    'ಮೈ ಫಾರ್ಮ್': 'my-farm',
    'ಧ್ವನಿ': 'voice-assistant',
    'ಸಹಾಯಕ': 'voice-assistant',
    'ಸೆಟ್ಟಿಂಗ್': 'settings',
    'ಸೆಟ್ಟಿಂಗ್ಸ್': 'settings',
    'ನಮ್ಮ ಬಗ್ಗೆ': 'about',
    'ಅಬೌಟ್': 'about'
  };

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'kn-IN'; // Kannada

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setResponse('ಕೇಳುತ್ತಿದ್ದೇನೆ... ದಯವಿಟ್ಟು ಮಾತನಾಡಿ');
      };

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setTranscript(speechResult);
        processVoiceInput(speechResult);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setResponse('ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceInput = useCallback(async (input) => {
    setIsProcessing(true);
    try {
      const lowerInput = input.toLowerCase();

      // Check for navigation commands
      for (const [keyword, page] of Object.entries(navigationKeywords)) {
        if (lowerInput.includes(keyword.toLowerCase())) {
          // Navigate to the page
          if (onNavigate) {
            onNavigate(page);
          }

          // Set response in Kannada
          const pageNames = {
            'home': 'ಮುಖ್ಯ ಪುಟ',
            'irrigation': 'ನೀರು ನಿರ್ವಹಣೆ',
            'sensors': 'ಸೆನ್ಸಾರ್ ಮಾಹಿತಿ',
            'disease-detection': 'ರೋಗ ಪತ್ತೆ',
            'plant-info': 'ಗಿಡ ಮಾಹಿತಿ',
            'my-farm': 'ನನ್ನ ಕ್ಷೇತ್ರ',
            'voice-assistant': 'ಧ್ವನಿ ಸಹಾಯಕ',
            'settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
            'about': 'ನಮ್ಮ ಬಗ್ಗೆ'
          };

          setResponse(`${pageNames[page] || page} ಪುಟಕ್ಕೆ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಲಾಗಿದೆ.`);
          setIsProcessing(false);
          return;
        }
      }

      // Handle other queries
      if (lowerInput.includes('ನೀರು') || lowerInput.includes('ಸಿಂಪಡಿಸುವಿಕೆ')) {
        setResponse('ನೀರು ನಿರ್ವಹಣೆಗಾಗಿ ನಿಮ್ಮ ಕ್ಷೇತ್ರದ ಮಾಹಿತಿಯನ್ನು ನೋಡಿ. ಸರಾಸರಿ ಆವಶ್ಯಕತೆಯು ದಿನಕ್ಕೆ 5-7 ಲೀಟರ್ ಪ್ರತಿ ಗಿಡ.');
      } else if (lowerInput.includes('ರೋಗ') || lowerInput.includes('ಬಳೆ')) {
        setResponse('ಗಿಡದ ರೋಗ ಪತ್ತೆಗಾಗಿ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ರೋಗದ ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ.');
      } else if (lowerInput.includes('ಸೆನ್ಸಾರ್') || lowerInput.includes('ಮಾಪನ')) {
        setResponse('ಸೆನ್ಸಾರ್ ಮಾಹಿತಿಯು ನಿಮ್ಮ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಲಭ್ಯ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಮತ್ತು ತಾಪಮಾನವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.');
      } else if (lowerInput.includes('ಗಿಡ') || lowerInput.includes('ಸಸ್ಯ')) {
        setResponse('ಗಿಡ ಮಾಹಿತಿ ವಿಭಾಗದಲ್ಲಿ ನೀವು ವಿವಿಧ ಬೆಳೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿ ಪಡೆಯಬಹುದು.');
      } else {
        setResponse('ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ನೀರು ನಿರ್ವಹಣೆ, ರೋಗ ಪತ್ತೆ, ಅಥವಾ ಇತರ ಕೃಷಿ ಸಂಬಂಧಿತ ಮಾಹಿತಿಗಾಗಿ ಕೇಳಿ.');
      }

    } catch (error) {
      console.error('Error processing voice input:', error);
      setResponse('ಕ್ಷಮಿಸಿ, ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.');
    }
    setIsProcessing(false);
  }, [onNavigate]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="voice-assistant-container" style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#2c5530', marginBottom: '20px', textAlign: 'center' }}>
        ಧ್ವನಿ ಸಹಾಯಕ (Voice Assistant)
      </h2>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          style={{
            backgroundColor: isListening ? '#dc3545' : '#2c5530',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '50px',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(44, 85, 48, 0.3)'
          }}
        >
          {isListening ? '🛑 ನಿಲ್ಲಿಸಿ' : '🎤 ಮಾತನಾಡಿ'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#2c5530', marginBottom: '10px' }}>ನಿಮ್ಮ ಮಾತು:</h3>
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #ddd',
          minHeight: '50px',
          fontSize: '16px'
        }}>
          {transcript || 'ಮಾತನಾಡಲು ಬಟನ್ ಒತ್ತಿ...'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#2c5530', marginBottom: '10px' }}>ಉತ್ತರ:</h3>
        <div style={{
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #ddd',
          minHeight: '50px',
          fontSize: '16px'
        }}>
          {response || 'ಉತ್ತರ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ...'}
        </div>
      </div>

      {isProcessing && (
        <div style={{
          textAlign: 'center',
          color: '#2c5530',
          fontWeight: 'bold',
          marginTop: '20px'
        }}>
          ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ...
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e8f5e8',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h4 style={{ color: '#2c5530', marginBottom: '10px' }}>ನ್ಯಾವಿಗೇಷನ್ ಕಮಾಂಡ್‌ಗಳು:</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>• "ಮುಖ್ಯ" - ಮುಖ್ಯ ಪುಟ</li>
          <li>• "ನೀರು" - ನೀರು ನಿರ್ವಹಣೆ</li>
          <li>• "ಸೆನ್ಸಾರ್" - ಸೆನ್ಸಾರ್ ಮಾಹಿತಿ</li>
          <li>• "ರೋಗ" - ರೋಗ ಪತ್ತೆ</li>
          <li>• "ಗಿಡ" - ಗಿಡ ಮಾಹಿತಿ</li>
          <li>• "ನನ್ನ ಕ್ಷೇತ್ರ" - ನನ್ನ ಕ್ಷೇತ್ರ</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAssistant;