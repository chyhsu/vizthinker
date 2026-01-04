"""
File utilities for handling file uploads in VizThinker.
Provides validation and processing for image files to be sent to LLMs.
"""
from typing import Dict, List, Optional
import base64
from fastapi import UploadFile, HTTPException
from server.logger import logger

# Supported image MIME types for Gemini API
ALLOWED_IMAGE_TYPES = {
    'image/png',
    'image/jpeg',
    'image/jpg',  # Some browsers use this
    'image/webp',
    'image/heic',
    'image/heif',
    'application/pdf'  # Gemini also supports PDFs
}

# Maximum file size: 10MB (well under Gemini's inline data limit)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes


async def validate_and_process_file(file: UploadFile) -> Dict:
    """
    Validate file type and size, return base64 encoded data with metadata.
    
    Args:
        file: FastAPI UploadFile object
        
    Returns:
        Dictionary with file data, mime_type, filename, and size
        
    Raises:
        HTTPException: If file type is unsupported or file is too large
    """
    # Validate MIME type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        logger.warning(f"Rejected file upload: unsupported type {file.content_type}")
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Supported types: PNG, JPEG, WEBP, HEIC, HEIF, PDF"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        logger.warning(f"Rejected file upload: size {len(content)} bytes exceeds limit")
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({len(content) / 1024 / 1024:.1f}MB). Maximum size: 10MB"
        )
    
    logger.info(f"Processing file: {file.filename} ({file.content_type}, {len(content)} bytes)")
    
    return {
        'data': base64.b64encode(content).decode('utf-8'),
        'mime_type': file.content_type,
        'filename': file.filename,
        'size': len(content)
    }


async def process_uploaded_files(files: Optional[List[UploadFile]]) -> Optional[List[Dict]]:
    """
    Process a list of uploaded files, validating and encoding each.
    
    Args:
        files: List of FastAPI UploadFile objects or None
        
    Returns:
        List of processed file dictionaries or None if no files
        
    Raises:
        HTTPException: If any file fails validation
    """
    if not files:
        return None
    
    processed_files = []
    for file in files:
        processed = await validate_and_process_file(file)
        processed_files.append(processed)
    
    logger.info(f"Successfully processed {len(processed_files)} files")
    return processed_files
