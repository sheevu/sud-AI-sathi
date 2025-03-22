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
const govSchemesButton = document.getElementById('govSchemes');

// OpenAI API configuration
const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key-here';

// Weather API configuration (OpenWeatherMap)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'your-weather-api-key';
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
        return `मौसम अपडेट:\nतापमान: ${data.main.temp}°C\nआद्रता: ${data.main.humidity}%\nमौसम: ${data.weather[0].description}`;
    } catch (error) {
        return 'मौसम की जानकारी प्राप्त करने में त्रुटि हुई।';
    }
}

// Enhanced OpenAI interaction for farming context
async function sendToOpenAI(message) {
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
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return 'क्षमा करें, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।';
    }
}

// Handle send button click with enhanced farming context
sendButton.addEventListener('click', async () => {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        sendButton.disabled = true;

        let response;
        if (message.includes('फसल') || message.includes('crop')) {
            const conditions = { weather: 'normal' }; // This would be dynamic based on actual weather data
            const recommendation = await getCropRecommendation(conditions);
            response = recommendation.message;
        } else if (message.includes('सिंचाई') || message.includes('irrigation')) {
            response = getIrrigationAdvice('drip');
        } else {
            response = await sendToOpenAI(message);
        }

        addMessage(response);
        speakText(response);
        sendButton.disabled = false;
    }
});

// Enhanced voice input handling
talkButton.addEventListener('click', () => {
    recognition.start();
    talkButton.disabled = true;
    addMessage('बोलिए, मैं सुन रहा हूं...', false);
});

recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendButton.click();
};

recognition.onend = () => {
    talkButton.disabled = false;
};

// Enhanced image upload for disease detection
uploadButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            addMessage(`फोटो अपलोड की गई: ${file.name}`, true);
            // Here you would process the image and send it to your ML model
            const diseaseAnalysis = await detectDisease(file);
            addMessage(diseaseAnalysis);
            speakText(diseaseAnalysis);
        }
    };
    input.click();
});

// Get user's location for weather updates
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const weather = await getWeatherForecast(position.coords.latitude, position.coords.longitude);
        addMessage(weather);
    });
}

// Initialize with a welcome message
window.addEventListener('load', () => {
    const welcomeMessage = "नमस्ते! मैं आपका कृषि सहायक हूं। मैं आपकी मदद कैसे कर सकता हूं?\n\n" +
                         "1. फसल सलाह के लिए\n" +
                         "2. बीमारी पहचान के लिए फोटो अपलोड करें\n" +
                         "3. सिंचाई सलाह के लिए\n" +
                         "4. मौसम की जानकारी के लिए";
    addMessage(welcomeMessage);
    speakText(welcomeMessage);
});

// Handle government schemes button
govSchemesButton.addEventListener('click', async () => {
    const message = "Please tell me about the latest government schemes for farmers in India.";
    addMessage(message, true);
    const response = await sendToOpenAI(message);
    addMessage(response);
    speakText(response);
});

// Language selector functionality
const languageSelector = document.getElementById('language');
languageSelector.addEventListener('change', (e) => {
    const language = e.target.value;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    // Update UI text based on selected language
    // This would need a proper i18n implementation
}); 