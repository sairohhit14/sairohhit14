import os
import logging
from flask import render_template, request, redirect, url_for, jsonify, flash, session
from app import app, db
from models import User, Report, Doctor, Appointment, Medicine, MedicineOrder, OrderItem
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
from chatbot import process_message

# Create mock data for initial load
def create_mock_data():
    # Only create if empty
    if Doctor.query.count() == 0:
        # Add sample doctors
        doctors = [
            Doctor(name="Dr. Sarah Johnson", specialty="Cardiology", location="Downtown Medical Center"),
            Doctor(name="Dr. Michael Chen", specialty="Neurology", location="West Side Hospital"),
            Doctor(name="Dr. Emily Rodriguez", specialty="Pediatrics", location="Children's Health Center"),
            Doctor(name="Dr. David Kim", specialty="Orthopedics", location="Sports Medicine Clinic"),
            Doctor(name="Dr. Lisa Thompson", specialty="Family Medicine", location="Community Health Services")
        ]
        db.session.add_all(doctors)
        
    if Medicine.query.count() == 0:
        # Add sample medicines
        medicines = [
            Medicine(name="Amoxicillin", description="Antibiotic for bacterial infections", price=12.99),
            Medicine(name="Lisinopril", description="Used for high blood pressure", price=15.50),
            Medicine(name="Metformin", description="Treatment for type 2 diabetes", price=8.75),
            Medicine(name="Atorvastatin", description="Lowers cholesterol levels", price=22.30),
            Medicine(name="Albuterol", description="Treats asthma and other breathing conditions", price=18.99)
        ]
        db.session.add_all(medicines)
    
    db.session.commit()

# The create_mock_data function will be called when this module is imported from app.py,
# which happens inside the app context that's already established

# Main routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/report')
def report():
    return render_template('report.html')

@app.route('/booking')
def booking():
    doctors = Doctor.query.all()
    return render_template('booking.html', doctors=doctors)

@app.route('/medicine')
def medicine():
    medicines = Medicine.query.all()
    return render_template('medicine.html', medicines=medicines)

@app.route('/doctors')
def doctors():
    doctors = Doctor.query.all()
    return render_template('doctors.html', doctors=doctors)

@app.route('/emergency')
def emergency():
    return render_template('emergency.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

# API endpoints
@app.route('/api/upload_report', methods=['POST'])
def upload_report():
    if 'report_file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['report_file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Mock user_id for demo purposes (in a real app, get from session)
    user_id = 1
    
    # Secure the filename and save to a reports directory
    filename = secure_filename(file.filename)
    description = request.form.get('description', '')
    
    # Create directory if it doesn't exist
    os.makedirs('static/uploads/reports', exist_ok=True)
    file_path = os.path.join('static/uploads/reports', filename)
    file.save(file_path)
    
    # Create new report in the database
    new_report = Report(filename=filename, description=description, user_id=user_id)
    db.session.add(new_report)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Report uploaded successfully'})

@app.route('/api/book_appointment', methods=['POST'])
def book_appointment():
    data = request.json
    doctor_id = data.get('doctor_id')
    appointment_date = datetime.strptime(data.get('date'), '%Y-%m-%dT%H:%M')
    is_online = data.get('is_online', True)
    notes = data.get('notes', '')
    
    # Mock user_id for demo purposes (in a real app, get from session)
    user_id = 1
    
    new_appointment = Appointment(
        date=appointment_date,
        is_online=is_online,
        notes=notes,
        user_id=user_id,
        doctor_id=doctor_id
    )
    
    db.session.add(new_appointment)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Appointment booked successfully'})

@app.route('/api/order_medicine', methods=['POST'])
def order_medicine():
    data = request.json
    items = data.get('items', [])
    delivery_address = data.get('delivery_address', '')
    
    # Mock user_id for demo purposes (in a real app, get from session)
    user_id = 1
    
    if not items or not delivery_address:
        return jsonify({'error': 'Missing required information'}), 400
    
    # Create the order
    new_order = MedicineOrder(user_id=user_id, delivery_address=delivery_address)
    db.session.add(new_order)
    db.session.flush()  # Get the ID without committing
    
    # Add items to the order
    for item in items:
        medicine_id = item.get('medicine_id')
        quantity = item.get('quantity', 1)
        new_item = OrderItem(order_id=new_order.id, medicine_id=medicine_id, quantity=quantity)
        db.session.add(new_item)
    
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Order placed successfully', 'order_id': new_order.id})

@app.route('/api/search_doctors', methods=['GET'])
def search_doctors():
    specialty = request.args.get('specialty', '')
    location = request.args.get('location', '')
    
    query = Doctor.query
    
    if specialty:
        query = query.filter(Doctor.specialty.ilike(f'%{specialty}%'))
    if location:
        query = query.filter(Doctor.location.ilike(f'%{location}%'))
    
    doctors = query.all()
    
    result = [{
        'id': doctor.id,
        'name': doctor.name,
        'specialty': doctor.specialty,
        'location': doctor.location,
        'availability': doctor.availability
    } for doctor in doctors]
    
    return jsonify({'doctors': result})

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({'error': 'No message provided'}), 400
    
    response = process_message(message)
    
    return jsonify({'response': response})
