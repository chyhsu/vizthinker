import os
import google.generativeai as genai
import ollama
from dotenv import load_dotenv
from server.logger import logger
from server.dao.postgre import get_path_history
from typing import Optional

load_dotenv()
api_key_map={
    "google": os.getenv("GEMINI_API_KEY"),
    "openai": os.getenv("OPENAI_API_KEY"),
    "x": os.getenv("GROK_API_KEY"),
    "anthropic": os.getenv("CLAUDE_API_KEY"),
    "ollama": None,  # Ollama doesn't need API key for local models
}

basic_system_prompt = "You are an assistant for a chat application, VizThinker, visualizing and thinking by making each prompt and response as a node graph with edges representing the meaningful relationships between them. You will be given a chat history, containing a chat path of graph nodes and edges. You should reference the context of the chat history and answer the user's last prompt in a way that is consistent with the chat history. Your response should be structure and in a professional manner. Your response should be bounded in 500 tokens. There are two kinds of chatnodes in VizThinker: one is normal chatnode, going from the previous chatnode, which represnets user wants to continue the previous thought, going to next stage and exploring wider of the topic; The other is branch chatnode, braning from the previous chatnode, which means user want to go into your previous response and explore a new line of thought according to your previous response, so you should focus more on your previous response and go deeper into it when you answer the user's prompt. You should always weight more on the last chatnode, for example: chat history: [chatnode1, chatnode2, chatnode3], you should focus more on chatnode3 when answering the user's prompt."

branch_system_prompt = "The following prompt is branched out from the previous chatnode, which means user want to explore a new line of thought according to your previous response, so you should focus more on your previous response and go deeper into it when you answer the user's prompt."

normal_system_prompt = "The following prompt is a normal chatnode, going from the previous chatnode, which represnets user wants to continue the previous thought, going to next stage and exploring wider of the topic."


