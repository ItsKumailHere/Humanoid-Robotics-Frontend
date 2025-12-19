# Physical AI & Humanoid Robotics Textbook

This is a Docusaurus-based textbook for Physical AI and Humanoid Robotics with integrated chat functionality that connects to a RAG (Retrieval-Augmented Generation) backend.

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (for running the RAG backend)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Docusaurus development server:
   ```bash
   npm start
   ```

3. The website will open at `http://localhost:3000`

## Connecting to RAG Backend

This textbook includes a floating chat button that connects to a RAG backend to answer questions about the textbook content. To use the chat functionality:

1. First, ensure the RAG backend is running on port 8000:
   ```bash
   cd ../rag-backend
   uvicorn src.api.main:app --reload --port 8000
   ```

2. The chat interface will automatically connect to `http://localhost:8000/api/v1/query` to retrieve answers from the Physical AI & Humanoid Robotics textbook content.

3. If you are running the backend on a different port or server, you'll need to update the API endpoint in `src/components/FloatingChat/FloatingChatButton.tsx`.

## Docker Compose Setup

For a complete local development environment:

```bash
# From the project root
docker-compose up --build
```

This will start:
- RAG backend on port 8000
- Docusaurus site on port 3000

## Development

- Edit content in the `docs/` directory following the existing structure
- Components are located in the `src/` directory
- The chat interface is implemented in `src/components/FloatingChat/`

## Building for Production

```bash
npm run build
```

## Learn More

- [Docusaurus Documentation](https://docusaurus.io/)
- [Physical AI & Humanoid Robotics Content](./docs/intro.md)