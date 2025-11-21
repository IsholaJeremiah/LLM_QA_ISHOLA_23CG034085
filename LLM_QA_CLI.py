#!/usr/bin/env python3
"""
LLM Question and Answering CLI Application
Name: Osarenkhoe Osatohanmwen
Matric No: 23CG034140
"""

import os
import string
from dotenv import load_dotenv
from google import genai
from google.genai.errors import APIError

# Load environment variables
load_dotenv()


def preprocess_question(question):
    """
    Preprocess the input question:
    - Lowercasing
    - Tokenization
    - Punctuation removal
    
    Args:
        question (str): Raw input question
        
    Returns:
        tuple: (processed_question, original_question)
    """
    # Store original question
    original = question
    
    # Convert to lowercase
    question_lower = question.lower()
    
    # Remove punctuation
    question_no_punct = question_lower.translate(
        str.maketrans('', '', string.punctuation)
    )
    
    # Tokenization (split into words)
    tokens = question_no_punct.split()
    
    # Join tokens back
    processed = ' '.join(tokens)
    
    print(\"
--- Preprocessing Steps ---\")
    print(f\"Original: {original}\")
    print(f\"Lowercased: {question_lower}\")
    print(f\"Punctuation Removed: {question_no_punct}\")
    print(f\"Tokens: {tokens}\")
    print(f\"Processed: {processed}\")
    print(\"-------------------------
\")
    
    return processed, original


def query_llm(question, api_key):
    """
    Send question to Google Gemini LLM API
    
    Args:
        question (str): The question to ask
        api_key (str): Google Gemini API key
        
    Returns:
        str: The LLM's answer
    """
    try:
        # Initialize Gemini client
        client = genai.Client(api_key=api_key)
        model = \"gemini-1.5-flash\"
        
        # Construct prompt
        prompt = f\"Answer the following question concisely: {question}\"
        
        print(f\"Sending to LLM API (Model: {model})...\")
        
        # Generate response
        response = client.models.generate_content(
            model=model,
            contents=prompt
        )
        
        if response and response.text:
            return response.text
        else:
            return \"No response generated. Please try again.\"
            
    except APIError as e:
        return f\"API Error: {str(e)}\"
    except Exception as e:
        return f\"Error: {str(e)}\"


def main():
    """Main CLI application loop"""
    print(\"=\" * 60)
    print(\"LLM Question and Answering CLI\")
    print(\"Name: Osarenkhoe Osatohanmwen\")
    print(\"Matric No: 23CG034140\")
    print(\"=\" * 60)
    
    # Get API key from environment
    api_key = os.getenv(\"GEMINI_API_KEY\")
    
    if not api_key:
        print(\"
  ERROR: GEMINI_API_KEY not found!\")
        print(\"Please create a .env file with:\")
        print(\"GEMINI_API_KEY=your_api_key_here\")
        print(\"
Get your key from: https://makersuite.google.com/app/apikey\")
        return
    
    print(\"
 API Key loaded successfully\")
    print(\"
Type 'quit' or 'exit' to close the application.
\")
    
    while True:
        # Get user input
        print(\"-\" * 60)
        question = input(\"Enter your question: \").strip()
        
        # Check for exit command
        if question.lower() in ['quit', 'exit', 'q']:
            print(\"
Thank you for using the LLM Q&A CLI. Goodbye!\")
            break
        
        if not question:
            print(\"Please enter a valid question.
\")
            continue
        
        # Preprocess the question
        processed_question, original_question = preprocess_question(question)
        
        # Query the LLM
        print(\"Processing your question...\")
        answer = query_llm(original_question, api_key)
        
        # Display the answer
        print(\"
\" + \"=\" * 60)
        print(\"ANSWER:\")
        print(\"=\" * 60)
        print(answer)
        print(\"=\" * 60 + \"
\")


if __name__ == \"__main__\":
    main()
