import openai
import google.generativeai as genai
from typing import List, Dict
import os
from dotenv import load_dotenv
import json

load_dotenv()

class EmbeddingService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        
        # Simple in-memory storage for demo purposes
        self.documents = {}
        self.embeddings = {}
    
    def generate_embeddings_openai(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-large",
                input=texts
            )
            return [embedding.embedding for embedding in response.data]
        except Exception as e:
            raise Exception(f"Error generating OpenAI embeddings: {str(e)}")
    
    def generate_embeddings_gemini(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Google Gemini"""
        try:
            model = genai.GenerativeModel('embedding-001')
            embeddings = []
            for text in texts:
                result = model.embed_content(text)
                embeddings.append(result['embedding'])
            return embeddings
        except Exception as e:
            raise Exception(f"Error generating Gemini embeddings: {str(e)}")
    
    def store_document_chunks(self, document_id: str, chunks: List[str], 
                            metadata: Dict = None, embedding_model: str = "openai") -> None:
        """Store document chunks with embeddings - simplified version"""
        try:
            # Generate embeddings
            if embedding_model == "openai":
                embeddings = self.generate_embeddings_openai(chunks)
            else:
                embeddings = self.generate_embeddings_gemini(chunks)
            
            # Store in memory for demo purposes
            self.documents[document_id] = {
                'chunks': chunks,
                'embeddings': embeddings,
                'metadata': metadata or {}
            }
        except Exception as e:
            raise Exception(f"Error storing document chunks: {str(e)}")
    
    def search_similar_chunks(self, query: str, n_results: int = 5, 
                            document_id: str = None, embedding_model: str = "openai") -> List[Dict]:
        """Search for similar chunks using query embedding - simplified version"""
        try:
            # Generate query embedding
            if embedding_model == "openai":
                query_embedding = self.generate_embeddings_openai([query])[0]
            else:
                query_embedding = self.generate_embeddings_gemini([query])[0]
            
            # Simple similarity search (cosine similarity)
            results = []
            for doc_id, doc_data in self.documents.items():
                if document_id and doc_id != document_id:
                    continue
                    
                for i, (chunk, embedding) in enumerate(zip(doc_data['chunks'], doc_data['embeddings'])):
                    # Simple cosine similarity calculation
                    similarity = self._cosine_similarity(query_embedding, embedding)
                    results.append({
                        'content': chunk,
                        'metadata': {
                            'document_id': doc_id,
                            'chunk_index': i,
                            **doc_data['metadata']
                        },
                        'distance': 1 - similarity  # Convert similarity to distance
                    })
            
            # Sort by similarity and return top results
            results.sort(key=lambda x: x['distance'])
            return results[:n_results]
        except Exception as e:
            raise Exception(f"Error searching similar chunks: {str(e)}")
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        import math
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(a * a for a in vec2))
        
        if magnitude1 == 0 or magnitude2 == 0:
            return 0
        
        return dot_product / (magnitude1 * magnitude2)
