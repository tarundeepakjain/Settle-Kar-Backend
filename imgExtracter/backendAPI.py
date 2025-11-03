from flask import Flask, request, jsonify
from Extracter import extract
app = Flask(__name__)

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_path = "testbill.png"
    file.save(file_path)

    result = extract(file_path)
    return jsonify(result)

