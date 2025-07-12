import os
import google.generativeai as genai
import logging
from dotenv import load_dotenv
from server.logger import logger

load_dotenv()
api_key_map={
    "google": os.getenv("GEMINI_API_KEY"),
    "openai": os.getenv("OPENAI_API_KEY"),
    "x": os.getenv("GROK_API_KEY"),
    "anthropic": os.getenv("CLAUDE_API_KEY"),
}

def call_llm(system_prompt, user_prompt, provider):

    # Get Api Key
    api_key = api_key_map[provider]
    if not api_key:
        raise RuntimeError(provider+" API key not set.")

    # For each Provider
    if provider == "google":
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',  # Can be choosed in future
                system_instruction=system_prompt
            )
            logger.info(f"Calling LLM with system_prompt: {system_prompt}, user_prompt: {user_prompt}, provider: {provider}")

            response = model.generate_content(user_prompt)
            
            logger.info(f"Received response from LLM: {len(response.text)} tokens")

            return response.text
            
        except ValueError as ve:
            logging.error(f"Value error in LLM call: {str(ve)}")
            raise RuntimeError(f"Invalid input: {str(ve)}")
            
        except Exception as e:
            logging.error(f"Error calling Google Gemini API: {str(e)}")
            raise RuntimeError(f"Failed to generate content: {str(e)}")