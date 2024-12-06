const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const resources = require("./resources");
const payData = require("./public/paydata.json");
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
app.use(express.static(path.join(__dirname, "public")));

// Helper functions
function findResource(prompt) {
    return resources.find(resource =>
        prompt.toLowerCase().includes(resource.topic.toLowerCase())
    );
}

function lookupPayData(location, jobTitle) {
    location = location?.toLowerCase();
    jobTitle = jobTitle?.toLowerCase();

    if (payData[location] && payData[location][jobTitle]) {
        const data = payData[location][jobTitle];
        return `In ${location}, the average salary for a ${jobTitle} at a ${data.type_of_museum} is $${data.salary}. See more: ${data.research_report}`;
    }
    return null;
}

// POST route for the chatbot
app.post("/chat", async (req, res) => {
    const { prompt } = req.body;
    console.log("Prompt Received:", prompt);

    const resource = findResource(prompt);
    const resourceContext = resource ? resource.context : "";
    const sources = resource
        ? resource.sources.map((source, index) => `${index + 1}. [${source.title}](${source.link})`).join("\n")
        : "No specific references found for this topic.";

    try {
        // Call OpenAI API with the context
        const apiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a professional assistant providing museum pay and equity information, referencing the provided academic sources where possible." },
                    { role: "user", content: `Topic: ${prompt}\n\nContext: ${resourceContext}\n\nSources:\n${sources}` }
                ],
                max_tokens: 150,
                temperature: 0.7,
            }),
        });

        if (!apiResponse.ok) {
            console.error("OpenAI API error:", await apiResponse.text());
            res.status(500).json({ error: "Error fetching data from OpenAI API." });
            return;
        }

        const apiData = await apiResponse.json();
        const openAIResponse = apiData.choices[0].message.content.trim();

        // Add mock data if applicable
        let mockDataResponse = "";
        let location = null;
        let jobTitle = null;

        if (prompt.toLowerCase().includes("new york")) location = "new york";
        if (prompt.toLowerCase().includes("texas")) location = "texas";
        if (prompt.toLowerCase().includes("curator")) jobTitle = "curator";
        if (prompt.toLowerCase().includes("registrar")) jobTitle = "registrar";

        const mockResult = lookupPayData(location, jobTitle);
        if (mockResult) {
            mockDataResponse = `\n\nAdditional Data:\n${mockResult}`;
        }

        res.json({ text: `${openAIResponse}\n\nSources:\n${sources}${mockDataResponse}` });
    } catch (error) {
        console.error("Error in /chat route:", error.message || error);
        res.status(500).json({ error: "Error communicating with OpenAI API or processing references." });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});