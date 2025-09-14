# GenAI Stack - No-Code AI Workflow Builder

A full-stack web application that enables users to visually create and interact with intelligent workflows using drag-and-drop components. Build AI-powered applications without coding by connecting User Query, Knowledge Base, LLM Engine, and Output components.

## 🚀 Features

- **Visual Workflow Builder**: Drag-and-drop interface using React Flow
- **Four Core Components**:
  - **User Query**: Entry point for user interactions
  - **Knowledge Base**: Document processing and vector storage
  - **LLM Engine**: AI language model integration (OpenAI GPT, Google Gemini)
  - **Output**: Final response generation
- **Document Processing**: PDF text extraction and embedding generation
- **Vector Storage**: ChromaDB for semantic search
- **Web Search Integration**: SerpAPI for real-time information
- **Chat Interface**: Interactive testing of workflows
- **Real-time Validation**: Workflow validation and error reporting

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Flow** for drag-and-drop workflow building
- **Tailwind CSS** for styling
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **FastAPI** with Python 3.11
- **PostgreSQL** for data persistence
- **SQLAlchemy** for ORM
- **ChromaDB** for vector storage
- **PyMuPDF** for PDF processing
- **OpenAI API** for embeddings and LLM
- **Google Gemini** for alternative LLM
- **SerpAPI** for web search

### Infrastructure
- **Docker** for containerization
- **Docker Compose** for local development
- **Nginx** for frontend serving

## 📋 Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL (for local development)

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PlanetAiAssignment
   ```

2. **Set up environment variables**
   ```bash
   cp backend/env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   SERPAPI_API_KEY=your_serpapi_key_here
   SECRET_KEY=your_secret_key_here
   ```

3. **Start the application**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

5. **Start PostgreSQL** (using Docker)
   ```bash
   docker run --name postgres-genai -e POSTGRES_DB=genai_stack -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
   ```

6. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

