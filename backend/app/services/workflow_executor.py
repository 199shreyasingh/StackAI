from typing import Dict, List, Any, Optional
from ..models import WorkflowConfig, WorkflowNode, WorkflowEdge
from .llm_service import LLMService
from .embedding_service import EmbeddingService
from .document_processor import DocumentProcessor

class WorkflowExecutor:
    def __init__(self):
        self.llm_service = LLMService()
        self.embedding_service = EmbeddingService()
        self.document_processor = DocumentProcessor()
    
    def validate_workflow(self, workflow_config: WorkflowConfig) -> Dict[str, Any]:
        """Validate workflow configuration"""
        errors = []
        warnings = []
        
        # Check if we have at least a user query and output node
        user_query_nodes = [n for n in workflow_config.nodes if n.type == 'user_query']
        output_nodes = [n for n in workflow_config.nodes if n.type == 'output']
        
        if not user_query_nodes:
            errors.append("Workflow must have at least one User Query node")
        if not output_nodes:
            errors.append("Workflow must have at least one Output node")
        
        # Check for required connections
        if workflow_config.edges:
            # Check if user query is connected to something
            user_query_connected = any(
                edge.source == user_query.id for user_query in user_query_nodes 
                for edge in workflow_config.edges
            )
            if not user_query_connected:
                warnings.append("User Query node should be connected to other components")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }
    
    def execute_workflow(self, workflow_config: WorkflowConfig, user_query: str, 
                        stack_id: int = None) -> Dict[str, Any]:
        """Execute the workflow with the given query"""
        try:
            # Validate workflow first
            validation = self.validate_workflow(workflow_config)
            if not validation["valid"]:
                return {
                    "success": False,
                    "error": "Invalid workflow configuration",
                    "details": validation["errors"]
                }
            
            # Find the user query node
            user_query_node = next((n for n in workflow_config.nodes if n.type == 'user_query'), None)
            if not user_query_node:
                return {"success": False, "error": "No user query node found"}
            
            # Start execution from user query node
            result = self._execute_node(user_query_node, user_query, workflow_config, stack_id)
            
            return {
                "success": True,
                "result": result,
                "query": user_query
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Workflow execution failed: {str(e)}"
            }
    
    def _execute_node(self, node: WorkflowNode, input_data: str, 
                     workflow_config: WorkflowConfig, stack_id: int = None) -> str:
        """Execute a single node in the workflow"""
        if node.type == 'user_query':
            return input_data
        
        elif node.type == 'knowledge_base':
            # Get knowledge base configuration
            kb_config = node.data.get('config', {})
            embedding_model = kb_config.get('embedding_model', 'openai')
            
            # Search for relevant context
            similar_chunks = self.embedding_service.search_similar_chunks(
                query=input_data,
                n_results=5,
                document_id=str(stack_id) if stack_id else None,
                embedding_model=embedding_model
            )
            
            # Combine context from similar chunks
            context = "\n\n".join([chunk['content'] for chunk in similar_chunks])
            return context
        
        elif node.type == 'llm_engine':
            # Get LLM configuration
            llm_config = node.data.get('config', {})
            model = llm_config.get('model', 'openai')
            temperature = llm_config.get('temperature', 0.7)
            prompt = llm_config.get('prompt', 'You are a helpful AI assistant.')
            use_web_search = llm_config.get('use_web_search', False)
            
            # Get context from knowledge base if connected
            context = self._get_context_from_previous_nodes(node, workflow_config, input_data, stack_id)
            
            # Generate response using LLM
            response = self.llm_service.generate_response(
                query=input_data,
                context=context,
                prompt=prompt,
                temperature=temperature,
                model=model,
                use_web_search=use_web_search
            )
            
            return response
        
        elif node.type == 'output':
            # Output node just returns the input data
            return input_data
        
        else:
            return f"Unknown node type: {node.type}"
    
    def _get_context_from_previous_nodes(self, current_node: WorkflowNode, 
                                       workflow_config: WorkflowConfig, 
                                       user_query: str, stack_id: int = None) -> str:
        """Get context from knowledge base nodes that are connected to the current node"""
        # Find edges that connect to this node
        incoming_edges = [e for e in workflow_config.edges if e.target == current_node.id]
        
        context_parts = []
        for edge in incoming_edges:
            # Find the source node
            source_node = next((n for n in workflow_config.nodes if n.id == edge.source), None)
            if source_node and source_node.type == 'knowledge_base':
                # Execute the knowledge base node to get context
                kb_context = self._execute_node(source_node, user_query, workflow_config, stack_id)
                if kb_context:
                    context_parts.append(kb_context)
        
        return "\n\n".join(context_parts)
    
    def process_document(self, file_path: str, file_type: str, stack_id: int = None) -> Dict[str, Any]:
        """Process and store a document for the knowledge base"""
        try:
            # Extract text from document
            text = self.document_processor.extract_text_from_file(file_path, file_type)
            
            # Chunk the text
            chunks = self.document_processor.chunk_text(text)
            
            # Store chunks with embeddings
            self.embedding_service.store_document_chunks(
                document_id=str(stack_id) if stack_id else "default",
                chunks=chunks,
                metadata={"file_type": file_type, "file_path": file_path}
            )
            
            return {
                "success": True,
                "chunks_created": len(chunks),
                "message": "Document processed and stored successfully"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Document processing failed: {str(e)}"
            }
