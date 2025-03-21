/**
 * MedAssist - Voice Recognition JavaScript
 * Handles speech recognition for the chatbot
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    
    if (!SpeechRecognition) {
        console.log('Speech recognition not supported');
        // Hide voice button if speech recognition is not supported
        const voiceButton = document.getElementById('voiceButton');
        if (voiceButton) {
            voiceButton.style.display = 'none';
        }
        return;
    }
    
    // Configure speech recognition
    const recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();
    
    // Medical terms grammar to improve recognition accuracy
    const medicalTerms = [
        'appointment', 'doctor', 'medicine', 'prescription', 'emergency',
        'heart', 'pain', 'symptoms', 'fever', 'headache', 'cough', 'cold',
        'consultation', 'specialist', 'pediatrician', 'cardiologist', 'neurologist',
        'hospital', 'clinic', 'pharmacy', 'ambulance', 'report', 'scan', 'test',
        'blood pressure', 'diabetes', 'asthma', 'allergies', 'vaccination'
    ];
    
    const grammar = '#JSGF V1.0; grammar medicalTerms; public <medicalTerm> = ' + medicalTerms.join(' | ') + ' ;';
    speechRecognitionList.addFromString(grammar, 1);
    
    recognition.grammars = speechRecognitionList;
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Get voice button element
    const voiceButton = document.getElementById('voiceButton');
    
    // Variable to track if recognition is active
    let isRecognizing = false;
    
    // Function to start voice recognition
    window.startVoiceRecognition = function(callback) {
        if (isRecognizing) {
            recognition.stop();
            return;
        }
        
        isRecognizing = true;
        
        // Add visual indication that voice is being recorded
        if (voiceButton) {
            voiceButton.classList.add('listening');
            voiceButton.innerHTML = '<i class="fas fa-microphone-alt"></i>';
        }
        
        // Add a voice feedback element
        const feedbackElement = document.createElement('div');
        feedbackElement.id = 'voiceFeedback';
        feedbackElement.className = 'alert alert-info mt-2 mb-2';
        feedbackElement.innerHTML = '<i class="fas fa-microphone-alt me-2"></i> Listening...';
        
        const chatbotMessages = document.getElementById('chatbotMessages');
        if (chatbotMessages) {
            chatbotMessages.appendChild(feedbackElement);
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        // Start recognition
        try {
            recognition.start();
        } catch (e) {
            console.error('Recognition error:', e);
            resetVoiceUI();
            if (callback) callback('');
        }
        
        // Recognition result handler
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            
            // Update feedback element with recognized text
            if (feedbackElement) {
                feedbackElement.innerHTML = '<i class="fas fa-check me-2"></i> Recognized: "' + transcript + '"';
            }
            
            // Call the callback with the transcript
            if (callback) callback(transcript);
            
            // Reset UI after a short delay
            setTimeout(resetVoiceUI, 1000);
        };
        
        // Error handler
        recognition.onerror = function(event) {
            console.error('Recognition error:', event.error);
            
            if (feedbackElement) {
                feedbackElement.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i> Error: ' + event.error;
                feedbackElement.className = 'alert alert-danger mt-2 mb-2';
            }
            
            setTimeout(resetVoiceUI, 2000);
            if (callback) callback('');
        };
        
        // End handler
        recognition.onend = function() {
            resetVoiceUI();
        };
        
        // Function to reset UI elements
        function resetVoiceUI() {
            isRecognizing = false;
            
            if (voiceButton) {
                voiceButton.classList.remove('listening');
                voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            }
            
            // Remove feedback element after a delay
            if (feedbackElement && feedbackElement.parentNode) {
                setTimeout(() => {
                    feedbackElement.parentNode.removeChild(feedbackElement);
                }, 1500);
            }
        }
    };
    
    // Add click handler to voice button
    if (voiceButton) {
        voiceButton.addEventListener('click', function() {
            window.startVoiceRecognition(function(transcript) {
                const userInput = document.getElementById('userInput');
                if (userInput) {
                    userInput.value = transcript;
                    
                    // Trigger form submission if we got text
                    if (transcript.trim() !== '') {
                        const chatbotForm = document.getElementById('chatbotForm');
                        if (chatbotForm) {
                            chatbotForm.dispatchEvent(new Event('submit'));
                        }
                    }
                }
            });
        });
    }
});
