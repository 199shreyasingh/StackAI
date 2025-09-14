from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class StackCreate(BaseModel):
    name: str
    description: Optional[str] = None

class StackUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    workflow_config: Optional[Dict[str, Any]] = None

class StackResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    workflow_config: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

class DocumentUpload(BaseModel):
    filename: str
    file_type: str
    stack_id: Optional[int] = None

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    file_type: str
    stack_id: Optional[int]
    created_at: datetime

class ChatMessage(BaseModel):
    stack_id: int
    user_query: str

class ChatResponse(BaseModel):
    id: int
    stack_id: int
    user_query: str
    ai_response: str
    created_at: datetime

class WorkflowNode(BaseModel):
    id: str
    type: str  # 'user_query', 'knowledge_base', 'llm_engine', 'output'
    position: Dict[str, float]
    data: Dict[str, Any]

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

class WorkflowConfig(BaseModel):
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]

class QueryRequest(BaseModel):
    stack_id: int
    query: str