async def call_llm(user_prompt: str, provider: str, parent_id: Optional[int] = None, isbranch: Optional[bool] = False, model: Optional[str] = None):

    # Get Api Key (except for ollama which runs locally)
    if provider != "ollama":
        api_key = api_key_map[provider]
        if not api_key:
            raise RuntimeError(provider+" API key not set.")
    
    if parent_id is not None:
        # get_path_history now expects only message_id
        chat_history = await get_path_history(parent_id)
    else:
        chat_history = []
    global system_prompt
    global normal_system_prompt
    global branch_system_prompt
    if isbranch:
        system_prompt = basic_system_prompt + branch_system_prompt
    else:
        system_prompt = basic_system_prompt + normal_system_prompt

    system_prompt = system_prompt + "\n\nChat history: " + str(chat_history)
    
    # For each Provider
    if provider == "google":
        try:
            genai.configure(api_key=api_key_map["google"])
            # Use provided model or default
            model_name = model or 'gemini-1.5-flash-latest'
            gemini_model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_prompt
            )
            logger.info(f"Calling LLM with user_prompt: {user_prompt}, provider: {provider}, model: {model_name}")

            response = await gemini_model.generate_content_async(
                user_prompt,
                request_options={'timeout': 30}  # Set a 30-second timeout
            )

            logger.info(f"Received response from LLM: {len(response.text)} tokens")

            return response.text
            
        except ValueError as ve:
            logger.error(f"Value error in LLM call: {str(ve)}")
            raise RuntimeError(f"Invalid input: {str(ve)}")
            
        except Exception as e:
            if "quota" in str(e).lower():
                logger.error(f"API usage limit hit for Google: {e}", exc_info=True)
                raise RuntimeError(f"API usage limit hit for {provider}. Please check your plan and billing details.")
            logger.error(f"An unexpected error occurred when calling Google Gemini API: {e}", exc_info=True)
            raise RuntimeError(f"Failed to generate content: {e}")

    elif provider == "ollama":
        try:
            # Use provided model or default
            model_name = model or 'gemma3n:latest'
            logger.info(f"Calling Ollama with user_prompt: {user_prompt}, provider: {provider}, model: {model_name}")
            
            # Use ollama.chat for better control over the conversation
            response = ollama.chat(
                model=model_name,
                messages=[
                    {
                        'role': 'system',
                        'content': system_prompt
                    },
                    {
                        'role': 'user', 
                        'content': user_prompt
                    }
                ]
            )
            
            response_text = response['message']['content']
            logger.info(f"Received response from Ollama: {len(response_text)} tokens")

            return response_text
            
        except Exception as e:
            logger.error(f"An unexpected error occurred when calling Ollama: {e}", exc_info=True)
            raise RuntimeError(f"Failed to generate content from Ollama: {e}")
    
    elif provider == "openai":
        try:
            import openai
            openai.api_key = api_key_map["openai"]
            
            # Use provided model or default
            model_name = model or 'gpt-4o'
            logger.info(f"Calling OpenAI with user_prompt: {user_prompt}, provider: {provider}, model: {model_name}")
            
            # Create OpenAI client
            client = openai.OpenAI(api_key=api_key_map["openai"])
            
            # Prepare messages for OpenAI
            messages = [{"role": "system", "content": system_prompt}]
            messages.append({"role": "user", "content": user_prompt})
            
            response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            response_text = response.choices[0].message.content
            logger.info(f"Received response from OpenAI: {len(response_text)} tokens")
            
            return response_text
            
        except openai.RateLimitError as e:
            logger.error(f"OpenAI API rate limit exceeded: {e}", exc_info=True)
            raise RuntimeError(f"API usage limit hit for {provider}. Please check your plan and billing details.")
        except Exception as e:
            logger.error(f"An unexpected error occurred when calling OpenAI API: {e}", exc_info=True)
            raise RuntimeError(f"Failed to generate content from OpenAI: {e}")
    
    elif provider == "anthropic":
        try:
            import anthropic
            
            # Use provided model or default
            model_name = model or 'claude-3-5-sonnet-20240620'
            logger.info(f"Calling Anthropic with user_prompt: {user_prompt}, provider: {provider}, model: {model_name}")
            
            # Create Anthropic client
            client = anthropic.Anthropic(api_key=api_key_map["anthropic"])
            
            response = client.messages.create(
                model=model_name,
                max_tokens=300,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            
            response_text = response.content[0].text
            logger.info(f"Received response from Anthropic: {len(response_text)} tokens")
            
            return response_text
            
        except anthropic.RateLimitError as e:
            logger.error(f"Anthropic API rate limit exceeded: {e}", exc_info=True)
            raise RuntimeError(f"API usage limit hit for {provider}. Please check your plan and billing details.")
        except Exception as e:
            logger.error(f"An unexpected error occurred when calling Anthropic API: {e}", exc_info=True)
            raise RuntimeError(f"Failed to generate content from Anthropic: {e}")
    
    elif provider == "x":
        try:
            import openai
            
            # Use provided model or default  
            model_name = model or 'grok-1'
            logger.info(f"Calling X (Grok) with user_prompt: {user_prompt}, provider: {provider}, model: {model_name}")
            
            # Create OpenAI-compatible client for X/Grok
            client = openai.OpenAI(
                api_key=api_key_map["x"],
                base_url="https://api.x.ai/v1"
            )
            
            # Prepare messages
            messages = [{"role": "system", "content": system_prompt}]
            messages.append({"role": "user", "content": user_prompt})
            
            response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                max_tokens=300,
                temperature=0.7
            )
            
            response_text = response.choices[0].message.content
            logger.info(f"Received response from X (Grok): {len(response_text)} tokens")
            
            return response_text
            
        except openai.RateLimitError as e:
            logger.error(f"X/Grok API rate limit exceeded: {e}", exc_info=True)
            raise RuntimeError(f"API usage limit hit for {provider}. Please check your plan and billing details.")
        except Exception as e:
            logger.error(f"An unexpected error occurred when calling X (Grok) API: {e}", exc_info=True)
            raise RuntimeError(f"Failed to generate content from X (Grok): {e}")
    
    else:
        raise RuntimeError(f"Unsupported provider: {provider}")