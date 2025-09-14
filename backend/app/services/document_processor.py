import os
from typing import List, Dict
import tempfile

class DocumentProcessor:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file - simplified version for demo"""
        try:
            # For demo purposes, return a placeholder text
            # In production, you would use PyMuPDF or another PDF library
            return f"PDF content from {os.path.basename(file_path)} - This is a placeholder text for demonstration purposes. In a real implementation, this would contain the actual extracted text from the PDF file."
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    @staticmethod
    def extract_text_from_file(file_path: str, file_type: str) -> str:
        """Extract text from various file types"""
        if file_type.lower() == 'pdf':
            return DocumentProcessor.extract_text_from_pdf(file_path)
        else:
            # For other file types, you can add more processors
            raise Exception(f"Unsupported file type: {file_type}")
    
    @staticmethod
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks for better embedding"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
            if start >= len(text):
                break
        
        return chunks
