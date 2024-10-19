# AgroGuide

AgroGuide is an all-in-one platform that provides farmers with essential information about plants, a chatbot for farming-related queries, and a community page for sharing and solving agricultural issues. The project combines the power of Ballerina, Python, React, MongoDB, and the NVIDIA LLaMA 3.1 LLM model to offer a seamless experience.

## Features

### 1. Get Plant Details
- **Search Plants**: Users can search for plant details by plant name, retrieving information from the database.
- **Explain by Bot**: When a user clicks the "Explain by Bot" button, they are redirected to the chatbot, where they can get a detailed explanation and ask further questions about the plant.

### 2. Chatbot
- Users can interact with the chatbot to ask any farming-related questions. The bot uses the NVIDIA LLaMA 3.1 LLM model to generate informative responses, offering personalized assistance for farmers.

### 3. Community Page
- **Post Questions**: Users can post their agricultural issues and seek help from other users.
- **Reply and Search**: Other users can reply to the posts and offer assistance. Additionally, users can search for previous posts to find relevant information and discussions.

## Tech Stack

- **Backend**: Ballerina for server-side logic.
- **Chatbot**: Python connected via Ballerina, utilizing the NVIDIA LLaMA 3.1 LLM model.
- **Frontend**: React.js for user interface.
- **Database**: MongoDB to store plant details, posts, and replies.

## Installation

### Prerequisites
- Ballerina installed
- Python 3.x installed
- MongoDB installed
- Node.js and npm installed (for the React frontend)
- NVIDIA llama 3.1 API
- TAVILY API
- mongodb connection string
- Pixaby API

### Steps

1. **Install Dependencies**
   - Navigate to the `backend/ballerina-web` and `backend/bot` folders and install any necessary dependencies.
   - For the frontend, navigate to the `frontend` folder and run:
     ```bash
     npm install
     ```

2. **Run the Backend**
   - Start the Ballerina server:
     ```bash
     cd backend/ballerina-web
     ballerina run main.bal
     ```
   - Run the Python chatbot:
     ```bash
     cd backend/bot
     python app.py
     ```

3. **Run the Frontend**
   - Start the React app:
     ```bash
     cd frontend
     npm start
     ```

### File Structure

- **Ballerina File**: `backend/ballerina-web/main.bal`
- **Python File**: `backend/bot/app.py`
- **Frontend**: `frontend/`

## Usage

- Navigate to the plant details page to search for plants and view information.
- Use the "Explain by Bot" feature to get detailed explanations and ask questions from the chatbot.
- Visit the community page to post problems, offer help, and search for previously discussed topics.


