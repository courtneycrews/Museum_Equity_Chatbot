document.getElementById("send-button").addEventListener("click", sendMessage);

document.querySelectorAll(".topic-button").forEach(button => {
    button.addEventListener("click", () => {
        const userPrompt = button.getAttribute("data-prompt");
        const botResponse = button.getAttribute("data-response");

        // Append the user's input and predefined bot response
        appendMessage("user", userPrompt);
        appendMessage("bot", botResponse);

        // Clear the input field (if necessary)
        document.getElementById("user-input").value = "";
    });
});

async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();

    if (!userInput) return;

    appendMessage("user", userInput);

    const commonResponses = {
        hello: "Hi there! How can I assist you today?",
        hi: "Hello! What would you like to know about arts pay equity?",
        hey: "Hey there! Feel free to ask me anything.",
        thanks: "You're welcome! Let me know if there's anything else I can do.",
        bye: "Goodbye! Have a great day.",
    };

    const lowerCaseInput = userInput.toLowerCase();
    if (commonResponses[lowerCaseInput]) {
        appendMessage("bot", commonResponses[lowerCaseInput]);
        document.getElementById("user-input").value = "";
        return;
    }

    try {
        const response = await fetch("https://museum-equity-chatbot.onrender.com/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userInput }),
        });

        if (response.ok) {
            const data = await response.json();
            appendMessage("bot", data.text);
        } else {
            appendMessage("bot", "Error: Unable to fetch response.");
        }
    } catch (error) {
        appendMessage("bot", "Error: Unable to connect to the server.");
    } finally {
        document.getElementById("user-input").value = "";
    }
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.innerHTML = message.replace(/\n/g, "<br>");
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}