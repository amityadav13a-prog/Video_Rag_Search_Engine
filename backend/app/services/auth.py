from fastapi import HTTPException, Header
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

PROJECT_ID = "video-rag-search-engine" # Firebase Project ID

def get_current_user(authorization: str=Header(None))->str:
    #Firebase ID verify's the token and return user id
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid authorization header"
        )

    token = authorization.split("Bearer ")[1]
    
    try:
        # Google's official request adapter
        transport = google_requests.Request()
        
        # verify Firebase token
        decoded_token = id_token.verify_firebase_token(
            token, 
            transport, 
            audience=PROJECT_ID
        )
        
        user_id = decoded_token.get("user_id") or decoded_token.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token missing user identifier")
            
        return user_id
        
    except Exception as e:
        print("Authentication Error Details:", str(e))
        raise HTTPException(
            status_code=401, 
            detail=f"Authentication failed: {str(e)}"
        )