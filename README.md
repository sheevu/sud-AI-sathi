# Kisaan Sathi GPT - AI Farming Assistant

An AI-powered farming assistant that helps Indian farmers with agricultural advice, crop management, and weather information. The application supports both Hindi and English languages and provides voice interaction capabilities.

## Features

- 🤖 AI-powered farming advice
- 🌱 Crop disease detection
- 🌦️ Real-time weather information
- 🗣️ Voice interaction support
- 🌍 Bilingual support (Hindi/English)
- 📱 Responsive design

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- AI Integration: OpenAI GPT-3.5 Turbo
- Weather API: OpenWeatherMap
- Voice Recognition: Web Speech API
- Deployment: Vercel

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kisaan-sathi-gpt.git
cd kisaan-sathi-gpt
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
```

4. Run the development server:
```bash
npm start
```

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_WEATHER_API_KEY`: Your OpenWeatherMap API key

## Deployment

This project is configured for deployment on Vercel. To deploy:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add the required environment variables in Vercel's dashboard
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 