import re
import random
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Medical assistant chatbot knowledge base
medical_intents = {
    'greeting': {
        'patterns': ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
        'responses': [
            'Hello! How can I help you with your healthcare needs today?',
            'Hi there! Welcome to MedAssist. How may I assist you?',
            'Hello! I\'m your virtual healthcare assistant. What can I do for you today?'
        ]
    },
    'goodbye': {
        'patterns': ['bye', 'goodbye', 'see you', 'see you later', 'farewell'],
        'responses': [
            'Goodbye! Take care of your health!',
            'Have a great day! Remember to stay healthy!',
            'Thank you for using MedAssist. Goodbye!'
        ]
    },
    'thanks': {
        'patterns': ['thanks', 'thank you', 'appreciate it', 'thank you so much'],
        'responses': [
            'You\'re welcome! Is there anything else I can help with?',
            'Happy to help! Feel free to ask if you have more questions.',
            'My pleasure! Your health is our priority.'
        ]
    },
    'appointment': {
        'patterns': ['book appointment', 'schedule visit', 'see doctor', 'make appointment', 'book a consultation'],
        'responses': [
            'You can book an appointment on our booking page. Would you like to schedule an online or in-person consultation?',
            'We offer both online and in-person appointments. Please visit our booking section to schedule.',
            'To book an appointment, please use the booking feature on our website where you can select a doctor and time slot.'
        ]
    },
    'medicine': {
        'patterns': ['order medicine', 'buy drugs', 'purchase medication', 'get prescription filled', 'refill prescription'],
        'responses': [
            'You can order medicines through our medicine ordering page. We deliver to most locations.',
            'Our online pharmacy allows you to order prescription and over-the-counter medications. Please visit the medicine section.',
            'Visit our medicine page to browse and order medications. Prescription items require valid documentation.'
        ]
    },
    'report': {
        'patterns': ['upload report', 'scan medical report', 'analyze test', 'check reports', 'laboratory results'],
        'responses': [
            'You can upload your medical reports on our report scanning page for digital analysis.',
            'Our system allows you to upload and store your medical reports securely. Visit the report section to get started.',
            'To get your reports analyzed, please upload them through our report scanning feature.'
        ]
    },
    'emergency': {
        'patterns': ['emergency', 'urgent help', 'medical emergency', 'immediate assistance', 'ambulance'],
        'responses': [
            'For medical emergencies, please call 911 immediately. Don\'t wait!',
            'If you\'re experiencing a medical emergency, dial emergency services at 911 right away.',
            'Emergency? Please call 911 now. Our emergency information page has additional guidance for various situations.'
        ]
    },
    'doctors': {
        'patterns': ['find doctor', 'specialist nearby', 'doctor search', 'nearby physician', 'healthcare provider'],
        'responses': [
            'You can find doctors in your area using our doctor search feature. Filter by specialty and location.',
            'Our doctor search tool allows you to find healthcare providers based on specialty, location, and availability.',
            'Looking for a specialist? Use our doctor search to find qualified medical professionals in your area.'
        ]
    },
    'symptoms': {
        'patterns': ['have symptom', 'not feeling well', 'sick', 'pain', 'fever', 'headache', 'cough'],
        'responses': [
            'I can provide general information, but for specific symptoms, it\'s best to consult with a healthcare professional. Would you like to book an appointment?',
            'Your symptoms might require professional medical attention. Our platform can help you connect with a doctor.',
            'While I can\'t diagnose conditions, I suggest discussing your symptoms with a doctor. Would you like help finding one?'
        ]
    }
}

def process_message(message):
    """Process the user message and generate a response using simple NLP techniques"""
    # Convert message to lowercase and tokenize
    message = message.lower()
    tokens = word_tokenize(message)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word not in stop_words]
    
    # Find the best matching intent
    best_match = None
    highest_score = 0
    
    for intent, data in medical_intents.items():
        score = 0
        for pattern in data['patterns']:
            pattern_tokens = word_tokenize(pattern.lower())
            for token in filtered_tokens:
                if token in pattern_tokens:
                    score += 1
        
        # Normalize score by the number of pattern tokens
        if score > 0:
            score = score / len(filtered_tokens) if filtered_tokens else 0
        
        if score > highest_score:
            highest_score = score
            best_match = intent
    
    # If we found a decent match (threshold can be adjusted)
    if highest_score > 0.2 and best_match:
        return random.choice(medical_intents[best_match]['responses'])
    else:
        # Default fallback response
        return "I'm sorry, I didn't understand that. Could you please rephrase or ask another question about our medical services?"
