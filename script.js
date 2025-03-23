// Initialize speech recognition with Hindi support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'hi-IN'; // Default to Hindi
    recognition.interimResults = true;
}

// Initialize speech synthesis
const synth = window.speechSynthesis;

// Chat elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendMessage');
const talkButton = document.getElementById('talkToAI');
const uploadButton = document.getElementById('uploadImage');
const weatherButton = document.getElementById('weatherInfo');
const startButton = document.getElementById('startBtn');
const learnMoreButton = document.getElementById('learnMoreBtn');
const chatSection = document.getElementById('chatSection');
const weatherWidget = document.getElementById('weatherWidget');

// OpenAI API configuration
const WEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY || 'your-weather-api-key';
const WEATHER_API_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';

// Predefined crop recommendations based on conditions
const cropRecommendations = {
    drought: {
        crops: ['बाजरा (Bajra)', 'ज्वार (Jowar)', 'मोठ (Moth)', 'मखाना (Makhana)'],
        reasons: 'सूखा प्रतिरोधी फसलें, कम पानी की आवश्यकता'
    },
    normal: {
        crops: ['गेहूं (Wheat)', 'चावल (Rice)', 'दाल (Pulses)', 'मसाले (Spices)'],
        reasons: 'अच्छी पैदावार, बाजार में मांग'
    },
    rainy: {
        crops: ['धान (Paddy)', 'मक्का (Corn)', 'अरहर (Pigeon Pea)', 'मूंग (Green Gram)'],
        reasons: 'बारिश के मौसम के लिए उपयुक्त'
    }
};

// Irrigation techniques database
const irrigationTechniques = {
    drip: {
        hindi: 'टपक सिंचाई',
        description: 'पानी की बूंद-बूंद बचत के साथ सिंचाई',
        upcycling: 'पुरानी पीवीसी पाइप का उपयोग करके टपक सिंचाई सिस्टम बनाएं'
    },
    sprinkler: {
        hindi: 'फव्वारा सिंचाई',
        description: 'समान वितरण के साथ छिड़काव सिंचाई',
        upcycling: 'पुरानी प्लास्टिक बोतलों से फव्वारा बनाएं'
    },
    furrow: {
        hindi: 'कुंड सिंचाई',
        description: 'नालियों के माध्यम से सिंचाई',
        upcycling: 'प्लास्टिक शीट का उपयोग करके नालियों को लाइन करें'
    }
};

// Disease detection database
const commonDiseases = {
    'wheat_rust': {
        hindi: 'गेहूं का रतुआ',
        symptoms: 'पत्तियों पर भूरे धब्बे',
        organic_treatment: 'नीम का तेल स्प्रे',
        chemical_treatment: 'प्रोपिकोनाज़ोल फंगीसाइड'
    },
    'rice_blast': {
        hindi: 'धान का ब्लास्ट',
        symptoms: 'पत्तियों पर सफेद धब्बे',
        organic_treatment: 'त्रिकोडर्मा विरिडी',
        chemical_treatment: 'कार्बेन्डाजिम'
    }
};

// Language translations
const translations = {
    hi: {
        welcome: "किसान साथी में आपका स्वागत है",
        placeholder: "यहां टाइप करें...",
        start: "शुरू करें",
        learnMore: "और जानें",
        features: "हमारी विशेषताएं",
        aiAssistant: "AI सहायक",
        weatherInfo: "मौसम जानकारी",
        cropHealth: "फसल स्वास्थ्य",
        askQuestion: "अपने प्रश्न पूछें",
        loading: "लोड हो रहा है...",
        humidity: "आर्द्रता",
        error: "माफ़ कीजिए, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।"
    },
    en: {
        welcome: "Welcome to Kisaan Sathi",
        placeholder: "Type here...",
        start: "Get Started",
        learnMore: "Learn More",
        features: "Our Features",
        aiAssistant: "AI Assistant",
        weatherInfo: "Weather Info",
        cropHealth: "Crop Health",
        askQuestion: "Ask Your Questions",
        loading: "Loading...",
        humidity: "Humidity",
        error: "Sorry, an error occurred. Please try again."
    }
};

// Function to add message to chat
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to speak text in Hindi
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9; // Slightly slower for better Hindi pronunciation
    synth.speak(utterance);
}

// Function to analyze crop recommendation based on conditions
async function getCropRecommendation(conditions) {
    const weatherCondition = conditions.weather === 'dry' ? 'drought' : 
                           conditions.weather === 'rainy' ? 'rainy' : 'normal';
    
    const recommendation = cropRecommendations[weatherCondition];
    return {
        message: `आपके लिए अनुशंसित फसलें:\n${recommendation.crops.join('\n')}\n\nकारण: ${recommendation.reasons}`,
        crops: recommendation.crops
    };
}

// Function to get irrigation advice
function getIrrigationAdvice(technique) {
    const advice = irrigationTechniques[technique];
    return `${advice.hindi}\n${advice.description}\nपुन: उपयोग तकनीक: ${advice.upcycling}`;
}

// Function to detect crop disease from image
async function detectDisease(imageData) {
    // Here you would typically send the image to a machine learning model
    // For demo, we'll return a sample response
    const disease = commonDiseases.wheat_rust;
    return `रोग पहचान: ${disease.hindi}\nलक्षण: ${disease.symptoms}\nजैविक उपचार: ${disease.organic_treatment}\nरासायनिक उपचार: ${disease.chemical_treatment}`;
}

// Function to get weather forecast
async function getWeatherForecast(lat, lon) {
    try {
        const response = await fetch(`${WEATHER_API_ENDPOINT}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=hi`);
        const data = await response.json();
        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            description: data.weather[0].description,
            icon: data.weather[0].icon
        };
    } catch (error) {
        console.error('Weather Error:', error);
        return null;
    }
}

