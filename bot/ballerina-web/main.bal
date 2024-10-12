import ballerina/http;
import ballerina/io;
import ballerina/sql;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

type databaseConfig record {| 
    string host; 
    string user; 
    string password; 
    string database; 
    int port; 
|};

configurable databaseConfig connection = ?;

mysql:Client pool = check new (...connection);

public type Post record {| 
    int postId; 
    string userName; 
    string postMessage; 
    string postDate; 
    Comment[] comments; 
|};

public type Comment record {| 
    int commentId; 
    string userName; 
    string commentMessage; 
    string commentDate; 
|};

// Core configure
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

        json resultContent = check getContent(message);

        // Send the result back to the client
        check caller->respond(resultContent);
    }

    // Resource function to handle POST requests to the /addpost endpoint
    resource function post addpost(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();
        string userName = (check payload.userName).toString();
        string postMessage = (check payload.postMessage).toString();
        string postDate = (check payload.postDate).toString();

        // Call the function to add the post
        check addPost(userName, postMessage, postDate);

        // Send a success response back to the client
        json response = { "message": "Post added successfully" };
        check caller->respond(response);
    }
    //resource function for get all posts
    resource function post getPosts(http:Caller caller, http:Request req) returns error? {
        // Call the function to get all posts
        Post[] posts = check getPosts();

        // Send the result back to the client
        check caller->respond(posts);
    }

    // Resource function to handle POST requests to the /addcomment endpoint
    resource function post addcomment(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();
        int postId = check payload.postId;
        string userName = (check payload.comment.userName).toString();
        string commentMessage = (check payload.comment.commentMessage).toString();
        string commentDate = (check payload.comment.commentDate).toString();

        // Call the function to add the comment
        check addCommentById(postId, userName, commentMessage, commentDate);

        // Send a success response back to the client
        json response = { "message": "Comment added successfully" };
        check caller->respond(response);
    }
}

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

    string responseBody = (check (check response.getJsonPayload()).result).toString();

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

// Function to get content from the database
function getContent(string message) returns json|error {
    io:println("Searching for content with category: " + message);

    // Execute the SQL query
    sql:ParameterizedQuery query = `SELECT * FROM content co LEFT OUTER JOIN category c ON co.category_id = c.category_id WHERE c.name LIKE '%' ${message}  '%'`;
    stream<record {|anydata...;|}, sql:Error?> resultStream = pool->query(query);
    json[] resultJson = [];

    // Process the result stream and build the JSON response
    check resultStream.forEach(function(record {|anydata...;|} row) {
        map<json> rowJson = {};
        foreach var [key, value] in row.entries() {
            rowJson[key] = <json>value;
        }
        resultJson.push(rowJson);
    });

    return resultJson;
}

// Function to get all posts from the database
function getPosts() returns Post[]|error {
    // Execute the SQL query to get all posts
    sql:ParameterizedQuery query = `SELECT p.post_id, p.name AS userName, p.postContent AS postMessage, p.date AS postDate
                                    FROM post p`;
    stream<record {|anydata...;|}, sql:Error?> resultStream = pool->query(query);
    Post[] posts = [];

    // Process the result stream and build the Post array
    check resultStream.forEach(function(record {|anydata...;|} row) {
        int postId = check <int>row["post_id"];
        string userName = check row["userName"].toString();
        string postMessage = check row["postMessage"].toString();
        string postDate = check row["postDate"].toString();
        Comment[] comments = [];
        var commentResult = getComments(postId);
        if commentResult is Comment[] {
            comments = commentResult;
        } else {
            io:println("Error retrieving comments for postId: ", postId.toString());
        }

        Post post = { postId: postId, userName: userName, postMessage: postMessage, postDate: postDate, comments: comments };
        posts.push(post);
    });

    return posts;
}

// Function to get comments for a specific post from the database
function getComments(int postId) returns Comment[]|error {
    // Execute the SQL query to get comments for the given postId
    sql:ParameterizedQuery query = `SELECT c.comment_id, c.name AS userName, c.comment AS commentMessage, c.date AS commentDate
                                    FROM comment c
                                    WHERE c.post_id = ${postId}`;
    stream<record {|anydata...;|}, sql:Error?> resultStream = pool->query(query);
    Comment[] comments = [];

    // Process the result stream and build the Comment array
    check resultStream.forEach(function(record {|anydata...;|} row) {
        int commentId = check <int>row["comment_id"];
        string userName = check row["userName"].toString();
        string commentMessage = check row["commentMessage"].toString();
        string commentDate = check row["commentDate"].toString();

        Comment comment = { commentId: commentId, userName: userName, commentMessage: commentMessage, commentDate: commentDate };
        comments.push(comment);
    });

    return comments;
}

// Function to add a post to the database
function addPost(string userName, string postMessage, string postDate) returns error? {
    // Execute the SQL query to insert a new post
    sql:ParameterizedQuery query = `INSERT INTO post (name, postContent, date)
                                    VALUES (${userName}, ${postMessage}, ${postDate})`;
    var a=check pool->execute(query);
}

// Function to add a comment to a specific post in the database
function addCommentById(int postId, string userName, string commentMessage, string commentDate) returns error? {
    // Execute the SQL query to insert a new comment
    sql:ParameterizedQuery query = `INSERT INTO comment (post_id, name, comment, date)
                                    VALUES (${postId}, ${userName}, ${commentMessage}, ${commentDate})`;
    var a=check pool->execute(query);
}