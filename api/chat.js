import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, language } = req.body;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are किसान साथी (Kisaan Saathi), a knowledgeable farming assistant who speaks ${language === 'hi' ? 'Hindi' : 'English'}. 
                    Your primary role is to help Indian farmers with agricultural advice, focusing on:
                    1. Sustainable farming practices
                    2. Crop disease identification and treatment
                    3. Weather-based farming recommendations
                    4. Government schemes and support
                    5. Modern farming techniques
                    
                    ${language === 'hi' ? 'Always respond in Hindi.' : 'Always respond in English.'}
                    Keep responses practical and actionable.
                    Include traditional farming wisdom when relevant.`
                },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        res.status(200).json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ 
            error: language === 'hi' 
                ? 'माफ़ कीजिए, कोई त्रुटि हुई। कृपया पुनः प्रयास करें।' 
                : 'Sorry, an error occurred. Please try again.' 
        });
    }
} 