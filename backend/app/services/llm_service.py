import openai
import google.generativeai as genai
import requests
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class LLMService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.serpapi_key = os.getenv("SERPAPI_API_KEY")
    
    def search_web(self, query: str) -> str:
        """Search the web using SerpAPI"""
        if not self.serpapi_key:
            return "Web search not available - API key not configured"
        
        try:
            params = {
                'q': query,
                'api_key': self.serpapi_key,
                'engine': 'google'
            }
            response = requests.get('https://serpapi.com/search', params=params)
            data = response.json()
            
            # Extract relevant information from search results
            results = []
            if 'organic_results' in data:
                for result in data['organic_results'][:3]:  # Top 3 results
                    results.append({
                        'title': result.get('title', ''),
                        'snippet': result.get('snippet', ''),
                        'link': result.get('link', '')
                    })
            
            return f"Web search results for '{query}':\n" + "\n".join([
                f"- {r['title']}: {r['snippet']}" for r in results
            ])
        except Exception as e:
            return f"Web search error: {str(e)}"
    
    def generate_response_openai(self, query: str, context: str = None, 
                               prompt: str = None, temperature: float = 0.7,
                               use_web_search: bool = False) -> str:
        """Generate response using OpenAI GPT"""
        try:
            # Prepare the prompt
            system_prompt = prompt or "You are a helpful AI assistant. Use the provided context to answer questions accurately."
            
            if context:
                system_prompt += f"\n\nContext: {context}"
            
            if use_web_search:
                web_results = self.search_web(query)
                system_prompt += f"\n\nWeb Search Results: {web_results}"
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ]
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=temperature,
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating OpenAI response: {str(e)}")
    
    def generate_response_gemini(self, query: str, context: str = None,
                               prompt: str = None, temperature: float = 0.7,
                               use_web_search: bool = False) -> str:
        """Generate response using Google Gemini"""
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            # Prepare the prompt
            full_prompt = prompt or "You are a helpful AI assistant. Use the provided context to answer questions accurately."
            
            if context:
                full_prompt += f"\n\nContext: {context}"
            
            if use_web_search:
                web_results = self.search_web(query)
                full_prompt += f"\n\nWeb Search Results: {web_results}"
            
            full_prompt += f"\n\nUser Query: {query}"
            
            response = model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=1000
                )
            )
            
            return response.text
        except Exception as e:
            raise Exception(f"Error generating Gemini response: {str(e)}")
    
    def generate_response(self, query: str, context: str = None, 
                         prompt: str = None, temperature: float = 0.7,
                         model: str = "openai", use_web_search: bool = False) -> str:
        """Generate response using specified model"""
        if model.lower() == "openai":
            return self.generate_response_openai(query, context, prompt, temperature, use_web_search)
        elif model.lower() == "gemini":
            return self.generate_response_gemini(query, context, prompt, temperature, use_web_search)
        else:
            raise Exception(f"Unsupported model: {model}")
