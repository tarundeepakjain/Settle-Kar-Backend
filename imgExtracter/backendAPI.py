from flask import Flask, request, jsonify
from Extracter import extract
app = Flask(__name__)
@app.route('/extract', methods=['POST'])
def extract_bill():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_path = "testbill.png"
    file.save(file_path)

    result = extract(file_path)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
