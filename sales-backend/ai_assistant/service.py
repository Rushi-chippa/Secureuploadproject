
import os
from google import genai
from sqlalchemy.orm import Session
from .tools import (
    get_leaderboard_context, 
    get_sales_summary_context, 
    get_product_performance_context,
    get_low_stock_context,
    get_regional_sales_context,
    get_prediction_context
)
import time

class AIService:
    def __init__(self, db: Session, user):
        self.db = db
        self.user = user
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Error initializing GenAI client: {e}")
                self.client = None
        else:
            self.client = None

    def get_company_context(self):
        """
        Aggregates company-wide context from various tools.
        Uses in-memory caching to improve performance.
        DOES NOT include specific user details.
        """
        # Global cache check
        global CONTEXT_CACHE
        if 'CONTEXT_CACHE' not in globals():
            CONTEXT_CACHE = {}
            
        company_id = self.user.company_id
        current_time = time.time()
        
        # Check cache (TTL 5 minutes)
        if company_id in CONTEXT_CACHE:
            timestamp, cached_data = CONTEXT_CACHE[company_id]
            if current_time - timestamp < 300:
                print("Using cached company context")
                return cached_data

        print("Generating new company context...")
        t0 = time.time()

        # Fetch data sequentially
        leaderboard = get_leaderboard_context(self.db, company_id)
        sales_summary = get_sales_summary_context(self.db, company_id)
        products = get_product_performance_context(self.db, company_id)
        low_stock = get_low_stock_context(self.db, company_id)
        regional_sales = get_regional_sales_context(self.db, company_id)
        
        # Predictions (Filter by user for salesmen, company-wide for managers)
        user_id = self.user.id if self.user.role == "salesman" else None
        predictions = get_prediction_context(company_id, user_id=user_id)
        
        # Determine Company Name safely
        company_name = self.user.company.name if self.user.company else "Unknown Company"

        context = f"""
        You are an AI assistant for a Sales Portal at {company_name}. 
        Your goal is to answer questions based on the following real-time data:
        
        {leaderboard}
        
        {sales_summary}
        
        {products}

        {regional_sales}

        {predictions}

        {low_stock}
        
        General Instructions:
        - Be helpful and professional.
        - If the user asks about the leaderboard, use the data provided above.
        - If the user asks about "future sales", "forecasts", or "predictions", use the AI Predictions data.
        - If the user asks "who is top", look at the rank 1 in the leaderboard.
        - Keep answers concise.
        - ALWAYS display currency in Indian Rupees (₹).
        """
        
        # Update cache
        CONTEXT_CACHE[company_id] = (current_time, context)
        print(f"Company context generation took: {time.time() - t0:.4f}s")
        return context

    def get_user_context(self):
        """
        Generates user-specific context.
        NOT CACHED.
        """
        company_name = self.user.company.name if self.user.company else "Unknown Company"
        return f"""
        User Context:
        Name: {self.user.full_name}
        Role: {self.user.role}
        Company: {company_name}
        Current Date: {time.strftime('%Y-%m-%d')}
        """

    async def get_response(self, question: str):
        if not self.client and not self.api_key:
             return "AI Service is not configured. Please set GEMINI_API_KEY."
            
        # Combine cached company context with dynamic user context
        company_context = self.get_company_context()
        user_context = self.get_user_context()
        
        full_context = f"{company_context}\n\n{user_context}"
        prompt = f"{full_context}\n\nUser Question: {question}\nAI Answer:"
        
        # If client is initialized (SDK), use it
        if self.client:
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash", contents=prompt
                )
                return response.text
            except Exception as e:
                print(f"SDK Error: {e}, falling back to REST")
        
        # Fallback to REST if SDK fails or not initialized
        # Using httpx for direct REST call to avoid SDK SSL issues
        import httpx
        
        # Valid models from previous check
        models_to_try = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
        ]
        
        last_error = None
        
        async with httpx.AsyncClient() as client:
            for model_name in models_to_try:
                try:
                    print(f"Attempting model (REST): {model_name}")
                    # Remove 'models/' prefix if present in the list, though here we have short names
                    # The API expects 'models/model-name' or just 'model-name'? 
                    # The list returned 'models/gemini-2.5-flash'.
                    # The URL construction below uses f".../models/{model_name}..."
                    # If I use 'gemini-2.5-flash', URL becomes ".../models/gemini-2.5-flash..." which is correct.
                    
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
                    
                    payload = {
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }]
                    }
                    
                    t0 = time.time()
                    response = await client.post(url, json=payload, timeout=30.0)
                    duration = time.time() - t0
                    
                    if response.status_code == 200:
                        data = response.json()
                        try:
                            answer = data['candidates'][0]['content']['parts'][0]['text']
                            print(f"Model {model_name} success in {duration:.4f}s")
                            return answer
                        except (KeyError, IndexError) as e:
                            print(f"Error parsing response from {model_name}: {e}")
                            last_error = f"Parse error: {data}"
                            continue
                    else:
                        print(f"Model {model_name} failed with {response.status_code}: {response.text}")
                        last_error = f"{response.status_code} - {response.text}"
                        continue
                        
                except Exception as e:
                    print(f"Model {model_name} exception: {e}")
                    last_error = str(e)
                    continue

        return f"Unable to generate response. Last error: {str(last_error)}"

        return f"Unable to generate response. Last error: {str(last_error)}"
