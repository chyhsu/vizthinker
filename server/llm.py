import os
import google.generativeai as genai
from dotenv import load_dotenv
from server.logger import logger
from server.dao.sqlite import get_chatrecord

load_dotenv()
api_key_map={
    "google": os.getenv("GEMINI_API_KEY"),
    "openai": os.getenv("OPENAI_API_KEY"),
    "x": os.getenv("GROK_API_KEY"),
    "anthropic": os.getenv("CLAUDE_API_KEY"),
}

async def call_llm(user_prompt, provider):

    # Get Api Key
    api_key = api_key_map[provider]
    if not api_key:
        raise RuntimeError(provider+" API key not set.")
    chat_history = await get_chatrecord()
    system_prompt = "You are a LLM chat box. Give resposnse within 300 tokens."+ "\n\n"+ "Chat history: " + str(chat_history)
    
    # For each Provider
    if provider == "google":
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',  # Can be choosed in future
                system_instruction=system_prompt
            )
            logger.info(f"Calling LLM with user_prompt: {user_prompt}, provider: {provider}")

            response = await model.generate_content_async(
                user_prompt,
                request_options={"timeout": 10}
            )
            
            logger.info(f"Received response from LLM: {len(response.text)} tokens")

            return response.text
            
        except ValueError as ve:
            logger.error(f"Value error in LLM call: {str(ve)}")
            raise RuntimeError(f"Invalid input: {str(ve)}")
            
        except Exception as e:
            logger.error(f"An unexpected error occurred when calling Google Gemini API: {e}", exc_info=True)
            raise RuntimeError(f"Failed to generate content: {e}")