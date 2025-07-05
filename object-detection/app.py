from flask import Flask
from flask_cors import CORS
from routes.detect import detect_blueprint

app = Flask(__name__)
CORS(app)

app.register_blueprint(detect_blueprint)

if __name__ == "__main__":
    app.run(port=8000)
