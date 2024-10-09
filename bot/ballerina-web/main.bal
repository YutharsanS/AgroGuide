import ballerina/http;
import ballerina/io;
// import ballerinax/mysql;
// import ballerina/sql;
// import ballerinax/mysql.driver as _;

// type databaseConfig record {|
//     string host;
//     string user;
//     string password;
//     string database;
//     int port;
// |};

// configurable databaseConfig connection = ?;

// mysql:Client pool = check new (...connection);

//core configure
@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowHeaders: ["Content-Type"],
        allowMethods: ["GET", "POST", "OPTIONS"]
    }
}
// Define the service
service /chatbot on new http:Listener(8080) {

    // Resource function to handle POST requests to the /chatbot endpoint
    resource function post .(http:Caller caller, http:Request req) returns error? {
        // Retrieve the message from the request payload
        json payload = check req.getJsonPayload();
        string message = (check payload.message).toString(); // Get the user's message
        io:println("Sending message to Python chatbot: " + message);

        // Call the Python server with the message and get the response
        json response = (check callPythonChatbot(message)).toString();
        io:println("response: ", response);

        // Send the response back to the client
        check caller->respond(response);


   
    }
    // Resource function to handle POST requests to the /getContent endpoint
//     resource function post getContent(http:Caller caller, http:Request req) returns error? {
//         json _ = check req.getJsonPayload();

//         // Execute the SQL query
//         // stream<record {|anydata...;|}, sql:Error?> resultStream = pool->query(`SELECT * FROM content`);
//         // json[] resultJson = [];

//         // // Process the result stream and build the JSON response
//         // check resultStream.forEach(function(record {|anydata...;|} row) {
//         //     map<json> rowJson = {};
//         //     foreach var [key, value] in row.entries() {
//         //         rowJson[key] = <json>value;
//         //     }
//         //     resultJson.push(rowJson);
//         // });
//         json resultJson = check  getContent();

//         // Send the result back to the client
//         check caller->respond(resultJson);
//     }
}
    
// }

// Function to call the Python chatbot

function callPythonChatbot(string message) returns json|error {
    // Define the Python chatbot API URL
    string pythonApiUrl = "http://localhost:5002";
    json payload = {"message": message}; // Prepare the request payload

    // Create a new HTTP client for the Python API
    http:Client pythonClient = check new (pythonApiUrl);

    // Log the payload to verify what is being sent
    io:println("Sending payload to Python chatbot: ", payload.toString());

    // Send a POST request to the Python chatbot
    http:Response response = check pythonClient->post("/chatbot", payload);

    // Log the entire response body as a string to see if it's valid JSON or not
    string responseBody = (check (check response.getJsonPayload()).result).toString();

    // string responseMessage = check response.response;

    io:println("Raw response from Python chatbot: ", responseBody);

    // Check if the response is JSON. If not, log an error message.
    json jsonResponse;
    if response.getContentType() == "application/json" {
        // Parse the response to JSON only if it's of type application/json
        jsonResponse = check (check response.getJsonPayload()).result;

    } else {
        io:println("Error: Received a non-JSON response from the Python server.");
        return error("Non-JSON response: " + responseBody);
    }

    return jsonResponse;
    // string boturl = "http://localhost:5001";
    // json payloa = { "message": message };

}

// get content from database
// function getContent() returns json|error {

//     // Execute the SQL query
//         stream<record {|anydata...;|}, sql:Error?> resultStream = pool->query(`SELECT * FROM content`);
//         json[] resultJson = [];

//         // Process the result stream and build the JSON response
//         check resultStream.forEach(function(record {|anydata...;|} row) {
//             map<json> rowJson = {};
//             foreach var [key, value] in row.entries() {
//                 rowJson[key] = <json>value;
//             }
//             resultJson.push(rowJson);
//         });
        
//         return resultJson;
//         }





