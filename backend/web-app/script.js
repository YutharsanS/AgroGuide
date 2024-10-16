
// const inputField = document.getElementById("user-input");
// const outputArea = document.getElementById("output");

// // Function to sanitize input by removing control characters
// function sanitizeInput(input) {
//     return input.replace(/[\u0000-\u0019]+/g, ""); // Remove control characters
// }

// // Function to handle sending messages
// async function sendMessage() {
//     // Get the user input
//     let userInput = inputField.value;
//     userInput = sanitizeInput(userInput); // Sanitize the input to remove unwanted characters

//     // Check if input is not empty
//     if (!userInput) {
//         alert("Please enter a message.");
//         return;
//     }

//     // Display the user input in the chat output
//     outputArea.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
//     console.log("User:", userInput);

//     // Clear the input field
//     inputField.value = "";

//     // Prepare the payload to send
//     const payload = JSON.stringify({ message: userInput });
//     console.log("Payload being sent to Ballerina:", payload);

//     // Make a POST request to the Ballerina service
//     try {
//         const response = await fetch('http://127.0.0.1:8080/chatbot', { // Ballerina service URL
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: payload // Send user input as JSON
//         });

//         // Check if the response is OK
//         if (!response.ok) {
//             throw new Error(`Error: ${response.status} ${response.statusText}`);
//         }

//         // Log the raw response to see if there's any formatting issue
//         const responseText = await response.text();
//         console.log("Raw response text:", responseText);
//         const message = marked(responseText); // Convert Markdown to HTML
        

//         // Check if the response is not empty
//         if (responseText) {
//             // Assuming the response is in JSON format
//             // const data = JSON.parse(responseText); // Parse the response text as JSON
//             outputArea.innerHTML += `<p><strong>AI:</strong> ${message}</p>`;
//         } else {
//             console.error("Unexpected response structure:");
//             outputArea.innerHTML += `<p><strong>Error:</strong> Unexpected response structure from the server.</p>`;
//         }
//     } catch (error) {
//         console.error("Error sending message:", error);
//         outputArea.innerHTML += `<p><strong>Error:</strong> Could not get a response from the server.</p>`;
//     } finally {
//         // Scroll to the bottom of the output area
//         outputArea.scrollTop = outputArea.scrollHeight;
//     }
// }

// // Attach event listener to the input field to send message on Enter key
// inputField.addEventListener("keypress", function (event) {
//     if (event.key === "Enter") {
//         sendMessage(); // Call sendMessage when Enter is pressed
//     }
// });

// // Optional: You can also attach a button to trigger the sendMessage function
// const sendButton = document.getElementById("send-button");
// sendButton.addEventListener("click", sendMessage);


const inputField = document.getElementById("user-input");
const outputArea = document.getElementById("output");
const sendButton = document.getElementById("send-button");

// Function to sanitize input by removing control characters
function sanitizeInput(input) {
    return input.replace(/[\u0000-\u0019]+/g, ""); // Remove control characters
}

// Function to handle sending messages
async function sendMessage() {
    let userInput = inputField.value;
    userInput = sanitizeInput(userInput); // Sanitize the input to remove unwanted characters

    // Check if input is not empty
    if (!userInput) {
        alert("Please enter a message.");
        return;
    }

    // Display the user input in the chat output
    outputArea.innerHTML += `<p><strong>You:</strong> ${userInput}</p>`;
    console.log("User:", userInput);

    // Clear the input field
    inputField.value = "";

    // Prepare the payload to send
    const payload = JSON.stringify({ message: userInput });
    console.log("Payload being sent to Ballerina:", payload);

    // Optional: Disable the input field and show a loading message
    inputField.disabled = true;
    outputArea.innerHTML += `<p><strong>AI:</strong> Loading...</p>`;

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
        // const message = marked(responseText); // Convert Markdown to HTML

        // Display the AI response in the chat output
        outputArea.innerHTML += `<p><strong>AI:</strong> ${responseText}</p>`;
    } catch (error) {
        console.error("Error sending message:", error);
        outputArea.innerHTML += `<p style="color: red;"><strong>Error:</strong> Could not get a response from the server.</p>`;
    } finally {
        // Re-enable the input field
        inputField.disabled = false;
        // Scroll to the bottom of the output area
        outputArea.scrollTop = outputArea.scrollHeight;
    }
}

// Attach event listener to the input field to send message on Enter key
inputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage(); // Call sendMessage when Enter is pressed
    }
});

// Optional: Attach a button to trigger the sendMessage function
sendButton.addEventListener("click", sendMessage);
