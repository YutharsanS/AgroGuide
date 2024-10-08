from flask import Flask, request, jsonify
import os
from langchain_nvidia_ai_endpoints import ChatNVIDIA 
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import (
    BaseChatMessageHistory,
    InMemoryChatMessageHistory,
)
import logging  # Import the logging module

# Set up logging configuration
logging.basicConfig(level=logging.INFO)

load_dotenv()
os.environ["NVIDIA_API_KEY"] = os.getenv("NVIDIA_API_KEY")
model = ChatNVIDIA(model="meta/llama3-70b-instruct")

app = Flask(__name__)

store = {}

def get_session_history(session_id):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

@app.route('/chatbot', methods=['POST'])
def chatbot():
    user_message = request.json['message']
    
    # Log the incoming message
    logging.info(f"Received message from frontend: {user_message}")

    session_id = "abc5"  # Use a fixed session ID for simplicity

    with_message_history = RunnableWithMessageHistory(model, get_session_history)
    config = {"configurable": {"session_id": session_id}}
    response = with_message_history.invoke(
        [HumanMessage(content=user_message)],
        config=config,
    )
    logging.info(f"model response : {response.content}")
    return jsonify({"response": response.content})

if __name__ == '__main__':
    app.run(port=5001)
