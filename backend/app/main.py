from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from .database import get_db, create_tables, Stack, Document, ChatLog
from .models import (
    StackCreate, StackUpdate, StackResponse, DocumentResponse, 
    ChatMessage, ChatResponse, WorkflowConfig, QueryRequest
)
from .services.workflow_executor import WorkflowExecutor
from .services.document_processor import DocumentProcessor

# Create tables
create_tables()

app = FastAPI(title="GenAI Stack API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
workflow_executor = WorkflowExecutor()
document_processor = DocumentProcessor()

# Create uploads directory
os.makedirs("uploads", exist_ok=True)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "GenAI Stack API is running"}

# Stack management endpoints
@app.post("/stacks/", response_model=StackResponse)
def create_stack(stack: StackCreate, db: Session = Depends(get_db)):
    db_stack = Stack(
        name=stack.name,
        description=stack.description,
        workflow_config=None
    )
    db.add(db_stack)
    db.commit()
    db.refresh(db_stack)
    return db_stack

@app.get("/stacks/", response_model=List[StackResponse])
def get_stacks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stacks = db.query(Stack).offset(skip).limit(limit).all()
    return stacks

@app.get("/stacks/{stack_id}", response_model=StackResponse)
def get_stack(stack_id: int, db: Session = Depends(get_db)):
    stack = db.query(Stack).filter(Stack.id == stack_id).first()
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    return stack

@app.put("/stacks/{stack_id}", response_model=StackResponse)
def update_stack(stack_id: int, stack_update: StackUpdate, db: Session = Depends(get_db)):
    stack = db.query(Stack).filter(Stack.id == stack_id).first()
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    
    if stack_update.name is not None:
        stack.name = stack_update.name
    if stack_update.description is not None:
        stack.description = stack_update.description
    if stack_update.workflow_config is not None:
        stack.workflow_config = stack_update.workflow_config
    
    stack.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(stack)
    return stack

@app.delete("/stacks/{stack_id}")
def delete_stack(stack_id: int, db: Session = Depends(get_db)):
    stack = db.query(Stack).filter(Stack.id == stack_id).first()
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    
    db.delete(stack)
    db.commit()
    return {"message": "Stack deleted successfully"}

# Document management endpoints
@app.post("/documents/upload")
def upload_document(
    file: UploadFile = File(...),
    stack_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    # Validate file type
    allowed_types = ['application/pdf']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save file
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Store document metadata
    db_document = Document(
        filename=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        stack_id=stack_id
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    # Process document for embeddings
    try:
        result = workflow_executor.process_document(file_path, file.content_type, stack_id)
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")
    
    return {
        "message": "Document uploaded and processed successfully",
        "document_id": db_document.id,
        "chunks_created": result.get("chunks_created", 0)
    }

@app.get("/documents/", response_model=List[DocumentResponse])
def get_documents(stack_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Document)
    if stack_id:
        query = query.filter(Document.stack_id == stack_id)
    documents = query.all()
    return documents

# Workflow execution endpoints
@app.post("/workflows/validate")
def validate_workflow(workflow_config: WorkflowConfig):
    validation = workflow_executor.validate_workflow(workflow_config)
    return validation

@app.post("/workflows/execute")
def execute_workflow(query_request: QueryRequest, db: Session = Depends(get_db)):
    # Get stack and its workflow configuration
    stack = db.query(Stack).filter(Stack.id == query_request.stack_id).first()
    if not stack:
        raise HTTPException(status_code=404, detail="Stack not found")
    
    if not stack.workflow_config:
        raise HTTPException(status_code=400, detail="Stack has no workflow configuration")
    
    # Convert dict to WorkflowConfig
    workflow_config = WorkflowConfig(**stack.workflow_config)
    
    # Execute workflow
    result = workflow_executor.execute_workflow(
        workflow_config, 
        query_request.query, 
        query_request.stack_id
    )
    
    # Log the chat interaction
    if result["success"]:
        chat_log = ChatLog(
            stack_id=query_request.stack_id,
            user_query=query_request.query,
            ai_response=result["result"]
        )
        db.add(chat_log)
        db.commit()
    
    return result

@app.get("/stacks/{stack_id}/chat-history", response_model=List[ChatResponse])
def get_chat_history(stack_id: int, db: Session = Depends(get_db)):
    chat_logs = db.query(ChatLog).filter(ChatLog.stack_id == stack_id).order_by(ChatLog.created_at.desc()).all()
    return chat_logs
