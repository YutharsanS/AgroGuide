# from flask import Flask, request, jsonify
# import os
# from langchain_nvidia_ai_endpoints import ChatNVIDIA 
# from langchain_core.messages import HumanMessage
# from dotenv import load_dotenv
# from langchain_core.runnables.history import RunnableWithMessageHistory
# from langchain_core.chat_history import (
#     BaseChatMessageHistory,
#     InMemoryChatMessageHistory,
# )





# import logging  # Import the logging module

# # Set up logging configuration
# logging.basicConfig(level=logging.INFO)

# load_dotenv()
# os.environ["NVIDIA_API_KEY"] = os.getenv("NVIDIA_API_KEY")
# os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")


# model = ChatNVIDIA(model="meta/llama3-70b-instruct")

# from langchain_community.tools.tavily_search import TavilySearchResults

# search = TavilySearchResults(max_results=2)
# tools =[search]
# model_with_tools = model.bind_tools(tools)


# app = Flask(__name__)

# store = {}

# def get_session_history(session_id):
#     if session_id not in store:
#         store[session_id] = InMemoryChatMessageHistory()
#     return store[session_id]

# @app.route('/chatbot', methods=['POST'])
# def chatbot():
#     user_message = request.json['message']
    
#     # Log the incoming message
#     logging.info(f"Received message from frontend: {user_message}")

#     session_id = "abc5"  # Use a fixed session ID for simplicity

#     with_message_history = RunnableWithMessageHistory(model, get_session_history)
#     config = {"configurable": {"session_id": session_id}}
#     response = with_message_history.invoke(
#     [
#         HumanMessage(content=f"Please choose palnt category from provided list regarding message. list =[dragon fruit,mango,banana] . message = {user_message}. return only category name fom the list . do not enter extra text\n\n"),
#     ],
#     config=config,
# )

#     logging.info(f"model response : {response.content}")
#     return jsonify({"result": response.content})

# if __name__ == '__main__':
#     # search_results = search.invoke("What is the weather in Sri Lanka")
#     # print(search_results)
#     app.run(port=5002)
from flask import Flask, request, jsonify
import os
import logging
from dotenv import load_dotenv
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain_core.messages import HumanMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_community.tools.tavily_search import TavilySearchResults

# Set up logging configuration
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()
os.environ["NVIDIA_API_KEY"] = os.getenv("NVIDIA_API_KEY")
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")

# Initialize the ChatNVIDIA model
model = ChatNVIDIA(model="meta/llama3-70b-instruct")

# Set up Tavily search tool
search = TavilySearchResults(max_results=2)
tools = [search]
model_with_tools = model.bind_tools(tools)

# Initialize Flask application
app = Flask(__name__)

# In-memory session storage
store = {}

def get_session_history(session_id):
    """Retrieve or create chat message history for the session."""
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

@app.route('/chatbot', methods=['POST'])
def chatbot():
    """Handle incoming messages and return chatbot responses."""
    user_message = request.json.get('message', '').strip()

    # Log the incoming message
    logging.info(f"Received message from user: {user_message}")

    session_id = "abc5"  # Use a fixed session ID for simplicity
    with_message_history = RunnableWithMessageHistory(model, get_session_history)

    # Construct the message content for the model
    prompt = (
        "your are inteligent agricultural assistant. "
        "Using provided information about the plant user interested in, guide him. "
        "Here is what user said: '{user_message}'."
    ).format(user_message=user_message)

    # Invoke the model with the user's message
    response = with_message_history.invoke(
        [HumanMessage(content=prompt)],
        config={"configurable": {"session_id": session_id}},
    )

    # Log the model's response
    logging.info(f"Model response: {response.content}")

    return jsonify({"result": response.content})

if __name__ == '__main__':
    app.run(port=5002)
