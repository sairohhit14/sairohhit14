from datetime import datetime
from app import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    reports = db.relationship('Report', backref='owner', lazy='dynamic')
    appointments = db.relationship('Appointment', backref='patient', lazy='dynamic')
    orders = db.relationship('MedicineOrder', backref='customer', lazy='dynamic')
    
class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    availability = db.Column(db.Boolean, default=True)
    appointments = db.relationship('Appointment', backref='doctor', lazy='dynamic')

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    is_online = db.Column(db.Boolean, default=True)
    notes = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    
class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    in_stock = db.Column(db.Boolean, default=True)
    order_items = db.relationship('OrderItem', backref='medicine', lazy='dynamic')
    
class MedicineOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='processing')  # processing, shipped, delivered, cancelled
    delivery_address = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    items = db.relationship('OrderItem', backref='order', lazy='dynamic')
    
class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey('medicine_order.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicine.id'), nullable=False)
