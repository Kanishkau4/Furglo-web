document.addEventListener('DOMContentLoaded', function () {



        // --- API Integration Functions ---
        
        // Collect form data based on provider type
        function collectFormData(form, providerType) {
            const formData = {
                profession_type: mapProviderTypeToProfession(providerType)
            };
            
            // Collect basic fields
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    if (input.checked && input.name) {
                        if (!formData[input.name]) formData[input.name] = [];
                        formData[input.name].push(input.value);
                    }
                } else if (input.type === 'file') {
                    // Handle file uploads separately
                    return;
                } else if (input.value && input.name) {
                    formData[input.name] = input.value;
                }
            });
            
            // Map form fields to API format
            return mapFormDataToAPI(formData, providerType);
        }
        
        // Map provider types to backend profession types
        function mapProviderTypeToProfession(providerType) {
            const mapping = {
                'vet': PROFESSION_TYPES.VETERINARIAN,
                'groomer': PROFESSION_TYPES.GROOMER,
                'boarding': PROFESSION_TYPES.BOARDING,
                'trainer': PROFESSION_TYPES.TRAINER,
                'sitter': PROFESSION_TYPES.PET_SITTER,
                'transport': PROFESSION_TYPES.TRANSPORTER,
                'lab': PROFESSION_TYPES.DIAGNOSTIC_LAB
            };
            return mapping[providerType] || providerType;
        }
        
        // Map form data to API format
        function mapFormDataToAPI(formData, providerType) {
            // Extract common fields based on form structure
            const apiData = {
                email: getFormValue(formData, ['email', 'email-address']),
                first_name: getFormValue(formData, ['first_name', 'full-name'])?.split(' ')[0] || getFormValue(formData, ['first_name']),
                last_name: getFormValue(formData, ['last_name', 'full-name'])?.split(' ').slice(1).join(' ') || getFormValue(formData, ['last_name']),
                profession_type: formData.profession_type,
                license_number: getFormValue(formData, ['license_number', 'medical-license-number']),
                mobile_number: getFormValue(formData, ['mobile_number', 'phone', 'phone-number']),
                years_experience: parseInt(getFormValue(formData, ['years_experience', 'experience'])) || 0,
                city: getFormValue(formData, ['city']),
                password: getFormValue(formData, ['password']),
                business_name: getFormValue(formData, ['business_name', 'affiliated_clinic'])
            };
            
            // Add provider-specific fields
            switch (providerType) {
                case 'vet':
                    apiData.specialization = getFormValue(formData, ['specialization']);
                    apiData.affiliated_clinic = getFormValue(formData, ['affiliated_clinic', 'business_name']);
                    
                    // Add availability data
                    apiData.availability = {};
                    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                    days.forEach(day => {
                        apiData.availability[day] = [];
                        ['morning', 'afternoon', 'evening'].forEach(period => {
                            const fieldName = `${day}_${period}`;
                            if (formData[fieldName]) {
                                apiData.availability[day].push(formData[fieldName]);
                            }
                        });
                    });
                    
                    // Add emergency services data
                    if (formData.emergency_available) {
                        apiData.emergency_services = {
                            available: true,
                            hours_type: getFormValue(formData, ['emergency_hours_type']),
                            custom_hours: getFormValue(formData, ['custom_emergency_hours']),
                            contact_number: getFormValue(formData, ['emergency_contact']),
                            response_time: getFormValue(formData, ['emergency_response_time'])
                        };
                    } else {
                        apiData.emergency_services = { available: false };
                    }
                    break;
                case 'groomer':
                    apiData.services_offered = formData.services || [];
                    apiData.service_type = getFormValue(formData, ['service_type']);
                    break;
                case 'boarding':
                    apiData.facility_type = getFormValue(formData, ['facility_type']);
                    apiData.capacity = parseInt(getFormValue(formData, ['capacity'])) || 0;
                    break;
                case 'trainer':
                    apiData.certification = getFormValue(formData, ['certification']);
                    apiData.training_methods = formData.training_methods || [];
                    break;
                case 'transport':
                    apiData.drivers_license = getFormValue(formData, ['drivers_license']);
                    apiData.vehicle_type = getFormValue(formData, ['vehicle_type']);
                    apiData.insurance_info = getFormValue(formData, ['insurance_info']);
                    break;
                case 'sitter':
                    apiData.experience_level = getFormValue(formData, ['experience_level']);
                    apiData.emergency_contact_name = getFormValue(formData, ['emergency_contact_name']);
                    apiData.emergency_contact_phone = getFormValue(formData, ['emergency_contact_phone']);
                    break;
                case 'lab':
                    apiData.accreditation_type = getFormValue(formData, ['accreditation_type']);
                    break;
            }
            
            // Remove undefined/null values
            Object.keys(apiData).forEach(key => {
                if (apiData[key] === undefined || apiData[key] === null || apiData[key] === '') {
                    delete apiData[key];
                }
            });
            
            return apiData;
        }
        
        // Helper function to get form values by multiple possible keys
        function getFormValue(formData, keys) {
            for (const key of keys) {
                if (formData[key]) return formData[key];
            }
            return null;
        }
        
        // Validate form data
        function validateFormData(formData) {
            if (!formData.email) {
                apiUtils.showError('Email address is required');
                return false;
            }
            
            if (!apiUtils.validateEmail(formData.email)) {
                apiUtils.showError('Please enter a valid email address');
                return false;
            }
            
            if (!formData.first_name) {
                apiUtils.showError('First name is required');
                return false;
            }
            
            if (!formData.last_name) {
                apiUtils.showError('Last name is required');
                return false;
            }
            
            if (!formData.mobile_number) {
                apiUtils.showError('Phone number is required');
                return false;
            }
            
            if (!apiUtils.validatePhone(formData.mobile_number)) {
                apiUtils.showError('Please enter a valid phone number');
                return false;
            }
            
            if (!formData.password) {
                apiUtils.showError('Password is required');
                return false;
            }
            
            if (!formData.city) {
                apiUtils.showError('City is required');
                return false;
            }
            
            return true;
        }
        
        // Validate individual step before proceeding to next
        function validateStep(stepElement, stepNumber) {
            const requiredFields = stepElement.querySelectorAll('input[required], select[required]');
            
            for (let field of requiredFields) {
                if (!field.value.trim()) {
                    let fieldLabel = field.previousElementSibling?.textContent || field.placeholder || 'This field';
                    apiUtils.showError(`${fieldLabel} is required`);
                    field.focus();
                    return false;
                }
                
                // Email validation
                if (field.type === 'email' && !apiUtils.validateEmail(field.value)) {
                    apiUtils.showError('Please enter a valid email address');
                    field.focus();
                    return false;
                }
                
                // Phone validation
                if (field.type === 'tel' && !apiUtils.validatePhone(field.value)) {
                    apiUtils.showError('Please enter a valid phone number');
                    field.focus();
                    return false;
                }
                
                // Password validation
                if (field.type === 'password') {
                    const validation = apiUtils.validatePassword(field.value);
                    if (!validation.valid) {
                        apiUtils.showError(validation.message);
                        field.focus();
                        return false;
                    }
                }
            }
            
            return true;
        }
        
        // Submit registration to backend
        async function submitRegistration(formData, button, container) {
            try {
                const response = await apiUtils.registerProfessional(formData);
                
                // Hide loading state
                apiUtils.hideLoading(button);
                
                // Show success
                container.classList.remove('active');
                showRegistrationSuccess(response);
                
            } catch (error) {
                apiUtils.hideLoading(button);
                apiUtils.showError(error.message);
            }
        }
        
        // Show registration success
        function showRegistrationSuccess(response) {
            const successContainer = document.querySelector('.success-container');
            if (successContainer) {
                successContainer.classList.add('active');
                successContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                apiUtils.showSuccess('Registration submitted successfully! Please check your email to verify your account.');
                // Redirect to login after a delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            }
        }
        
        // --- End API Integration Functions ---
        
        // --- Location Functionality ---
        
        // Initialize location functionality
        function initializeLocationFeature() {
            const locationBtns = document.querySelectorAll('#get-location-btn');
            
            locationBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    getCurrentLocation(this);
                });
            });
        }
        
        // Get current location using geolocation API
        function getCurrentLocation(button) {
            if (!navigator.geolocation) {
                apiUtils.showError('Geolocation is not supported by this browser');
                return;
            }
            
            // Show loading state
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
            button.disabled = true;
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    // Use reverse geocoding to get city name
                    reverseGeocode(latitude, longitude, button, originalText);
                },
                function(error) {
                    button.innerHTML = originalText;
                    button.disabled = false;
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            apiUtils.showError('Location access denied. Please enter your city manually.');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            apiUtils.showError('Location information unavailable. Please enter your city manually.');
                            break;
                        case error.TIMEOUT:
                            apiUtils.showError('Location request timed out. Please enter your city manually.');
                            break;
                        default:
                            apiUtils.showError('An unknown error occurred while getting location.');
                            break;
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        }
        
        // Reverse geocoding to get city from coordinates
        async function reverseGeocode(latitude, longitude, button, originalText) {
            try {
                // Using OpenStreetMap Nominatim API (free)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
                const data = await response.json();
                
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.village || data.address.county;
                    const country = data.address.country;
                    
                    if (city) {
                        // Update the city input field
                        const cityInput = button.closest('.form-group').querySelector('input[name="city"]');
                        if (cityInput) {
                            cityInput.value = `${city}, ${country}`;
                        }
                        
                        // Show location display
                        const mapContainer = button.closest('.form-group').querySelector('.map-container');
                        const locationDisplay = mapContainer.querySelector('#location-display');
                        
                        if (locationDisplay) {
                            locationDisplay.innerHTML = `
                                <i class="fas fa-map-marker-alt" style="color: var(--primary); font-size: 2rem; margin-bottom: 10px;"></i>
                                <p style="margin: 0; color: #4A5568; font-weight: 600;">${city}, ${country}</p>
                                <p style="margin: 5px 0 0 0; color: #718096; font-size: 0.9rem;">Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}</p>
                            `;
                            mapContainer.style.display = 'block';
                        }
                        
                        apiUtils.showSuccess('Location detected successfully!');
                    } else {
                        throw new Error('Could not determine city from coordinates');
                    }
                } else {
                    throw new Error('No location data received');
                }
            } catch (error) {
                console.error('Reverse geocoding error:', error);
                apiUtils.showError('Could not determine city from coordinates. Please enter manually.');
            } finally {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        }
        
        // --- End Location Functionality ---
        
        // --- Common Functionality ---

        // Header scroll effect
        const header = document.querySelector('header');
        function updateHeaderBackground() {
            if (window.scrollY > 100) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', updateHeaderBackground);
        updateHeaderBackground();

        // Scroll reveal animation
        const revealElements = () => {
            const elements = document.querySelectorAll('.reveal-item, .reveal-text');
            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('active');
                }
            });
        };
        window.addEventListener('scroll', revealElements);
        setTimeout(revealElements, 100); // Initialize on load

        // Initialize on page load
        initializeLocationFeature();
        
        // --- Provider Registration Specific Logic ---

        // 1. Provider Type Selection with Profession Mapping
        const providerCards = document.querySelectorAll('.provider-type-card');
        const registrationContainers = document.querySelectorAll('.registration-container');
        
        // Mapping from provider card data-type to backend profession_type
        const providerProfessionMapping = {
            'vet': 'veterinarian',
            'groomer': 'pet_groomer', 
            'boarding': 'pet_sitter', // Boarding facilities are a type of pet sitting service
            'trainer': 'pet_trainer',
            'lab': 'veterinary_technician', // Lab work is typically done by vet techs
            'transport': 'pet_sitter', // Transport is often a pet sitting service
            'sitter': 'pet_sitter'
        };

        // Ensure elements exist before adding listeners
        if (providerCards.length > 0 && registrationContainers.length > 0) {
            providerCards.forEach(card => {
                card.addEventListener('click', function () {
                    const providerType = this.getAttribute('data-type');

                    // Guard clause if data-type is missing or incorrect
                    if (!providerType) {
                        console.warn("Clicked card missing 'data-type' attribute:", this);
                        return;
                    }
                    
                    // Get the corresponding profession type for backend
                    const professionType = providerProfessionMapping[providerType];
                    if (professionType) {
                        // Set the profession type in all hidden inputs
                        document.querySelectorAll('.profession_type').forEach(input => {
                            input.value = professionType;
                        });
                    }

                    // 1. Update Card Active State
                    providerCards.forEach(c => c.classList.remove('active'));
                    this.classList.add('active');

                    // 2. Show Corresponding Registration Form
                    const registrationForm = document.getElementById(providerType + '-registration');

                    // Hide all registration containers first
                    registrationContainers.forEach(container => {
                        container.classList.remove('active');
                    });

                    // Show the selected one if it exists
                    if (registrationForm) {
                        registrationForm.classList.add('active');

                        // Reset form to step 1 (important for subsequent clicks)
                        const steps = registrationForm.querySelectorAll('.form-step');
                        const indicators = registrationForm.querySelectorAll('.step-indicator');

                        steps.forEach((step, index) => {
                            if (index === 0) {
                                step.classList.add('active');
                            } else {
                                step.classList.remove('active');
                            }
                        });

                        indicators.forEach((indicator, index) => {
                            if (index === 0) {
                                indicator.classList.add('active');
                                indicator.classList.remove('completed');
                            } else {
                                indicator.classList.remove('active', 'completed');
                            }
                        });

                        // Optional: Scroll smoothly to the form
                        registrationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        // Log warning if form container not found
                        console.warn(`Registration form with ID '${providerType}-registration' not found.`);
                    }
                });
            });
        } else {
            console.log("Provider type cards or registration containers not found on this page.");
        }

        // 2. Multi-step Form Navigation
        document.addEventListener('click', function (event) {
            // Handle Next Button
            if (event.target.matches('[data-action="next"]')) {
                const button = event.target;
                const currentStep = button.closest('.form-step');
                const form = button.closest('.registration-form'); // Use registration-form class
                const registrationContainer = button.closest('.registration-container');

                if (!currentStep || !form || !registrationContainer) return;

                const currentStepNumber = parseInt(currentStep.getAttribute('data-step'));
                
                // Validate current step before proceeding
                if (!validateStep(currentStep, currentStepNumber)) {
                    return; // Stop if validation fails
                }
                
                const nextStepNumber = currentStepNumber + 1;
                const nextStep = form.querySelector(`.form-step[data-step="${nextStepNumber}"]`);

                if (nextStep) {
                    currentStep.classList.remove('active');
                    nextStep.classList.add('active');

                    const stepIndicators = registrationContainer.querySelectorAll('.step-indicator');
                    stepIndicators.forEach(indicator => {
                        const indicatorStep = parseInt(indicator.getAttribute('data-step'));
                        if (indicatorStep < nextStepNumber) {
                            indicator.classList.add('completed');
                            indicator.classList.remove('active');
                        } else if (indicatorStep === nextStepNumber) {
                            indicator.classList.add('active');
                            indicator.classList.remove('completed');
                        } else {
                            indicator.classList.remove('active', 'completed');
                        }
                    });
                }
            }

            // Handle Previous Button
            if (event.target.matches('[data-action="prev"]')) {
                const button = event.target;
                const currentStep = button.closest('.form-step');
                const form = button.closest('.registration-form'); // Use registration-form class
                const registrationContainer = button.closest('.registration-container');

                if (!currentStep || !form || !registrationContainer) return;

                const currentStepNumber = parseInt(currentStep.getAttribute('data-step'));
                const prevStepNumber = currentStepNumber - 1;
                const prevStep = form.querySelector(`.form-step[data-step="${prevStepNumber}"]`);

                if (prevStep) {
                    currentStep.classList.remove('active');
                    prevStep.classList.add('active');

                    const stepIndicators = registrationContainer.querySelectorAll('.step-indicator');
                    stepIndicators.forEach(indicator => {
                        const indicatorStep = parseInt(indicator.getAttribute('data-step'));
                        if (indicatorStep < prevStepNumber) {
                            indicator.classList.add('completed');
                            indicator.classList.remove('active');
                        } else if (indicatorStep === prevStepNumber) {
                            indicator.classList.add('active');
                            indicator.classList.remove('completed');
                        } else {
                            indicator.classList.remove('active', 'completed');
                        }
                    });
                }
            }

            // Handle Submit Button - Connect with Backend API
            if (event.target.matches('[data-action="submit"]')) {
                event.preventDefault();
                const button = event.target;
                const registrationContainer = button.closest('.registration-container');
                const form = button.closest('.registration-form');
                
                if (!registrationContainer || !form) return;
                
                // Get provider type from container ID
                const containerIdMatch = registrationContainer.id.match(/^(.+)-registration$/);
                if (!containerIdMatch) {
                    apiUtils.showError('Invalid form configuration');
                    return;
                }
                
                const providerType = containerIdMatch[1];
                
                // Collect form data
                const formData = collectFormData(form, providerType);
                
                // Validate required fields
                if (!validateFormData(formData)) {
                    return; // Error messages shown in validation function
                }
                
                // Show loading state
                apiUtils.showLoading(button, 'Submitting Registration...');
                
                // Submit to backend
                submitRegistration(formData, button, registrationContainer);
            }

            // Handle Cancel Button (Example: Hide form, go back to selection)
            if (event.target.matches('[data-action="cancel"]')) {
                const button = event.target;
                const registrationContainer = button.closest('.registration-container');
                // Example: Hide the form container
                if (registrationContainer) {
                    registrationContainer.classList.remove('active');
                    // Optional: Scroll back to provider selection
                    const providerSelector = document.querySelector('.provider-type-selector');
                    if (providerSelector) {
                        providerSelector.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Optional: Deselect the card
                    providerCards.forEach(c => c.classList.remove('active'));
                }
            }

        }); // End of document click listener for form navigation

        // 3. Availability Grid Initialization (for all forms)
        document.querySelectorAll('.availability-grid').forEach(grid => {
            // Only initialize if it's empty (prevent re-initialization issues)
            if (grid.children.length === 0) {
                const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const times = ['9am-12pm', '1pm-5pm', '6pm-9pm'];

                days.forEach(day => {
                    const dayCol = document.createElement('div');
                    dayCol.className = 'day-column';

                    const dayLabel = document.createElement('div');
                    dayLabel.className = 'day-label';
                    dayLabel.textContent = day;
                    dayCol.appendChild(dayLabel);

                    times.forEach(time => {
                        const timeSlot = document.createElement('div');
                        timeSlot.className = 'time-slot';

                        const label = document.createElement('label');
                        const input = document.createElement('input');
                        input.type = 'checkbox';
                        
                        label.appendChild(input);
                        label.appendChild(document.createTextNode(' ' + time));

                        timeSlot.appendChild(label);
                        dayCol.appendChild(timeSlot);
                    });

                    grid.appendChild(dayCol);
                });
            }
        });
        
        // 4. Emergency Services Toggle (for veterinarian registration)
        const emergencyCheckbox = document.getElementById('emergency_available');
        const emergencyDetails = document.getElementById('emergency_details');
        const emergencyHoursSelect = document.querySelector('select[name="emergency_hours_type"]');
        const customEmergencyHours = document.querySelector('.custom-emergency-hours');
        
        if (emergencyCheckbox && emergencyDetails) {
            emergencyCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    emergencyDetails.style.display = 'block';
                    // Add slide-down animation
                    emergencyDetails.style.maxHeight = '0';
                    emergencyDetails.style.overflow = 'hidden';
                    setTimeout(() => {
                        emergencyDetails.style.transition = 'max-height 0.3s ease';
                        emergencyDetails.style.maxHeight = '500px';
                    }, 10);
                } else {
                    emergencyDetails.style.transition = 'max-height 0.3s ease';
                    emergencyDetails.style.maxHeight = '0';
                    setTimeout(() => {
                        emergencyDetails.style.display = 'none';
                    }, 300);
                }
            });
        }
        
        if (emergencyHoursSelect && customEmergencyHours) {
            emergencyHoursSelect.addEventListener('change', function() {
                if (this.value === 'custom') {
                    customEmergencyHours.style.display = 'block';
                    // Add slide-down animation
                    customEmergencyHours.style.maxHeight = '0';
                    customEmergencyHours.style.overflow = 'hidden';
                    setTimeout(() => {
                        customEmergencyHours.style.transition = 'max-height 0.3s ease';
                        customEmergencyHours.style.maxHeight = '200px';
                    }, 10);
                } else {
                    customEmergencyHours.style.transition = 'max-height 0.3s ease';
                    customEmergencyHours.style.maxHeight = '0';
                    setTimeout(() => {
                        customEmergencyHours.style.display = 'none';
                    }, 300);
                }
            });
        }

        // 4. Profile Image Preview
        document.querySelectorAll('.avatar-upload input[type="file"]').forEach(input => {
            input.addEventListener('change', function(e) {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    const preview = this.previousElementSibling.previousElementSibling.querySelector('img');
                    
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                    }
                    
                    reader.readAsDataURL(this.files[0]);
                }
            });
        });

        // 5. File Upload Preview Logic
        document.querySelectorAll('.document-upload').forEach(fileInput => {
            fileInput.addEventListener('change', function(e) {
                const previewContainerId = this.getAttribute('data-preview');
                const previewContainer = document.getElementById(previewContainerId);
                
                if (!previewContainer) return;
                
                if (this.files && this.files.length > 0) {
                    // Clear existing previews
                    previewContainer.innerHTML = '';
                    
                    Array.from(this.files).forEach((file, index) => {
                        const previewItem = document.createElement('div');
                        previewItem.className = 'preview-item';
                        previewItem.dataset.fileIndex = index;
                        
                        // For image files
                        if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                previewItem.innerHTML = `
                                    <img src="${e.target.result}" alt="${file.name}">
                                    <div class="remove-btn" data-index="${index}">
                                        <i class="fas fa-times"></i>
                                    </div>
                                `;
                            };
                            reader.readAsDataURL(file);
                        } 
                        // For PDF files
                        else if (file.type === 'application/pdf') {
                            previewItem.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8fafc; color: #4A5568;">
                                    <i class="fas fa-file-pdf" style="font-size: 2rem; color: #e53e3e;"></i>
                                </div>
                                <div class="remove-btn" data-index="${index}">
                                    <i class="fas fa-times"></i>
                                </div>
                            `;
                        }
                        // For video files
                        else if (file.type.startsWith('video/')) {
                            previewItem.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8fafc; color: #4A5568;">
                                    <i class="fas fa-file-video" style="font-size: 2rem; color: #3182ce;"></i>
                                </div>
                                <div class="remove-btn" data-index="${index}">
                                    <i class="fas fa-times"></i>
                                </div>
                            `;
                        }
                        // For other file types
                        else {
                            previewItem.innerHTML = `
                                <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8fafc; color: #4A5568;">
                                    <i class="fas fa-file" style="font-size: 2rem;"></i>
                                </div>
                                <div class="remove-btn" data-index="${index}">
                                    <i class="fas fa-times"></i>
                                </div>
                            `;
                        }
                        
                        previewContainer.appendChild(previewItem);
                    });
                    
                    // Show file preview container
                    previewContainer.style.display = 'flex';
                    
                    // Add remove button functionality
                    previewContainer.querySelectorAll('.remove-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const index = parseInt(this.getAttribute('data-index'));
                            // Note: We can't actually remove files from a FileList
                            // This just removes the preview, in a real app you would
                            // need to track which files to exclude when submitting
                            this.closest('.preview-item').remove();
                        });
                    });
                }
            });
        });

        // 6. Pricing Model Toggle
        const pricingModelSelect = document.querySelector('#pricing-model');
        if (pricingModelSelect) {
            // Show the appropriate pricing option when the model is selected
            pricingModelSelect.addEventListener('change', function() {
                // Hide all pricing options
                document.querySelectorAll('.pricing-option').forEach(option => {
                    option.classList.remove('active');
                });
                
                // Show the selected pricing option
                const selectedValue = this.value;
                if (selectedValue) {
                    const targetOption = document.getElementById('pricing-' + selectedValue);
                    if (targetOption) {
                        targetOption.classList.add('active');
                    }
                }
            });
        }

        // --- Testimonials with Auto-Sliding and Animation ---
        const testimonials = document.querySelectorAll('.testimonial');
        const dots = document.querySelectorAll('.testimonial-dots .dot');
        let currentTestimonial = 0;
        let testimonialInterval;

        // Function to show a specific testimonial
        function showTestimonial(index) {
            // Hide all testimonials and dots
            testimonials.forEach(testimonial => testimonial.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            // Show the selected testimonial and dot
            if (testimonials[index]) testimonials[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');

            currentTestimonial = index;
        }

        // Function to show the next testimonial
        function nextTestimonial() {
            let newIndex = currentTestimonial + 1;
            if (newIndex >= testimonials.length) newIndex = 0;
            showTestimonial(newIndex);
            resetTestimonialInterval(); // Reset timer on manual change
        }

        // Function to start the automatic sliding
        function startTestimonialInterval() {
            testimonialInterval = setInterval(nextTestimonial, 5000); // Change every 5 seconds
        }

        // Function to reset the automatic sliding timer
        function resetTestimonialInterval() {
            clearInterval(testimonialInterval);
            startTestimonialInterval();
        }

        // Add click event listeners to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showTestimonial(index);
                resetTestimonialInterval();
            });
        });

        // Add click event listeners to navigation arrows (if they exist)
        const prevBtn = document.querySelector('.testimonial-prev');
        const nextBtn = document.querySelector('.testimonial-next');
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                let newIndex = currentTestimonial - 1;
                if (newIndex < 0) newIndex = testimonials.length - 1;
                showTestimonial(newIndex);
                resetTestimonialInterval();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                nextTestimonial(); // Use the defined next function
            });
        }

        // Optional: Pause slider on hover (good UX)
        const testimonialSlider = document.querySelector('.testimonial-slider');
        if (testimonialSlider) {
            testimonialSlider.addEventListener('mouseenter', () => {
                clearInterval(testimonialInterval);
            });
            testimonialSlider.addEventListener('mouseleave', () => {
                startTestimonialInterval();
            });
        }

        // Start the slider
        if (testimonials.length > 0 && dots.length > 0) {
             startTestimonialInterval();
        }
        
        // Form Submission Handler
        function handleFormSubmission(form, formType) {
            const submitButton = form.querySelector('[data-action="submit"]');
            
            if (submitButton) {
                submitButton.addEventListener('click', async function(e) {
                    e.preventDefault();
                    
                    // Show loading state
                    apiUtils.showLoading(submitButton, 'Registering...');
                    
                    try {
                        // Collect form data
                        const formData = new FormData(form);
                        const data = {};
                        
                        // Convert FormData to object
                        for (let [key, value] of formData.entries()) {
                            data[key] = value;
                        }
                        
                        // Handle checkbox fields
                        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
                        checkboxes.forEach(checkbox => {
                            if (checkbox.name) {
                                data[checkbox.name] = checkbox.checked;
                            }
                        });
                        
                        // Check Terms of Service agreement
                        const termsCheckbox = form.querySelector('input[type="checkbox"][required]');
                        if (!termsCheckbox || !termsCheckbox.checked) {
                            notificationManager.error('📋 Please agree to the Terms of Service and Privacy Policy to continue.', true);
                            throw new Error('Please agree to the Terms of Service and Privacy Policy.');
                        }
                        
                        // Validate required fields
                        const requiredFields = ['first_name', 'last_name', 'email', 'password'];
                        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
                        
                        if (missingFields.length > 0) {
                            throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                        }
                        
                        // Check if profession_type is set (should be set by provider card selection)
                        if (!data.profession_type || data.profession_type.trim() === '') {
                            notificationManager.error('Please select a provider type from the cards above first.', true);
                            throw new Error('Please select a provider type from the cards above first.');
                        }
                        
                        // Validate email
                        if (!apiUtils.validateEmail(data.email)) {
                            notificationManager.error('Please enter a valid email address.');
                            throw new Error('Please enter a valid email address');
                        }
                        
                        // Validate password
                        const passwordValidation = apiUtils.validatePassword(data.password);
                        if (!passwordValidation.valid) {
                            notificationManager.error(passwordValidation.message);
                            throw new Error(passwordValidation.message);
                        }
                        
                        // Submit to API
                        const response = await apiUtils.registerProfessional(data);
                        
                        if (response.success) {
                            // Show success notification with confetti effect
                            notificationManager.success('🎉 Registration successful! Welcome to Furglo Pro!');
                            
                            // Show success message
                            apiUtils.showSuccess('Registration successful! Please check your email for verification.');
                            
                            // Hide form and show success
                            form.closest('.registration-container').style.display = 'none';
                            let successContainer = document.querySelector('.success-container');
                            if (!successContainer) {
                                // Create success container if it doesn't exist
                                successContainer = document.createElement('div');
                                successContainer.className = 'success-container active';
                                successContainer.innerHTML = `
                                    <div class="success-icon">
                                        <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--primary);"></i>
                                    </div>
                                    <h2>Registration Successful!</h2>
                                    <p>Welcome to Furglo Pro! Please check your email for a verification link to activate your account.</p>
                                    <a href="login.html" class="btn btn-primary">Go to Login</a>
                                `;
                                form.closest('.registration-container').parentNode.appendChild(successContainer);
                            } else {
                                successContainer.classList.add('active');
                            }
                            
                            // Redirect to login after 3 seconds
                            setTimeout(() => {
                                window.location.href = 'login.html';
                            }, 3000);
                        }
                    } catch (error) {
                        console.error('Registration error:', error);
                        
                        // Show animated error notification
                        const errorMessage = error.message || 'Registration failed. Please try again.';
                        
                        // Different error types for different messages
                        if (errorMessage.includes('email')) {
                            notificationManager.error('📧 ' + errorMessage, true);
                        } else if (errorMessage.includes('password')) {
                            notificationManager.error('🔒 ' + errorMessage, true);
                        } else if (errorMessage.includes('provider type')) {
                            notificationManager.error('⚠️ ' + errorMessage, true);
                        } else if (errorMessage.includes('required fields')) {
                            notificationManager.error('📋 ' + errorMessage, true);
                        } else {
                            notificationManager.error('⚠️ ' + errorMessage);
                        }
                        
                        apiUtils.showError(errorMessage);
                    } finally {
                        apiUtils.hideLoading(submitButton);
                    }
                });
            }
        }
        
        // Initialize form handlers for all registration forms
        document.querySelectorAll('.registration-form').forEach(form => {
            const container = form.closest('.registration-container');
            const formType = container ? container.id.replace('-registration', '') : 'unknown';
            handleFormSubmission(form, formType);
        });
        
        // Google Sign-up handlers
        document.querySelectorAll('.google-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                apiUtils.showLoading(this, 'Redirecting...');
                apiUtils.handleGoogleAuth('professional');
            });
        });
        
        // Enhanced Notification System
        class NotificationManager {
            constructor() {
                this.container = document.getElementById('messageContainer');
                this.notifications = [];
            }
            
            show(message, type = 'info', duration = 5000, critical = false) {
                const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                // Create notification element
                const notification = document.createElement('div');
                notification.className = `message-item ${type} ${critical ? 'critical' : ''}`;
                notification.id = id;
                
                // Choose icon based on type
                let icon = '';
                switch (type) {
                    case 'error':
                        icon = '<i class="fas fa-exclamation-triangle"></i>';
                        break;
                    case 'success':
                        icon = '<i class="fas fa-check-circle"></i>';
                        break;
                    case 'warning':
                        icon = '<i class="fas fa-exclamation-circle"></i>';
                        break;
                    case 'info':
                    default:
                        icon = '<i class="fas fa-info-circle"></i>';
                        break;
                }
                
                notification.innerHTML = `
                    <div class="message-icon">${icon}</div>
                    <div class="message-content">${message}</div>
                    <button class="message-close" onclick="notificationManager.hide('${id}')">
                        <i class="fas fa-times"></i>
                    </button>
                    ${duration > 0 ? '<div class="message-progress"></div>' : ''}
                `;
                
                // Add to container
                this.container.appendChild(notification);
                this.notifications.push({ id, element: notification, timeout: null });
                
                // Trigger show animation
                setTimeout(() => {
                    notification.classList.add('show');
                }, 100);
                
                // Auto-hide if duration is set
                if (duration > 0) {
                    const timeout = setTimeout(() => {
                        this.hide(id);
                    }, duration);
                    
                    // Update notification object with timeout
                    const notif = this.notifications.find(n => n.id === id);
                    if (notif) notif.timeout = timeout;
                }
                
                return id;
            }
            
            hide(id) {
                const notificationObj = this.notifications.find(n => n.id === id);
                if (!notificationObj) return;
                
                const { element, timeout } = notificationObj;
                
                // Clear timeout if exists
                if (timeout) {
                    clearTimeout(timeout);
                }
                
                // Hide animation
                element.classList.add('hide');
                element.classList.remove('show');
                
                // Remove from DOM after animation
                setTimeout(() => {
                    if (element.parentNode) {
                        element.parentNode.removeChild(element);
                    }
                    // Remove from notifications array
                    this.notifications = this.notifications.filter(n => n.id !== id);
                }, 400);
            }
            
            hideAll() {
                this.notifications.forEach(notification => {
                    this.hide(notification.id);
                });
            }
            
            // Convenience methods
            error(message, critical = false) {
                return this.show(message, 'error', 5000, critical);
            }
            
            success(message) {
                return this.show(message, 'success', 4000);
            }
            
            warning(message) {
                return this.show(message, 'warning', 4000);
            }
            
            info(message) {
                return this.show(message, 'info', 3000);
            }
        }
        
        // Initialize notification manager
        const notificationManager = new NotificationManager();
        
        // Override API Utils methods to use enhanced notifications
        if (typeof apiUtils !== 'undefined') {
            // Save original methods
            const originalShowError = apiUtils.showError;
            const originalShowSuccess = apiUtils.showSuccess;
            
            // Override with enhanced versions
            apiUtils.showError = function(message, elementId = 'error-message') {
                notificationManager.error(message);
                
                // Also show in-form error if element exists
                const errorElement = document.getElementById(elementId);
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.classList.add('show');
                    setTimeout(() => {
                        errorElement.classList.remove('show');
                    }, 5000);
                }
            };
            
            apiUtils.showSuccess = function(message, elementId = 'success-message') {
                notificationManager.success(message);
                
                // Also show in-form success if element exists
                const successElement = document.getElementById(elementId);
                if (successElement) {
                    successElement.textContent = message;
                    successElement.classList.add('show');
                    setTimeout(() => {
                        successElement.classList.remove('show');
                    }, 4000);
                }
            };
        }
    });