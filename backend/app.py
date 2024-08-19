from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

# Function to load and configure the OpenAI API client
def load_openai_client():
    api_key = os.getenv('AZURE_OPENAI_API_KEY')
    endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')  # Full endpoint URL from the deployment page
    print(f"API Key: {api_key}, Endpoint: {endpoint}")  # Debug: print API credentials
    return openai.AzureOpenAI(api_key=api_key, base_url=endpoint)

# Load the OpenAI client
client = load_openai_client()

@app.route('/api/parse_hole', methods=['POST'])
def parse_hole():
    data = request.json
    hole_description = data.get('description', '')

    try:
        # Send the hole description to the AI for parsing
        prompt = f"Parse the following golf hole description: '{hole_description}'. Extract the par, number of strokes, whether the fairway was hit, whether the green was hit, and the number of putts."
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="gpt-4o",
            max_tokens=500,
            temperature=0.7
        )

        parsed_info = response.choices[0].message.content
        print(f"Parsed hole information: {parsed_info}")

        # Optionally, store the parsed info in a database or return it to the frontend
        return jsonify({"parsed_info": parsed_info})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
