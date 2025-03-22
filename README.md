# Kisaan Sathi GPT

A modern AI-powered farming assistant that helps farmers with crop recommendations, disease detection, and weather updates in Hindi and English.

## Features

- 🗣️ Voice Assistant in Hindi
- 🌾 Crop Recommendations
- 💧 Smart Irrigation Tips
- 🔍 Disease Detection
- ⛅ Weather Updates

## Setup & Deployment

1. Clone the repository:
```bash
git clone <your-repo-url>
cd kisaan-sathi-gpt
```

2. Replace API Keys:
- Open `script.js`
- Replace `your-api-key-here` with your OpenAI API key
- Replace `your-weather-api-key` with your OpenWeatherMap API key
- Replace the Font Awesome kit URL in `index.html`

3. Deploy to Vercel:
```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

4. Environment Variables:
Set these in your Vercel project settings:
- `OPENAI_API_KEY`
- `WEATHER_API_KEY`

## Local Development

1. Install a local server:
```bash
npm install -g http-server
```

2. Run the server:
```bash
http-server
```

3. Visit `http://localhost:8080`

## Security Notes

- Never commit API keys to the repository
- Use environment variables for sensitive data
- Enable CORS protection in production

## License

MIT License - Feel free to use and modify 