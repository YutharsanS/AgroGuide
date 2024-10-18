import ballerina/http;
import ballerina/io;
import ballerina/lang.value;
import ballerinax/mongodb;

configurable databaseConfig connection = ?;

configurable pixabyConfig pixabay = ?;

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

}

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
    json payload = {"text": text};
    http:Response resp = check embeddingClient->post("/embed", payload);
    json respJson = check resp.getJsonPayload();
    float[] embedding = check parseEmbedding(check respJson.embedding);
    return embedding;
}

function findSimilarPosts(float[] queryEmbedding, mongodb:Database database, mongodb:Collection dataCollection) returns Post[]|error {
    // Mongo db query
    map<json>[] pipeline = [
        {
            "$vectorSearch": {
                "index": "posts_index",
                "path": "embedding",
                "queryVector": queryEmbedding,
                "numCandidates": 4,
                "limit": 2
            }
        },
        {
            "$addFields": {"score": {"$meta": "vectorSearchScore"}}
        },
        {
            "$match": {"score": {"$gte": 0.7}}
        }
    ];

    // The aggregate method return a stream containg results
    stream<Post, error?> resultStream = check dataCollection->aggregate(pipeline);

    Post[] results = [];

    error? e = resultStream.forEach(function(json doc) {
        do {
            string userName = check value:ensureType(doc.userName, string);
            string answer = check value:ensureType(doc.postMessage, string);
            string postDate = check value:ensureType(doc.postDate, string);
            Reply[] replies = check getReplies(doc.replies);
            Post qaResult = { _id:check doc._id, userName:userName, postMessage:answer, postDate:postDate, replies:replies};
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

function findCategory(string userInput, mongodb:Database datstringabase, mongodb:Collection dataCollection) returns CategoryDocument[]|error {
    // Mongo db query
    map<json>[] pipeline = [
        {
            "$search": {
                "index": "category_search", // Specify the index name. "default" is the name if you haven't created a custom one.
                "text": {
                    "query": userInput, // The search term (with potential typos).
                    "path": "category", // The field to search within.
                    "fuzzy": {
                        "maxEdits": 1, // Allow up to 1 edits (insertions, deletions, or substitutions).
                        "prefixLength": 2 // The number of initial characters that must match exactly.
                    }
                }
            }
        }
    ];

    // The aggregate method return a stream containg results
    stream<CategoryDocument, error?> resultStream = check dataCollection->aggregate(pipeline);

    CategoryDocument[] results = [];

    error? e = resultStream.forEach(function(json doc) {
        do {
            // Access the 'question' and 'answer' fields from the JSON document
            string category = check value:ensureType(doc.category, string);
            string content = check value:ensureType(doc.content, string);

            CategoryDocument caResult = {category: category, content: content};
            results.push(caResult);
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

function testCategorySearch(string userInput) returns json|error {
    // Access the database and collection using name
    mongodb:Database qa_database = check mongoDb->getDatabase(connection.database);
    mongodb:Collection dataCollection = check qa_database->getCollection(connection.category_collection_name);

    // Test finding similar answers
    CategoryDocument[] similarDocs = check findCategory(userInput, qa_database, dataCollection);

    // Convert the similarAnswers array to JSON
    json similarAnswersJson = value:toJson(similarDocs);

    // Print the JSON (optional)
    io:println(similarAnswersJson);

    return similarAnswersJson;
}

function testVectorSearch(string userInput) returns json|error {
    // Access the database and collection using name
    mongodb:Database qa_database = check mongoDb->getDatabase(connection.database);
    mongodb:Collection dataCollection = check qa_database->getCollection(connection.posts);

    // Test finding similar answers
    float[] queryEmbedding = check generateEmbedding(userInput);
    Post[] similarAnswers = check findSimilarPosts(queryEmbedding, qa_database, dataCollection);

    // Convert the similarAnswers array to JSON
    json similarAnswersJson = value:toJson(similarAnswers);

    // Print the JSON (optional)
    io:println(similarAnswersJson);

    return similarAnswersJson;
}

function getPosts(mongodb:Collection postCollection) returns Post[]|error {
    // Get all posts from db
    stream<Post, error?> resultStream = check postCollection->find();

    Post[] results = [];

    error? e = resultStream.forEach(function(json doc) {
        do {
            // Access the 'question' and 'answer' fields from the JSON document
            string userName = check value:ensureType(doc.userName, string);
            string answer = check value:ensureType(doc.postMessage, string);
            string postDate = check value:ensureType(doc.postDate, string);
            Reply[] replies = check getReplies(doc.replies);

            Post result = {_id: check doc._id, userName: userName, postMessage: answer, postDate: postDate, replies: replies};
            io:println("result: ", result);
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

function getReplies(json|error? replyStream) returns Reply[]|error {
    Reply[] results = [];

    if (replyStream is error) {
        return replyStream;
    }

    if (replyStream is json[]) {
        foreach json doc in replyStream {
            do {
                // Access the 'userName', 'replyMessage', and 'replyDate' fields from the JSON document
                string userName = check value:ensureType(doc.userName, string);
                string answer = check value:ensureType(doc.replyMessage, string);
                string replyDate = check value:ensureType(doc.replyDate, string);

                Reply result = {userName: userName, replyMessage: answer, replyDate: replyDate};
                results.push(result);
            } on fail var err {
                io:println("Error processing document: ", err.message());
            }
        }
    }

    return results;
}

function addReplyToPost(mongodb:Collection collection, json postId, Reply newReply) returns boolean|error {
    // First, retrieve the current document
    Post? existingDoc = check collection->findOne({"_id": postId});

    Reply[] currentReplies = [];

    currentReplies = check existingDoc["replies"].cloneWithType();

    // Add the new reply
    currentReplies.push(newReply);

    // Create the update document
    mongodb:Update updateDoc = {
        set: {
            "replies": currentReplies
        }
    };

    mongodb:UpdateOptions options = {
        upsert: true
    };

    mongodb:UpdateResult result = check collection->updateOne({"_id": postId}, updateDoc, options);

    return result.modifiedCount > 0 || result.upsertedId != ();

}
