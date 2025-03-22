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
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
// In production, these should be set in your Vercel environment variables
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';
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
        const response = await fetch(OPENAI_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: "You are a knowledgeable farming assistant who speaks Hindi and English. Provide detailed agricultural advice with a focus on sustainable practices."
                }, {
                    role: "user",
                    content: message
                }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        addMessage(aiResponse);
        speakText(aiResponse);
    } catch (error) {
        console.error('Chat Error:', error);
        addMessage('माफ़ कीजिए, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।');
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

// Initialize with a welcome message and weather
window.addEventListener('load', () => {
    const welcomeMessage = "नमस्ते! मैं आपका कृषि सहायक हूं। मैं आपकी मदद कैसे कर सकता हूं?\n\n" +
                         "1. फसल सलाह के लिए\n" +
                         "2. बीमारी पहचान के लिए फोटो अपलोड करें\n" +
                         "3. सिंचाई सलाह के लिए\n" +
                         "4. मौसम की जानकारी के लिए";
    addMessage(welcomeMessage);
    speakText(welcomeMessage);

    // Get weather data
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const weatherData = await getWeatherForecast(position.coords.latitude, position.coords.longitude);
            updateWeatherWidget(weatherData);
        });
    }
}); 