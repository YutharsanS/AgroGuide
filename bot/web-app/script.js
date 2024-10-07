
const inputField = document.getElementById("user-input");
const outputArea = document.getElementById("output");

// Function to sanitize input by removing control characters
function sanitizeInput(input) {
    return input.replace(/[\u0000-\u0019]+/g, ""); // Remove control characters
}
// function getResponseMessage(responseText) {
//     // Use replace to remove the unwanted parts
//     const message = responseText.replace(/^\{"result":"|"\}$/g, '');
    
//     // Unescape any escaped quotes within the message
//     return message.replace(/\\"/g, '"');
// }

// Function to handle sending messages
async function sendMessage() {
    // Get the user input
    let userInput = inputField.value;
    userInput = sanitizeInput(userInput); // Sanitize the input to remove unwanted characters

    // Check if input is not empty
    if (!userInput) {
        alert("Please enter a message.");
        return;
    }

    // Clear the input field
    inputField.value = "";
    console.log("User:", userInput);

    // Prepare the payload to send
    const payload = JSON.stringify({ message: userInput });
    console.log("Payload being sent to Ballerina:", payload);

    // Make a POST request to the Ballerina service
    try {
        const response = await fetch('http://127.0.0.1:8080/chatbot', { // Ballerina service URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload // Send user input as JSON
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        // Log the raw response to see if there's any formatting issue
        const responseText = await response.text();
        console.log("Raw response text:", responseText);
        // const response={responseText};

        // Try to parse the JSON response
        // let data;
        // try {
        //     data = JSON.parse(responseText); // Parse the response text as JSON
        // } catch (jsonError) {
        //     console.error("Error parsing JSON response:", jsonError);
        //     outputArea.innerHTML += `<p><strong>Error:</strong> Invalid JSON response.</p>`;
        //     return;
        // }

        // Log the parsed response for debugging
        // console.log("Parsed response JSON:", data);
        // const message = getResponseMessage(responseText);
        // Display the response from the chatbot
        if (responseText) {
            outputArea.innerHTML += `<p><strong>AI:</strong> ${responseText}</p>`;
        } else {
            console.error("Unexpected response structure:");
            outputArea.innerHTML += `<p><strong>Error:</strong> Unexpected response structure from the server.</p>`;
        }
    } catch (error) {
        console.error("Error sending message:", error);
        outputArea.innerHTML += `<p><strong>Error:</strong> Could not get a response from the server.</p>`;
    } finally {
        // Scroll to the bottom of the output area
        console.log("finally");
        outputArea.scrollTop = outputArea.scrollHeight;
    }
}

// Attach event listener to the input field to send message on Enter key
inputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage(); // Call sendMessage when Enter is pressed
    }
});

// Optional: You can also attach a button to trigger the sendMessage function
const sendButton = document.getElementById("send-button");
sendButton.addEventListener("click", sendMessage);
