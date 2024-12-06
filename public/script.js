const API_KEY = "your-api-key-here"; // Replace with your API key if not already using environment variables.

document.getElementById("send-button").addEventListener("click", sendMessage);

async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    const chatBox = document.getElementById("chat-box");

    if (!userInput) return;

    // Append user message
    appendMessage("user", userInput);

    try {
        // Send request to OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant prioritizing research data and structured information." },
                    { role: "user", content: userInput },
                ],
                max_tokens: 150,
                temperature: 0.7,
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
    }

    document.getElementById("user-input").value = ""; // Clear the input field
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