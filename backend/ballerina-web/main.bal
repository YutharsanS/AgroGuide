    import ballerina/http;
    import ballerina/io;
    import ballerinax/mongodb;
    import ballerina/lang.value;
    import ballerina/uuid;
    import ballerina/data.jsondata;

// Create a new MongoDB client

mongodb:Client mongoDb = check new ({
    connection: connection.connection_string
});

    //core configure
    @http:ServiceConfig {
        cors: {
            allowOrigins: ["*"],
            allowHeaders: ["Content-Type"],
            allowMethods: ["GET", "POST", "OPTIONS"]
        }
    }
    // Define the servic
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

        resource function post pixabayAPI(http:Caller caller, http:Request req) returns error? {
            json payload = check req.getJsonPayload();
            string category = (check payload.message).toString();
            io:println("Request " + category);

            http:Client pixabayClient = check new ("https://pixabay.com/api");
            string endpoint = (string `/?key=${pixabay.api_key}&q=${category}&image_type=photo`);
            http:Response response = check pixabayClient->get(endpoint);
            json responseJson = check response.getJsonPayload();
            pixabayResult responsePixabay = check jsondata:parseAsType(responseJson);
            
            // json[] hit = check responseJson.hits;
            io:println(responsePixabay.hits[0].largeImageURL);
            string imgurl = (check responsePixabay.hits[0].largeImageURL).toString();
            check caller->respond({imgurl: imgurl});

        }

        // Resource function to handle POST requests to the /getContent endpoint
        resource function post getContent(http:Caller caller, http:Request req) returns error? {
            json payload = check req.getJsonPayload();
            string message = (check payload.message).toString();

            json result = check testVectorSearch(message);
            json resultJson = result;

            // Send the result back to the client
            check caller->respond(resultJson);
        }

        // Resource function to handle POST requests to the /getInstruction endpoint
        resource function post getInstruction(http:Caller caller, http:Request req) returns error? {
            json payload = check req.getJsonPayload();
            string message = (check payload.message).toString();

            json result = check testCategorySearch(message);
            json resultJson = result;

            // Send the result back to the client
            check caller->respond(resultJson);
        }

        resource function get allposts(http:Caller caller) returns error? {

            // Access the database and collection using name
            mongodb:Database db = check mongoDb->getDatabase("test");
            mongodb:Collection postCollection = check db->getCollection("community_posts");

            Post[] response = check getPosts(postCollection);

            // Convert the stream to a JSON array
            json responseJson = value:toJson(response);

            // Logging to verify
            io:println("response: ", responseJson);

            // Send to frontend
            check caller->respond(responseJson);
        }

        resource function post addReply(http:Caller caller, http:Request req) returns error? {
            json payload = check req.getJsonPayload();
            json post_id = check payload._id;
            // string postId = check post_id.oid;
            Reply newReply = {
                userName: check payload.userName,
                replyMessage: check payload.replyMessage,
                replyDate: check payload.replyDate
            };

            // Access the database and collection
            mongodb:Database db = check mongoDb->getDatabase("test");
            mongodb:Collection postCollection = check db->getCollection("community_posts");

            boolean result = check addReplyToPost(postCollection, post_id, newReply);

            json response = { success: result };
            check caller->respond(response);
        }

        resource function post postMessage(http:Caller caller, http:Request req) returns error? {
            json payload = check req.getJsonPayload();
            // Generate a UUID
            string uuid1String = uuid:createType1AsString();

            // Create the _id as a JSON object
            json id = { "$oid": uuid1String.substring(0, 24) };
            io:println(id);

            Post_i newPost = {
                // _id: (),
                userName: check payload.userName,
                postMessage: check payload.postMessage,
                postDate: check payload.postDate,
                replies: []
            };

            // Access the database and collection
            mongodb:Database db = check mongoDb->getDatabase("test");
            mongodb:Collection postCollection = check db->getCollection("community_posts");

            // Insert the new post
            mongodb:Error? result = check postCollection->insertOne(newPost);
            io:println(result);

            // Prepare the response
            json response = {
                success: true,
                insertedId: id
            };

            // Send the response back to the client
            check caller->respond(response);
        }
    }

 

