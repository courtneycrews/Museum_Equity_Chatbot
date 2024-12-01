// Fetch the mock data from a JSON file
async function fetchPayData() {
    const response = await fetch("paydata.json"); // Ensure the file is in the same directory
    const data = await response.json();
    return data;
}

// Search the mock data based on criteria
async function searchPayData(criteria) {
    const data = await fetchPayData();

    return data.filter((item) => {
        return (
            (!criteria.location || item.location.toLowerCase() === criteria.location.toLowerCase()) &&
            (!criteria.job_title || item.job_title.toLowerCase().includes(criteria.job_title.toLowerCase())) &&
            (!criteria.type_of_museum || item.type_of_museum.toLowerCase().includes(criteria.type_of_museum.toLowerCase()))
        );
    });
}

// Handle user interaction
document.getElementById("send-btn").addEventListener("click", async function () {
    const userInput = document.getElementById("user-input").value.trim();
    const chatOutput = document.getElementById("chat-output");

    if (!userInput) {
        chatOutput.innerHTML += `<div class="bot-message">Please enter a query.</div>`;
        return;
    }

    // Display the user's input
    const userMessage = `<div class="user-message">You: ${userInput}</div>`;
    chatOutput.innerHTML += userMessage;

    // Parse criteria from user input
    let criteria = {};
    if (userInput.includes("New York")) criteria.location = "New York";
    if (userInput.includes("Curator")) criteria.job_title = "Curator";
    if (userInput.includes("Art Museum")) criteria.type_of_museum = "Art Museum";

    // Fetch and filter the data
    const results = await searchPayData(criteria);

    // Display the results
    if (results.length > 0) {
        const formattedResults = results
            .map(
                (item) =>
                    `Job Title: ${item.job_title}, Location: ${item.location}, Salary: $${item.salary}, Type of Museum: ${item.type_of_museum}`
            )
            .join("<br>");
        chatOutput.innerHTML += `<div class="bot-message">Here are the results:<br>${formattedResults}</div>`;
    } else {
        chatOutput.innerHTML += `<div class="bot-message">Sorry, no results found for your query.</div>`;
    }

    // Clear the input and scroll to the bottom
    document.getElementById("user-input").value = "";
    chatOutput.scrollTop = chatOutput.scrollHeight;
});