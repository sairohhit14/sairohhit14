import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "medical-assistance-default-secret")

# Configure PostgreSQL database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the app with the extension
db.init_app(app)

# Setup database tables
with app.app_context():
    # Import models here to ensure tables are created
    import models
    db.create_all()
    
    # Now import routes after models and db are initialized
    from routes import create_mock_data, index, report, booking, medicine, doctors, emergency, contact
    from routes import upload_report, book_appointment, order_medicine, search_doctors, chatbot
    
    # Create initial data for the application
    create_mock_data()
