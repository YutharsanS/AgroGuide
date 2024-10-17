type databaseConfig record {|
    string connection_string;
    string database;
    string qa_collection_name;
    string category_collection_name;
    string posts;

|};

type pixabyConfig record {|
    string api_key;

|};

public type Post record {|
    json _id;
    string userName;
    string postMessage;
    string postDate;
    Reply[] replies;
|};

public type Post_i record {|
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

public type pixabayResult record {|
    int total;
    int totalHits;
    json[] hits;
|};

type QADocument record {|
    string question;
    string answer;
    float[] embedding;
|};

type QAResult record {|
    string question;
    string answer;
|};

type CategoryDocument record {|
    string category;
    string content;
|};

