const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Exit if OpenAI API key is missing
if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is not defined in the environment variables.");
    process.exit(1);
}

// Serve static files
app.use(express.static(path.join(__dirname, "docs")));

// Research Data
const researchData = `
1. The Alchemy of High-Performing Arts Organizations: A Spotlight on Organizations of Color: "Research indicates that the nonprofit arts and culture sector has not been inclusive of communities of color. Dr. Zannie Voss of SMU DataArts notes, there remains a significant gap in racial representation between both the general arts workforce and arts audiences, relative to the general population. Source: SMU DataArts (2021)"
2. Gender Gap Report, 2017: "Women hold only 30% of museum director positions in the U.S., and those positions are concentrated in institutions with smaller budgets. Men hold 70% of directorships and are more likely to lead museums with budgets over $15 million. Source: Association of Art Museum Directors (AAMD, 2017)"
3. Americans Speak Out About the Arts in 2023: "A national survey revealed that 86% of Americans believe arts and culture are important to their community's quality of life and livability. However, only 51% feel that everyone in their community has equal access to the arts, highlighting ongoing challenges in accessibility. Source: Americans for the Arts (2023)"
4. MMF 2023 Report on Workplace Equity and Organizational Culture in US Art Museums: "While 82% of art museum workers believe they are doing meaningful work, 60% are considering leaving their jobs, and 68% are contemplating exiting the field entirely. Major sources of dissatisfaction include low pay, burnout, and limited opportunities for career advancement. Additionally, 74% of workers cannot consistently cover basic living expenses with their museum compensation alone, indicating significant financial precarity within the sector. Source: Museums Moving Forward (2023)"
5. The Arts and Economic Prosperity 6: "Demonstrates how arts organizations contribute to the local economy, including job creation and revenue generation. Source: Americans for the Arts (2022)"
`;

// Chat API Endpoint
app.post("/chat", async (req, res) => {
    const { prompt } = req.body;

    try {
        const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant specializing in arts equity. Always provide detailed and insightful responses when answering questions, especially when referencing the provided research. Include examples, key statistics, and explanations to ensure your response is thorough. If the provided research does not fully cover the user's query, use your knowledge to offer a thoughtful and accurate response. Always respond thoughtfully, even to simple phrases like greetings or thanks.",
                    },
                    {
                        role: "assistant",
                        content: `Here is the research data you should prioritize:\n${researchData}`,
                    },
                    {
                        role: "user",
                        content: `Question: ${prompt}\n\nPlease provide a detailed answer referencing the provided research where applicable.`,
                    },
                ],
                max_tokens: 500, // Allow for detailed responses
                temperature: 0.2, // Maintain precision and factual accuracy
            }),
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error("OpenAI API error:", errorText);
            res.status(500).json({ error: "Error fetching data from OpenAI API." });
            return;
        }

        const data = await apiResponse.json();
        const openAIResponse = data.choices[0].message.content.trim();
        res.json({ text: openAIResponse });
    } catch (error) {
        console.error("Error in /chat route:", error.message || error);
        res.status(500).json({ error: "Error communicating with OpenAI API." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});