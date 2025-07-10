import os
import google.generativeai as genai
import logging
from dotenv import load_dotenv

# Configure logging if not already configured
if not logging.getLogger().handlers:
    logging.basicConfig(format="%(asctime)s %(levelname)s %(name)s %(filename)s:%(lineno)d - %(message)s", level=logging.INFO)

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

    # Validate user prompt
    if not user_prompt or len(user_prompt.strip()) < 3:
        raise ValueError("Prompt is too short. Please provide a more detailed prompt.")

    # For each Provider
    if provider == "google":
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',  # Can be choosed in future
                system_instruction=system_prompt
            )
            logging.info(f"Sending prompt to Google Gemini: {len(user_prompt)} tokens")

            response = model.generate_content(user_prompt)
            
            logging.info(f"Received response from LLM: {len(response.text)} tokens")

            return response.text
            
        except ValueError as ve:
            logging.error(f"Value error in LLM call: {str(ve)}")
            raise RuntimeError(f"Invalid input: {str(ve)}")
            
        except Exception as e:
            logging.error(f"Error calling Google Gemini API: {str(e)}")
            raise RuntimeError(f"Failed to generate content: {str(e)}")