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

public function populateCommunityPosts(mongodb:Client mongoClient) returns error? {
    mongodb:Database qa_database = check mongoClient->getDatabase(connection.database);
    mongodb:Collection postCollection = check qa_database->getCollection(connection.posts);

    Post_i[] posts = [
        {
            userName: "David",
            postMessage: "What's the best fertilizer for growing organic tomatoes?",
            postDate: "2024-09-19T10:15:25Z",
            replies: [
                {
                    userName: "Emily",
                    replyMessage: "I've had great success with composted manure for my organic tomatoes.",
                    replyDate: "2024-09-19T11:30:15Z"
                },
                {
                    userName: "Michael",
                    replyMessage: "Fish emulsion is another excellent organic fertilizer for tomatoes.",
                    replyDate: "2024-09-19T12:45:30Z"
                },
                {
                    userName: "Sarah",
                    replyMessage: "Don't forget about compost tea! It's easy to make and very effective.",
                    replyDate: "2024-09-19T14:20:45Z"
                }
            ]
        },
        {
            userName: "Alex",
            postMessage: "How often should I water my cucumber plants?",
            postDate: "2024-09-20T09:30:00Z",
            replies: [
                {
                    userName: "Linda",
                    replyMessage: "Cucumbers need consistent moisture. Water deeply 1-2 times a week.",
                    replyDate: "2024-09-20T10:15:20Z"
                },
                {
                    userName: "John",
                    replyMessage: "I use mulch to help retain moisture and reduce watering frequency.",
                    replyDate: "2024-09-20T11:45:10Z"
                }
            ]
        },
        {
            userName: "Sophia",
            postMessage: "What are some good companion plants for peppers?",
            postDate: "2024-09-21T14:20:30Z",
            replies: [
                {
                    userName: "Oliver",
                    replyMessage: "Basil is a great companion for peppers. It repels pests and enhances flavor.",
                    replyDate: "2024-09-21T15:10:45Z"
                },
                {
                    userName: "Emma",
                    replyMessage: "I've had success planting onions and carrots near my peppers.",
                    replyDate: "2024-09-21T16:30:20Z"
                }
            ]
        },
        {
            userName: "Daniel",
            postMessage: "My lettuce leaves are turning brown at the edges. What could be causing this?",
            postDate: "2024-09-22T11:05:15Z",
            replies: [
                {
                    userName: "Ava",
                    replyMessage: "It might be tip burn. Check if you're overwatering or if there's a calcium deficiency.",
                    replyDate: "2024-09-22T11:45:30Z"
                },
                {
                    userName: "Liam",
                    replyMessage: "Heat stress can also cause brown edges. Make sure they're getting some shade in hot weather.",
                    replyDate: "2024-09-22T13:20:10Z"
                }
            ]
        },
        {
            userName: "Mia",
            postMessage: "What's the best way to control aphids on my rose bushes without using chemical pesticides?",
            postDate: "2024-09-23T16:40:00Z",
            replies: [
                {
                    userName: "Noah",
                    replyMessage: "Ladybugs are natural predators of aphids. You can introduce them to your garden.",
                    replyDate: "2024-09-23T17:15:25Z"
                },
                {
                    userName: "Isabella",
                    replyMessage: "A strong spray of water can knock aphids off. Repeat every few days.",
                    replyDate: "2024-09-23T18:30:40Z"
                },
                {
                    userName: "Ethan",
                    replyMessage: "Neem oil is an effective organic treatment for aphids.",
                    replyDate: "2024-09-23T19:45:15Z"
                }
            ]
        },
        {
        userName: "David",
        postMessage: "What's the best fertilizer for growing organic tomatoes?",
        postDate: "Thu Sep 19 2024 10:15:25 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Emma",
                replyMessage: "I recommend using compost or manure. It’s natural and provides all the nutrients.",
                replyDate: "Thu Sep 19 2024 11:00:12 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Jack",
                replyMessage: "I use a mix of fish emulsion and seaweed extract. Works great for my tomatoes!",
                replyDate: "Fri Sep 20 2024 09:30:47 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Yutharsan",
                replyMessage: "I don't know ",
                replyDate: "Sat Oct 12 2024 11:00:12 GMT+0530 (Japan Standard Time)"
            }
    ]
    },
    {
        userName: "Alice",
        postMessage: "How often should I water my cucumber plants during summer?",
        postDate: "Sat Sep 21 2024 14:32:19 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Henry",
                replyMessage: "In hot weather, cucumbers need water daily, but make sure the soil drains well.",
                replyDate: "Sat Sep 21 2024 16:20:34 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Grace",
                replyMessage: "I water mine every morning to keep them hydrated but avoid soggy soil.",
                replyDate: "Sun Sep 22 2024 08:12:50 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Yutharsan",
                replyMessage: "I don't know ",
                replyDate: "Sat Oct 12 2024 11:00:12 GMT+0530 (Japan Standard Time)"
            },
            {
                userName: "Yutharsan",
                replyMessage: "I don't know ",
                replyDate: "Sat Oct 12 2024 11:00:12 GMT+0530 (Japan Standard Time)"
            },
            {
                userName: "Yutharsan",
                replyMessage: "I don't know ",
                replyDate: "Sat Oct 12 2024 11:00:12 GMT+0530 (Japan Standard Time)"
            },
            {
                userName: "Yutharsan",
                replyMessage: "I do know ",
                replyDate: "Sat Oct 12 2024 11:00:12 GMT+0530 (Japan Standard Time)"
            }
        ]
    },
    {
        userName: "Frank",
        postMessage: "Any tips on preventing pests in my vegetable garden?",
        postDate: "Wed Sep 25 2024 09:45:12 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "David",
                replyMessage: "Try using neem oil or introducing beneficial insects like ladybugs.",
                replyDate: "Wed Sep 25 2024 11:20:05 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Emma",
                replyMessage: "I use companion planting. Basil near tomatoes helps deter pests.",
                replyDate: "Wed Sep 25 2024 14:50:37 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Grace",
        postMessage: "What’s the best time of year to plant carrots?",
        postDate: "Fri Sep 27 2024 12:10:55 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Alice",
                replyMessage: "I usually plant mine in early spring, and they grow well into fall.",
                replyDate: "Fri Sep 27 2024 13:30:42 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Jack",
                replyMessage: "Fall planting is great in cooler climates. The carrots will be sweeter.",
                replyDate: "Sat Sep 28 2024 09:20:18 GMT+0530 (India Standard Time)"
            },
            {
                userName: "a",
                replyMessage: "b",
                replyDate: "2024-10-12T19:17:04.854Z"
            },
            {
                userName: "c",
                replyMessage: "d",
                replyDate: "2024-10-12T19:17:17.079Z"
            }
        ]
    },
    {
        userName: "Alice",
        postMessage: "How often should I water my cucumber plants during summer?",
        postDate: "Sat Sep 21 2024 14:32:19 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Henry",
                replyMessage: "In hot weather, cucumbers need water daily, but make sure the soil drains well.",
                replyDate: "Sat Sep 21 2024 16:20:34 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Grace",
                replyMessage: "I water mine every morning to keep them hydrated but avoid soggy soil.",
                replyDate: "Sun Sep 22 2024 08:12:50 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Alice",
        postMessage: "How often should I water my cucumber plants during summer?",
        postDate: "Sat Sep 21 2024 14:32:19 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Kavindu",
                replyMessage: "Twice a week",
                replyDate: "Sun Oct 13 2024 08:14:58 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Kavindu",
                replyMessage: "Twice a week",
                replyDate: "Sun Oct 13 2024 08:14:58 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Kavindu",
        postMessage: "Hello, I'm new here",
        postDate: "Sun Oct 13 2024 08:14:58 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Kevin",
        postMessage: "Hello, is this an active platform.",
        postDate: "Sun Oct 13 2024 09:17:31 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Sanju",
                replyMessage: "Of course, do you any problems?",
                replyDate: "Sun Oct 13 2024 10:04:46 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Naveen",
        postMessage: "Hey, I'm goiing to start a farm, Do you guys have any suggestions?\n",
        postDate: "Sun Oct 13 2024 09:19:09 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Ravi",
        postMessage: "Hey",
        postDate: "Sun Oct 13 2024 09:25:45 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Ravi",
        postMessage: "Hey (2)",
        postDate: "Sun Oct 13 2024 09:26:18 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Rose",
                replyMessage: "Hey (3)",
                replyDate: "Sun Oct 13 2024 10:03:01 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Risini",
                replyMessage: "Hey (4)",
                replyDate: "Sun Oct 13 2024 10:04:15 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Ravindu",
        postMessage: "I'm going to start a carrot farm. Do you guys have any suggestions?",
        postDate: "Sun Oct 13 2024 10:14:23 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Akila",
                replyMessage: "Yeah, I also have a carrot farm. I can give some suggestions.",
                replyDate: "Sun Oct 13 2024 10:15:01 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Naveen",
        postMessage: "I need some assistance for start growing rice. ",
        postDate: "Sun Oct 13 2024 12:05:29 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Admin",
                replyMessage: "Just go through our instruction page and get assistance from our chat bot. You can ask anything from him.",
                replyDate: "Sun Oct 13 2024 12:06:55 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Naveen ",
                replyMessage: "Thank you !",
                replyDate: "Sun Oct 13 2024 20:41:37 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Navindu",
        postMessage: "Hello Everyone",
        postDate: "Sun Oct 13 2024 19:43:37 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Kamal",
                replyMessage: "Hello Hello",
                replyDate: "Sun Oct 13 2024 19:43:52 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Waduge",
        postMessage: "Does anyone has a corn field",
        postDate: "Mon Oct 14 2024 15:35:04 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Wolf",
                replyMessage: "Yes, I have",
                replyDate: "Mon Oct 14 2024 15:35:21 GMT+0530 (India Standard Time)"
            },
            {
                userName: "Himala",
                replyMessage: "I haven't seen corn in years",
                replyDate: "Wed Oct 16 2024 17:15:54 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "naveen",
        postMessage: "i want to know what is the best season to grow pepper in sri lanka.",
        postDate: "Mon Oct 14 2024 15:46:25 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "sandaruwan",
                replyMessage: "Maha Season (September to March)",
                replyDate: "Mon Oct 14 2024 15:47:49 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Himala",
        postMessage: "Does anyone has experience with growing cabbage.",
        postDate: "Mon Oct 14 2024 18:04:16 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Himala",
        postMessage: "Hello, I want help with growing Ambun banana.",
        postDate: "Wed Oct 16 2024 14:31:46 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Roy",
                replyMessage: "Hey don't spam in this forum. Mentioning your problem once is enough. Someone will reply?",
                replyDate: "Thu Oct 17 2024 10:12:34 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Himala",
        postMessage: "Hello, I want help with growing Ambun banana.",
        postDate: "Wed Oct 16 2024 14:31:47 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Himala",
        postMessage: "Hello, I want help with growing Ambun banana.",
        postDate: "Wed Oct 16 2024 14:31:47 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Himala",
        postMessage: "Hello, I want help with growing Ambun banana.",
        postDate: "Wed Oct 16 2024 14:31:47 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Himala",
        postMessage: "Hello, I want help with growing Ambun banana.",
        postDate: "Wed Oct 16 2024 14:31:47 GMT+0530 (India Standard Time)",
        replies: []
    },
    {
        userName: "Himala ",
        postMessage: "Where is rice grown most?",
        postDate: "Wed Oct 16 2024 17:15:19 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Perera",
                replyMessage: "You should ask that from the authorities.",
                replyDate: "Fri Oct 18 2024 12:58:20 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Perera",
        postMessage: "Is there any mango farmer in Colombo?",
        postDate: "Fri Oct 18 2024 12:56:15 GMT+0530 (India Standard Time)",
        replies: [
            {
                userName: "Tejan",
                replyMessage: "There aren't many. You should try asking local authorities there.",
                replyDate: "Fri Oct 18 2024 14:14:01 GMT+0530 (India Standard Time)"
            }
        ]
    },
    {
        userName: "Tejan",
        postMessage: "How much tea does a average farmer produce a year?",
        postDate: "Fri Oct 18 2024 14:13:12 GMT+0530 (India Standard Time)",
        replies: []
    }
];

    foreach var post in posts {
        map<anydata> documentToInsert = {
            "userName": post.userName,
            "postMessage": post.postMessage,
            "postDate": post.postDate,
            "replies": post.replies,
            "embedding": check generateEmbedding(post.postMessage)
        };

        _ = check postCollection->insertOne(documentToInsert);
        io:println("Inserted post: " + post.postMessage);
    }

    io:println("Population of community posts completed successfully.");
}
