const API_KEY = "Add API Key Here";

const researchData = `
1. The Alchemy of High-Performing Arts Organizations: A Spotlight on Organizations of Color: "Research indicates that the nonprofit arts and culture sector has not been inclusive of communities of color. Dr. Zannie Voss of SMU DataArts notes, there remains a significant gap in racial representation between both the general arts workforce and arts audiences, relative to the general population. Source: SMU DataArts (2021)"
2. Gender Gap Report, 2017: "Women hold only 30% of museum director positions in the U.S., and those positions are concentrated in institutions with smaller budgets. Men hold 70% of directorships and are more likely to lead museums with budgets over $15 million. Source: Association of Art Museum Directors (AAMD, 2017)"
3. Americans Speak Out About the Arts in 2023: "A national survey revealed that 86% of Americans believe arts and culture are important to their community's quality of life and livability. However, only 51% feel that everyone in their community has equal access to the arts, highlighting ongoing challenges in accessibility. Source: Americans for the Arts (2023)"
4. MMF 2023 Report on Workplace Equity and Organizational Culture in US Art Museums: "While 82% of art museum workers believe they are doing meaningful work, 60% are considering leaving their jobs, and 68% are contemplating exiting the field entirely. Major sources of dissatisfaction include low pay, burnout, and limited opportunities for career advancement. Additionally, 74% of workers cannot consistently cover basic living expenses with their museum compensation alone, indicating significant financial precarity within the sector. Source: Museums Moving Forward (2023)"
`;

document.getElementById("send-button").addEventListener("click", sendMessage);

async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();

    if (!userInput) return; // Do nothing for empty input

    appendMessage("user", userInput);

    // Handle specific cases locally
    const commonResponses = {
        hello: "Hi there! How can I assist you today?",
        Hello: "Hi there! How can I assist you today?",
        hi: "Hello! What would you like to know about arts pay equity?",
        Hi: "Hello! What would you like to know about arts pay equity?",
        hey: "Hey there! Feel free to ask me anything.",
        Hey: "Hey there! Feel free to ask me anything",
        thanks: "You're welcome! Let me know if there's anything else I can do.",
        Thanks: "You're welcome! Let me know if there's anything else I can do.",
        bye: "Goodbye! Have a great day.",
        Bye: "Goodbye!",
    };

    const lowerCaseInput = userInput.toLowerCase();
    if (commonResponses[lowerCaseInput]) {
        appendMessage("bot", commonResponses[lowerCaseInput]);
        document.getElementById("user-input").value = ""; // Clear the input field
        return;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant specializing in arts equity. Always prioritize the provided research when answering questions and include citations where appropriate and offer an insightful aggregation of the conclusions when appropriate. If the provided research does not cover the user's query, use your knowledge to provide a thoughtful and accurate response. Clearly indicate when external reasoning or general knowledge is used." },
                    { role: "assistant", content: `Here is the research data you should prioritize:\n${researchData}` },
                    { role: "user", content: userInput },
                ],
                max_tokens: 300,
                temperature: 0.2,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            appendMessage("bot", data.choices[0].message.content.trim());
        } else {
            appendMessage("bot", "Error: Unable to fetch response from OpenAI API.");
        }
    } catch (error) {
        appendMessage("bot", "Error: Unable to connect to OpenAI API.");
    } finally {
        // Clear the input field, even if there’s an error
        document.getElementById("user-input").value = "";
    }
}

// Helper function to append messages to the chat box
function appendMessage(sender, message) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.innerHTML = message.replace(/\n/g, "<br>"); // Allow line breaks in messages
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the latest message
}