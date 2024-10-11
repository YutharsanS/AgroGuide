import ballerina/http;
import ballerina/io;
// import ballerina/sql;
// import ballerinax/mysql;
import ballerinax/mysql.driver as _;


// import ballerina/http;
import ballerinax/mongodb;
// import ballerina/io;
import ballerina/lang.value;

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
    resource function post getContent(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();
        string message = (check payload.message).toString();

        // Execute the SQL query
        // stream<record {|anydata...;|}, sql:Error?> resultStream = pool->query(`SELECT * FROM content`);
        // json[] resultJson = [];

        // // Process the result stream and build the JSON response
        // check resultStream.forEach(function(record {|anydata...;|} row) {
        //     map<json> rowJson = {};
        //     foreach var [key, value] in row.entries() {
        //         rowJson[key] = <json>value;
        //     }
        //     resultJson.push(rowJson);
        // });
        // json resultJson = check getContent(message);

        json result = check testVectorSearch(message);
        json resultJson = result;

        // Send the result back to the client
        check caller->respond(resultJson);
    }
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
// function getContent(string message) returns json|error {

//     io:println("Searching for content with category: " + message);

//     // Execute the SQL query
//     // sql:ParameterizedQuery query = `SELECT * FROM content co LEFT OUTER JOIN category c ON co.category_id = c.category_id WHERE c.name LIKE '%' ${message}  '%'`;
//     // stream<record {|anydata...;|}, sql:Error?> resultStream = pool->query(query);
//     json[] resultJson = [];

//     // Process the result stream and build the JSON response
//     check resultStream.forEach(function(record {|anydata...;|} row) {
//         map<json> rowJson = {};
//         foreach var [key, value] in row.entries() {
//             rowJson[key] = <json>value;
//         }
//         resultJson.push(rowJson);
//     });

//     return resultJson;
// }



// MongoDB Atlas configuration
configurable string connection_string = "mongodb+srv://yutharsan:0585@cluster0.z8x37.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
configurable string database = "test";
configurable string collection_name = "qa_documents";

mongodb:Client mongoDb = check new ({
    connection: connection_string
});

function parseEmbedding(json embeddingJson) returns float[]|error {
    float[] embedding = [];
    foreach var value in <json[]>embeddingJson {
        embedding.push(<float>value);
    }
    return embedding;
}

function generateEmbedding(string text) returns float[]|error {
    // Calling embedding endpoint
    // For running embedding locally, first run 'pip install -r requirements.txt'
    // Create run a server api using 'uvicorn embedding_api:app --host 0.0.0.0 --port 8000'
    // Change the link 'https://embedding-api-agro-bot.onrender.com' -> 'http://localhost:8000'
    http:Client embeddingClient = check new ("https://embedding-api-agro-bot.onrender.com"); // deployement on the web very slow because of free tier
    json payload = { "text": text };
    http:Response resp = check embeddingClient->post("/embed", payload);
    json respJson = check resp.getJsonPayload();
    float[] embedding = check parseEmbedding(check respJson.embedding);
    return embedding;
}


function findSimilarAnswers(float[] queryEmbedding, mongodb:Database database, mongodb:Collection dataCollection) returns QAResult[]|error {
    // Mongo db query
    map<json>[] pipeline = [
        {
            "$vectorSearch": {
            "index": "index1",
            "path": "embedding",
            "queryVector": queryEmbedding,
            "numCandidates": 3,
            "limit": 1
            }
        }
    ];

    // The aggregate method return a stream containg results
    stream<QAResult, error?> resultStream = check dataCollection->aggregate(pipeline);

    QAResult[] results = [];

    error? e = resultStream.forEach(function(json doc) {
            do {
                // Access the 'question' and 'answer' fields from the JSON document
                string question = check value:ensureType(doc.question, string);
                string answer = check value:ensureType(doc.answer, string);

                QAResult qaResult = { question: question, answer: answer };
                results.push(qaResult);
            } on fail var err {
                io:println("Error processing document: ", err.message());
            }

            return;
        }
    );

    if e is error {
        return e;
    }

    return results;
}

function testVectorSearch(string userInput) returns json|error {
    // Access the database and collection using name
    mongodb:Database qa_database = check mongoDb->getDatabase(database);
    mongodb:Collection dataCollection = check qa_database->getCollection(collection_name);

    // Test finding similar answers
    float[] queryEmbedding = check generateEmbedding(userInput);
    QAResult[] similarAnswers = check findSimilarAnswers(queryEmbedding, qa_database, dataCollection);
    
    // Convert the similarAnswers array to JSON
    json similarAnswersJson = value:toJson(similarAnswers);

    // Print the JSON (optional)
    io:println(similarAnswersJson);
    
    return similarAnswersJson;
}

// public function main() returns error? {
//     check testVectorSearch("How can I increase water draining in plants");
// }

type QADocument record {|
    string question;
    string answer;
    float[] embedding;
|};

type QAResult record {|
    string question;
    string answer;
|};



// Service for community_posts
service /community on new http:Listener(8081) {
 
    resource function get .(http:Caller caller) returns error? {
        
        // Access the database and collection using name
        mongodb:Database db = check mongoDb->getDatabase("test");
        mongodb:Collection postCollection = check db->getCollection("community_posts");

        PostTest[] response = check getPosts(postCollection);
        
        // Convert the stream to a JSON array
        json responseJson = value:toJson(response);
        
        // Logging to verify
        io:println("response: ", responseJson);

        // Send to frontend
        check caller->respond(responseJson);
    }
}

public type Post record {|
    string userName;
    string postMessage;
    string postDate;
    Reply[] replies;
|};

public type Reply record {|
    string userName;
    string replyMessage;
    string replyDate;
|};

public type PostTest record {|
    string userName;
    string postMessage;
    string postDate;
|};

function getPosts(mongodb:Collection postCollection) returns PostTest[]|error {
    // Get all posts from db
    stream<PostTest, error?> resultStream = check postCollection->find();

    PostTest[] results = [];
    
    error? e = resultStream.forEach(function(json doc) {
        do {
            // Access the 'question' and 'answer' fields from the JSON document
            string userName = check value:ensureType(doc.userName, string);
            string answer = check value:ensureType(doc.postMessage, string);
            string postDate = check value:ensureType(doc.postDate, string);
            // Reply[] replies = check value:ensureType(doc.replies, Reply[]);

            PostTest result = { userName: userName, postMessage: answer, postDate: postDate };
            results.push(result);
        } on fail var err {
            io:println("Error processing document: ", err.message());
        }

        return;
    });

    if e is error {
        return e;
    }
    return results;
}