// Function to update weather widget
async function updateWeatherWidget(weatherData) {
    const weatherContent = document.querySelector('.weather-content');
    if (!weatherData) {
        weatherContent.innerHTML = '<p>मौसम की जानकारी उपलब्ध नहीं है</p>';
        return;
    }

    weatherContent.innerHTML = `
        <div class="weather-info">
            <img src="https://openweathermap.org/img/wn/${weatherData.icon}@2x.png" alt="Weather icon">
            <div class="weather-details">
                <p class="temperature">${Math.round(weatherData.temp)}°C</p>
                <p class="description">${weatherData.description}</p>
                <p class="humidity">आद्रता: ${weatherData.humidity}%</p>
            </div>
        </div>
    `;
}

// Initialize the chat interface
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const languageSelector = document.getElementById('languageSelector');
    const startButton = document.getElementById('startButton');
    const learnMoreButton = document.getElementById('learnMoreButton');
    const weatherButton = document.getElementById('weatherButton');
    const voiceButton = document.getElementById('voiceButton');
    const diseaseButton = document.getElementById('diseaseButton');

    // Current language
    let currentLang = 'hi';

    // Add welcome message
    addMessage('assistant', translations[currentLang].welcome);

    // Send message function
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage('user', message);
        
        // Clear input
        userInput.value = '';

        // Add loading message
        const loadingMessage = translations[currentLang].loading;
        const loadingDiv = addMessage('assistant', loadingMessage);

        try {
            // Get the current URL
            const baseUrl = window.location.origin;
            
            // Make API call
            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: currentLang
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Remove loading message
            if (loadingDiv && loadingDiv.parentNode) {
                chatMessages.removeChild(loadingDiv);
            }
            
            // Add AI response
            if (data.error) {
                addMessage('assistant', translations[currentLang].error);
            } else {
                addMessage('assistant', data.response);
                
                // Speak response if in Hindi
                if (currentLang === 'hi' && synth) {
                    const utterance = new SpeechSynthesisUtterance(data.response);
                    utterance.lang = 'hi-IN';
                    synth.speak(utterance);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            // Remove loading message
            if (loadingDiv && loadingDiv.parentNode) {
                chatMessages.removeChild(loadingDiv);
            }
            // Add error message
            addMessage('assistant', translations[currentLang].error);
        }
    }

    // Enhanced Buttons to send pre-defined queries
    weatherButton.addEventListener('click', () => {
        const prompt = 'Lucknow ka mausam kaisa hai?';
        userInput.value = prompt;
        sendMessage();
    });

    const cropButton = document.getElementById('cropButton');
    if (cropButton) {
        cropButton.addEventListener('click', () => {
            const prompt = 'March mein kis crop ki kheti karun?';
            userInput.value = prompt;
            sendMessage();
        });
    }

    const irrigationButton = document.getElementById('irrigationButton');
    if (irrigationButton) {
        irrigationButton.addEventListener('click', () => {
            const prompt = 'Paani ki bachat ke liye kaunsa irrigation method best hai?';
            userInput.value = prompt;
            sendMessage();
        });
    }

    // Other event listeners
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    startButton.addEventListener('click', () => {
        document.querySelector('.chat-container').scrollIntoView({ behavior: 'smooth' });
    });

    learnMoreButton.addEventListener('click', () => {
        document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
    });

    weatherButton.addEventListener('click', () => {
        updateWeather();
    });

    voiceButton.addEventListener('click', () => {
        if (recognition) {
            recognition.start();
        } else {
            alert(currentLang === 'hi' ? 'आवाज सुविधा उपलब्ध नहीं है' : 'Voice feature not available');
        }
    });

    diseaseButton.addEventListener('click', () => {
        alert(currentLang === 'hi' ? 'रोग पहचान सुविधा जल्द ही उपलब्ध होगी' : 'Disease detection feature coming soon');
    });

    // Voice recognition event handlers
    if (recognition) {
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            sendMessage();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    }

    // Language switching
    languageSelector.addEventListener('change', function(e) {
        currentLang = e.target.value;
        updateLanguage();
    });

    // Update language throughout the interface
    function updateLanguage() {
        userInput.placeholder = translations[currentLang].placeholder;
        document.querySelector('.features h2').textContent = translations[currentLang].features;
        document.querySelector('.chat-header h3').textContent = translations[currentLang].askQuestion;
        updateWeather();
    }

  function updateWeather() {
  if (!navigator.geolocation) {
    document.getElementById("weatherDescription").textContent = "GPS उपलब्ध नहीं है";
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const apiKey = "d404bc3b32msh0c92cb8f3ea7cfap1d6e84jsn3ed1ad9bde9e"; // Replace with your actual key

    const url = `https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?lat=${lat}&lon=${lon}`;
    const options = {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "weather-by-api-ninjas.p.rapidapi.com"
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      document.getElementById("temperature").textContent = `${data.temp}°C`;
      document.getElementById("humidity").textContent = `आर्द्रता: ${data.humidity}%`;
      document.getElementById("weatherDescription").textContent = "ताज़ा जानकारी प्राप्त हो गई";
    } catch (error) {
      document.getElementById("weatherDescription").textContent = "डेटा नहीं मिला";
      console.error(error);
    }
  });
}
 // Initialize weather
    updateWeather();
    // Initial language update
    updateLanguage();
});

// Welcome message when the page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        addMessage('assistant', translations[currentLang].welcome);
    }, 1000);

    // Get weather data
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const weatherData = await getWeatherForecast(position.coords.latitude, position.coords.longitude);
            updateWeatherWidget(weatherData);
        });
    }
});
