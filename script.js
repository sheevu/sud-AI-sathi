// Initialize speech recognition with Hindi support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'hi-IN'; // Default to Hindi
recognition.interimResults = true;

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
        humidity: "आर्द्रता"
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
        humidity: "Humidity"
    }
};

// Function to add message to chat
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
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

// Function to handle chat input
async function handleChatInput(message) {
    if (!message.trim()) return;

    addMessage(message, true);
    userInput.value = '';
    sendButton.disabled = true;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                language: document.getElementById('languageSelector').value
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }

        addMessage(data.response, false);
        
        // Speak the response if it's in Hindi
        if (document.getElementById('languageSelector').value === 'hi') {
            speakText(data.response);
        }

    } catch (error) {
        console.error('Chat Error:', error);
        const errorMessage = document.getElementById('languageSelector').value === 'hi'
            ? 'माफ़ कीजिए, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, an error occurred. Please try again.';
        addMessage(errorMessage, false);
    }

    sendButton.disabled = false;
}

// Event Listeners
startButton.addEventListener('click', () => {
    chatSection.scrollIntoView({ behavior: 'smooth' });
});

learnMoreButton.addEventListener('click', () => {
    document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
});

sendButton.addEventListener('click', () => {
    handleChatInput(userInput.value);
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatInput(userInput.value);
    }
});

talkButton.addEventListener('click', () => {
    recognition.start();
    talkButton.disabled = true;
    addMessage('बोलिए, मैं सुन रहा हूं...', false);
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    handleChatInput(transcript);
};

recognition.onend = () => {
    talkButton.disabled = false;
};

uploadButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            addMessage(`फोटो अपलोड की गई: ${file.name}`, true);
            addMessage('फोटो का विश्लेषण किया जा रहा है...');
            // Here you would typically send the image to your AI model
            setTimeout(() => {
                addMessage('इस फोटो में फसल स्वस्थ दिखाई दे रही है। कोई रोग का लक्षण नहीं दिखाई दे रहा है।');
            }, 2000);
        }
    };
    input.click();
});

weatherButton.addEventListener('click', () => {
    weatherWidget.scrollIntoView({ behavior: 'smooth' });
});

// Welcome message when the page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        addMessage('नमस्ते! मैं किसान साथी हूं, आपकी कृषि सहायता के लिए उपस्थित हूं। आप मुझसे कृषि संबंधी कोई भी प्रश्न पूछ सकते हैं।\n\nHello! I am Kisaan Saathi, here to help you with farming. You can ask me any agriculture-related questions.');
    }, 1000);

    // Get weather data
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const weatherData = await getWeatherForecast(position.coords.latitude, position.coords.longitude);
            updateWeatherWidget(weatherData);
        });
    }
});

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

    // Initialize weather display
    updateWeather();

    // Add welcome message
    addMessage('assistant', translations[currentLang].welcome);

    // Language switching
    languageSelector.addEventListener('change', function(e) {
        currentLang = e.target.value;
        updateLanguage();
    });

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
        addMessage('assistant', loadingMessage);

        try {
            // Make API call to OpenAI
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, language: currentLang })
            });

            if (!response.ok) {
                throw new Error('API call failed');
            }

            const data = await response.json();
            
            // Remove loading message
            chatMessages.removeChild(chatMessages.lastChild);
            
            // Add AI response
            addMessage('assistant', data.response);

        } catch (error) {
            console.error('Error:', error);
            // Remove loading message
            chatMessages.removeChild(chatMessages.lastChild);
            // Add error message
            addMessage('assistant', currentLang === 'hi' ? 
                'माफ़ कीजिए, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।' : 
                'Sorry, an error occurred. Please try again.'
            );
        }
    }

    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Enter key press
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Update language throughout the interface
    function updateLanguage() {
        userInput.placeholder = translations[currentLang].placeholder;
        document.querySelector('.features h2').textContent = translations[currentLang].features;
        document.querySelector('.chat-header h3').textContent = translations[currentLang].askQuestion;
        updateWeather();
    }

    // Weather functionality
    function updateWeather() {
        const temperature = Math.floor(Math.random() * 15) + 20;
        const humidity = Math.floor(Math.random() * 30) + 50;
        const descriptions = {
            hi: ['साफ़ आसमान', 'आंशिक बादल', 'बादल छाए'],
            en: ['Clear Sky', 'Partly Cloudy', 'Cloudy']
        };
        const descIndex = Math.floor(Math.random() * 3);

        document.getElementById('temperature').textContent = `${temperature}°C`;
        document.getElementById('humidity').textContent = `${translations[currentLang].humidity}: ${humidity}%`;
        document.getElementById('weatherDescription').textContent = descriptions[currentLang][descIndex];
    }

    // Button click handlers
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
        alert(currentLang === 'hi' ? 'आवाज सुविधा जल्द ही उपलब्ध होगी' : 'Voice feature coming soon');
    });

    diseaseButton.addEventListener('click', () => {
        alert(currentLang === 'hi' ? 'रोग पहचान सुविधा जल्द ही उपलब्ध होगी' : 'Disease detection feature coming soon');
    });

    // Initial language update
    updateLanguage();
}); 