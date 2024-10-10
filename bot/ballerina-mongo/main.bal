import ballerina/http;
import ballerinax/mongodb;
import ballerina/io;
import ballerina/lang.value;

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

function testVectorSearch(string userInput) returns error? {
    // Access the database and collection using name
    mongodb:Database qa_database = check mongoDb->getDatabase(database);
    mongodb:Collection dataCollection = check qa_database->getCollection(collection_name);

    // Test finding similar answers
    float[] queryEmbedding = check generateEmbedding(userInput);
    QAResult[] similarAnswers = check findSimilarAnswers(queryEmbedding, qa_database, dataCollection);

    io:println("Similar answers:");
    foreach var result in similarAnswers {
        io:println(result.question, ": ", result.answer);
    }
    return;
}

public function main() returns error? {
    check testVectorSearch("How can I increase water draining in plants");
}

type QADocument record {|
    string question;
    string answer;
    float[] embedding;
|};

type QAResult record {|
    string question;
    string answer;
|};