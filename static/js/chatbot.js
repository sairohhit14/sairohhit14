/**
 * WellNow - Chatbot JavaScript
 * Handles the chatbot interaction and message processing
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get chatbot elements
    const chatbotForm = document.getElementById('chatbotForm');
    const userInput = document.getElementById('userInput');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const voiceButton = document.getElementById('voiceButton');
    
    // Check if chatbot elements exist on the page
    if (!chatbotForm || !userInput || !chatbotMessages) {
        console.log('Chatbot elements not found on this page');
        return;
    }
    
    // Handle initial greeting
    const initialMessages = [
        "Hello! I'm your WellNow virtual assistant. How can I help you today?",
        "Need help finding a doctor?",
        "You can ask about appointments, medications, or emergency services."
    ];
    
    // Add initial chatbot messages with delay
    setTimeout(() => {
        addBotMessage(initialMessages[0]);
    }, 500);
    
    setTimeout(() => {
        addBotSuggestions([
            "Book an appointment", 
            "Find a doctor", 
            "Order medicine",
            "Emergency information"
        ]);
    }, 1500);
    
    // Submit handler for chat form
    chatbotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input field
        userInput.value = '';
        
        // Process message and get response
        processMessage(message);
    });
    
    // Function to add user message to chat
    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.textContent = message;
        chatbotMessages.appendChild(messageElement);
        
        // Scroll to bottom of chat
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Function to add bot message to chat
    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.textContent = message;
        chatbotMessages.appendChild(messageElement);
        
        // Scroll to bottom of chat
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Function to add suggestion buttons
    function addBotSuggestions(suggestions) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'bot-suggestions mb-3';
        
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.className = 'btn btn-sm btn-outline-primary me-2 mb-2';
            button.textContent = suggestion;
            
            button.addEventListener('click', function() {
                addUserMessage(suggestion);
                processMessage(suggestion);
            });
            
            suggestionsContainer.appendChild(button);
        });
        
        chatbotMessages.appendChild(suggestionsContainer);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Function to process user message and get bot response
    function processMessage(message) {
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot-message typing-indicator';
        typingIndicator.innerHTML = '<div class="typing-dots"><span>.</span><span>.</span><span>.</span></div>';
        chatbotMessages.appendChild(typingIndicator);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        
        // Make API request to chatbot backend
        fetch('/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        })
        .then(response => response.json())
        .then(data => {
            // Remove typing indicator
            chatbotMessages.removeChild(typingIndicator);
            
            // Add bot response
            addBotMessage(data.response);
            
            // Add relevant suggestions based on message context
            if (message.toLowerCase().includes('appointment') || message.toLowerCase().includes('book')) {
                addBotSuggestions(["View available times", "Choose a specialist", "Online consultation"]);
            } else if (message.toLowerCase().includes('medicine') || message.toLowerCase().includes('prescription')) {
                addBotSuggestions(["Upload prescription", "Order medicine", "View medications"]);
            } else if (message.toLowerCase().includes('doctor') || message.toLowerCase().includes('specialist')) {
                addBotSuggestions(["Find by specialty", "Doctors near me", "Book appointment"]);
            } else if (message.toLowerCase().includes('emergency')) {
                addBotSuggestions(["Call 911", "Find nearest hospital", "First aid info"]);
            }
        })
        .catch(error => {
            // Remove typing indicator
            chatbotMessages.removeChild(typingIndicator);
            
            // Add error message
            addBotMessage("I'm sorry, I'm having trouble connecting to the server. Please try again later.");
            console.error('Error:', error);
        });
    }
    
    // Link voice button to voice recognition
    if (voiceButton) {
        voiceButton.addEventListener('click', function() {
            if (window.startVoiceRecognition) {
                window.startVoiceRecognition(function(transcript) {
                    userInput.value = transcript;
                    // Trigger submit if we got a result
                    if (transcript.trim() !== '') {
                        chatbotForm.dispatchEvent(new Event('submit'));
                    }
                });
            } else {
                addBotMessage("Voice recognition is not available. Please type your message instead.");
            }
        });
    }
    
    // Handle quick access to chatbot from other page elements
    const chatbotOpenButtons = document.querySelectorAll('[id^="openChatbotFrom"], #startChatbot');
    chatbotOpenButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', function() {
                // Find and click the chatbot toggle button
                const chatbotToggle = document.getElementById('chatbotToggle');
                if (chatbotToggle) {
                    chatbotToggle.click();
                }
            });
        }
    });
});
