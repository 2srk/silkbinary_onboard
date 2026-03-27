import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ArrowRight, ArrowLeft, Loader2, CheckCircle2, Check, X, Upload,
    Eye, EyeOff, Building2, Stethoscope, FileText, Mail, Phone, MapPin,
    User, Lock, Shield, AlertCircle, Briefcase, ClipboardList, File, Trash2, Plus, CreditCard,
    Heart, Sparkles, Star, Award, Clock, Calendar
} from 'lucide-react';

// --- Design System Colors ---
const colors = {
    primary: {
        main: '#2B5B4D',
        dark: '#1f4439',
        accent: '#3D7A68',
        light: '#AEC2BA'
    },
    background: {
        base: '#F9F8F6',
        surface: '#FFFFFF',
        subtle: '#F3F4F2'
    },
    text: {
        primary: '#1C2321',
        secondary: '#4A5552',
        muted: '#73807B',
        inverse: '#FFFFFF'
    },
    border: '#E2E8E4',
    semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6'
    }
};

// --- Onboarding Configuration ---
const ONBOARDING_CONFIG = {
    "plan_selection": {
        "question": "Which plan are you signing up for?",
        "type": "url_param",
        "options": {
            "seed": { "name": "Seed Plan", "price": 999, "max_doctors": 1, "description": "Perfect for solo practitioners", "icon": "🌱" },
            "bamboo": { "name": "Bamboo Plan", "price": 1499, "max_doctors": 3, "description": "Ideal for small clinics", "icon": "🎋", "popular": true },
            "banyan": { "name": "Banyan Plan", "price": 2499, "max_doctors": 5, "description": "For growing practices", "icon": "🌳" }
        }
    },
    "steps": [
        {
            "step": 1, "title": "Clinic Information", "icon": Building2,
            "fields": [
                { "id": "clinicName", "question": "Name of the Clinic", "type": "text", "placeholder": "e.g., City Care Medical Center", "required": true },
                { "id": "clinicType", "question": "Type of Clinic", "type": "select", "options": ["General Clinic", "Multi-Specialty Clinic", "Dental Clinic", "Orthopedic Clinic", "Pediatric Clinic", "Gynecology Clinic", "ENT Clinic", "Ayurveda Clinic", "Homeopathy Clinic", "Physiotherapy Center", "Diagnostic Center", "Other"], "required": true },
                { "id": "otherClinicType", "question": "Please specify clinic type", "type": "text", "conditional": { "depends_on": "clinicType", "value": "Other" }, "required": true }
            ]
        },
        {
            "step": 2, "title": "Doctor Information", "icon": Stethoscope,
            "description": "Based on your selected plan, you can add up to {max_doctors} doctor(s)",
            "dynamic_fields": true,
            "max_entries": "{plan.max_doctors}",
            "fields": [
                { "id": "doctorName", "question": "Doctor's Name", "type": "text", "placeholder": "Full name as per medical registration", "required": true },
                { "id": "doctorSpecialty", "question": "Specialty", "type": "select", "options": ["General Physician", "Cardiologist", "Dermatologist", "ENT Specialist", "Gynecologist", "Neurologist", "Orthopedic Surgeon", "Pediatrician", "Psychiatrist", "Radiologist", "Dentist", "Physiotherapist", "Ayurvedic Doctor", "Homeopathic Doctor", "Other"], "required": true },
                { "id": "doctorPhone", "question": "Doctor's Phone Number", "type": "tel", "placeholder": "10-digit mobile number", "required": true },
                { "id": "doctorRegistrationFile", "question": "Registration Certificate", "type": "file", "accept": ".pdf,.jpg,.jpeg,.png", "max_size": "10MB", "required": true, "help_text": "Medical Council registration certificate" }
            ]
        },
        {
            "step": 3, "title": "Business Information", "icon": Briefcase,
            "fields": [
                { "id": "businessName", "question": "Business / Clinic Name", "type": "text", "placeholder": "Legal name of the business entity", "required": true },
                { "id": "businessPhone", "question": "Phone Number", "type": "tel", "placeholder": "10-digit mobile number", "required": true },
                { "id": "businessEmail", "question": "Email Address", "type": "email", "placeholder": "clinic@example.com", "required": true },
                { "id": "businessAddress", "question": "Address", "type": "textarea", "rows": 3, "placeholder": "Full address with city, state, pin code", "required": true },
                { "id": "businessProofType", "question": "Business Proof Type", "type": "select", "options": ["PAN Card", "GST Certificate", "Trade License", "Shop & Establishment Certificate", "Partnership Deed", "Company Incorporation Certificate"], "required": true },
                { "id": "businessProofFile", "question": "Upload Business Proof", "type": "file", "accept": ".pdf,.jpg,.jpeg,.png", "max_size": "10MB", "required": true, "help_text": "PAN Card, GST Certificate, Trade License" }
            ]
        },
        {
            "step": 4, "title": "Clinic Verification", "icon": Shield,
            "fields": [
                { "id": "clinicProofType", "question": "Document Type", "type": "select", "options": ["Clinic Registration Certificate", "Trade License / Shop & Establishment License", "Electricity Bill", "Rent Agreement", "Property Tax Receipt"], "required": true },
                { "id": "clinicProofFile", "question": "Upload Document", "type": "file", "accept": ".pdf,.jpg,.jpeg,.png", "max_size": "10MB", "required": true }
            ]
        },
        {
            "step": 5, "title": "Review", "icon": ClipboardList,
            "review_only": true
        },
        {
            "step": 6, "title": "Account Setup", "icon": Lock,
            "account_setup": true
        }
    ],
    "post_submission": {
        "success_message": "Application Submitted Successfully!",
        "description": "Your documents will be verified within 1-3 business days.",
        "next_steps": [
            "Complete payment to activate your account",
            "Check your email for verification link",
            "Check your SMS for OTP verification code",
            "Your account will be activated upon successful verification"
        ],
        "api_endpoint": "https://api.silkbinary.com/api/onboarding/saas/medesk",
        "method": "POST",
        "content_type": "multipart/form-data"
    },
    "validation_rules": {
        "phone": { "pattern": "^[6-9]\\d{9}$", "message": "Please enter a valid 10-digit Indian mobile number" },
        "email": { "pattern": "^[^\\s@]+@([^\\s@]+\\.)+[^\\s@]+$", "message": "Please enter a valid email address" },
        "file_size": { "max": 10485760, "message": "File size must be less than 10MB" },
        "file_types": { "allowed": [".pdf", ".jpg", ".jpeg", ".png"], "message": "Only PDF, JPG, JPEG, and PNG files are allowed" }
    }
};

// Helper: Format file size
const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Password Strength Calculator
const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 4);
};

const getStrengthLabel = (strength) => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    const colors = ['#EF4444', '#F59E0B', '#FBBF24', '#10B981', '#2B5B4D'];
    return { label: labels[strength], color: colors[strength] };
};

// File Upload Component
const FileUpload = ({ label, file, onFileChange, error, helpText, accept = ".pdf,.jpg,.jpeg,.png", required, maxSize = 10 }) => {
    const inputRef = useRef(null);
    const maxSizeBytes = maxSize * 1024 * 1024;

    const handleFileSelect = (selectedFile) => {
        if (selectedFile && selectedFile.size > maxSizeBytes) {
            alert(`File size exceeds ${maxSize}MB limit. Please select a smaller file.`);
            return;
        }
        onFileChange(selectedFile);
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-text-secondary">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`border ${error ? 'border-red-500 bg-red-50' : 'border-border bg-background-subtle'} hover:border-primary-main transition-all cursor-pointer rounded-sm`}
            >
                {file ? (
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                            <File className="w-5 h-5 text-text-muted" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-body text-text-primary truncate">{file.name}</p>
                                <p className="text-xs text-text-muted">{formatBytes(file.size)}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                            className="p-1 hover:bg-gray-100 transition-colors rounded-sm"
                        >
                            <X className="w-4 h-4 text-text-muted" />
                        </button>
                    </div>
                ) : (
                    <div className="p-6 text-center">
                        <Upload className="w-8 h-8 text-text-muted mx-auto mb-2" />
                        <p className="text-xs font-body text-text-secondary uppercase tracking-wider">Click to upload</p>
                        <p className="text-[10px] text-text-muted mt-1">PDF, JPG, PNG up to {maxSize}MB</p>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => handleFileSelect(e.target.files[0] || null)}
                    className="hidden"
                />
            </div>
            {helpText && <p className="text-[10px] text-text-muted">{helpText}</p>}
            {error && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{error}</p>}
        </div>
    );
};

// Step Indicator
const StepIndicator = ({ currentStep, steps, setStep }) => {
    const stepIcons = [Star, Building2, Stethoscope, Briefcase, Shield, ClipboardList, Lock];

    return (
        <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto mb-12">
            {steps.map((step, idx) => {
                const stepNumber = idx + 1;
                const isActive = currentStep === stepNumber;
                const isPast = currentStep > stepNumber;
                const Icon = stepIcons[stepNumber] || Check;

                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center relative">
                            <button
                                onClick={() => isPast && setStep(stepNumber)}
                                disabled={!isPast}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    isActive ? 'bg-primary-main text-white shadow-sm' :
                                        isPast ? 'bg-primary-light/30 text-primary-main cursor-pointer hover:bg-primary-light/50' :
                                            'bg-background-subtle text-text-muted cursor-not-allowed'
                                }`}
                            >
                                {isPast ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </button>
                            <span className={`absolute top-12 text-xs font-body whitespace-nowrap ${isActive ? 'text-primary-main font-medium' : 'text-text-muted'}`}>
                                {step}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-[1px] mx-4 transition-all ${currentStep > stepNumber ? 'bg-primary-main' : 'bg-border'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

// Main Component
export default function MedeskOnboarding() {
    const steps = ["Plan", "Clinic", "Doctors", "Business", "Verification", "Review", "Account"];
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPlanKey, setSelectedPlanKey] = useState(null);
    const [formData, setFormData] = useState({
        clinicName: '', clinicType: '', otherClinicType: '',
        doctors: [],
        businessName: '', businessPhone: '', businessEmail: '', businessAddress: '', businessProofType: '',
        clinicProofType: '',
    });
    const [doctorFiles, setDoctorFiles] = useState({});
    const [businessProofFile, setBusinessProofFile] = useState(null);
    const [clinicProofFile, setClinicProofFile] = useState(null);
    const [accountName, setAccountName] = useState('');
    const [accountPassword, setAccountPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState(null);

    const selectedPlan = selectedPlanKey ? ONBOARDING_CONFIG.plan_selection.options[selectedPlanKey] : null;
    const maxDoctors = selectedPlan ? selectedPlan.max_doctors : 1;
    const planPrice = selectedPlan ? selectedPlan.price : 0;

    // URL param handling - skip plan selection if plan is provided
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const planFromUrl = params.get('plan');
        if (planFromUrl && ONBOARDING_CONFIG.plan_selection.options[planFromUrl]) {
            setSelectedPlanKey(planFromUrl);
            // Skip plan selection step, go directly to clinic information
            setCurrentStep(2);
        }
    }, []);

    // Initialize doctors when plan is selected
    useEffect(() => {
        if (selectedPlanKey && formData.doctors.length === 0) {
            setFormData(prev => ({ ...prev, doctors: [] }));
        }
    }, [selectedPlanKey]);

    const addDoctor = () => {
        if (formData.doctors.length < maxDoctors) {
            setFormData(prev => ({
                ...prev,
                doctors: [...prev.doctors, { doctorName: '', doctorSpecialty: '', doctorPhone: '', id: Date.now() }]
            }));
        }
    };

    const updateDoctor = (idx, field, value) => {
        const updated = [...formData.doctors];
        updated[idx] = { ...updated[idx], [field]: value };
        setFormData(prev => ({ ...prev, doctors: updated }));
    };

    const removeDoctor = (idx) => {
        const updated = formData.doctors.filter((_, i) => i !== idx);
        setFormData(prev => ({ ...prev, doctors: updated }));
        setDoctorFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[idx];
            return newFiles;
        });
    };

    const handleFieldChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
        if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
    };

    const validatePhone = (phone) => {
        const regex = new RegExp(ONBOARDING_CONFIG.validation_rules.phone.pattern);
        return regex.test(phone);
    };

    const validateEmail = (email) => {
        const regex = new RegExp(ONBOARDING_CONFIG.validation_rules.email.pattern);
        return regex.test(email);
    };

    const validateFile = (file) => {
        if (!file) return false;
        const maxSize = ONBOARDING_CONFIG.validation_rules.file_size.max;
        const allowedTypes = ONBOARDING_CONFIG.validation_rules.file_types.allowed;
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (file.size > maxSize) return false;
        if (!allowedTypes.includes(ext)) return false;
        return true;
    };

    const passwordStrength = calculatePasswordStrength(accountPassword);
    const strengthInfo = getStrengthLabel(passwordStrength);

    const validateStep = useCallback(() => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!selectedPlanKey) newErrors.plan = 'Please select a plan';
        }
        else if (currentStep === 2) {
            if (!formData.clinicName?.trim()) newErrors.clinicName = 'Clinic name required';
            if (!formData.clinicType) newErrors.clinicType = 'Select clinic type';
            if (formData.clinicType === 'Other' && !formData.otherClinicType?.trim()) {
                newErrors.otherClinicType = 'Please specify clinic type';
            }
        }
        else if (currentStep === 3) {
            if (formData.doctors.length === 0) newErrors.doctorsEmpty = 'Add at least one doctor';
            for (let i = 0; i < formData.doctors.length; i++) {
                const doc = formData.doctors[i];
                if (!doc.doctorName?.trim()) newErrors[`doctor_${i}_name`] = 'Doctor name required';
                if (!doc.doctorSpecialty) newErrors[`doctor_${i}_specialty`] = 'Specialty required';
                if (!doc.doctorPhone?.trim()) newErrors[`doctor_${i}_phone`] = 'Phone number required';
                else if (!validatePhone(doc.doctorPhone)) newErrors[`doctor_${i}_phone`] = 'Enter valid 10-digit mobile number';
                if (!doctorFiles[i]) newErrors[`doctor_${i}_file`] = 'Registration certificate required';
                else if (!validateFile(doctorFiles[i])) newErrors[`doctor_${i}_file`] = 'File must be <10MB, PDF/JPG/PNG';
            }
        }
        else if (currentStep === 4) {
            if (!formData.businessName?.trim()) newErrors.businessName = 'Business name required';
            if (!formData.businessPhone?.trim()) newErrors.businessPhone = 'Phone number required';
            else if (!validatePhone(formData.businessPhone)) newErrors.businessPhone = 'Enter valid 10-digit mobile number';
            if (!formData.businessEmail?.trim()) newErrors.businessEmail = 'Email required';
            else if (!validateEmail(formData.businessEmail)) newErrors.businessEmail = 'Enter valid email address';
            if (!formData.businessAddress?.trim()) newErrors.businessAddress = 'Address required';
            if (!formData.businessProofType) newErrors.businessProofType = 'Select proof type';
            if (!businessProofFile) newErrors.businessProofFile = 'Business proof required';
            else if (!validateFile(businessProofFile)) newErrors.businessProofFile = 'File must be <10MB, PDF/JPG/PNG';
        }
        else if (currentStep === 5) {
            if (!formData.clinicProofType) newErrors.clinicProofType = 'Select document type';
            if (!clinicProofFile) newErrors.clinicProofFile = 'Document upload required';
            else if (!validateFile(clinicProofFile)) newErrors.clinicProofFile = 'File must be <10MB, PDF/JPG/PNG';
        }
        else if (currentStep === 7) {
            if (!accountName?.trim()) newErrors.accountName = 'Full name is required';
            if (!accountPassword) newErrors.accountPassword = 'Password is required';
            else if (accountPassword.length < 8) newErrors.accountPassword = 'Password must be at least 8 characters';
            if (accountPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [currentStep, selectedPlanKey, formData, doctorFiles, businessProofFile, clinicProofFile, accountPassword, confirmPassword, accountName]);

    const nextStep = () => {
        if (validateStep()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentStep(prev => prev - 1);
    };

    const prepareFormDataForApi = () => {
        const fd = new FormData();

        fd.append('plan', selectedPlanKey);
        fd.append('clinicName', formData.clinicName);
        fd.append('clinicType', formData.clinicType === 'Other' ? formData.otherClinicType : formData.clinicType);
        fd.append('businessName', formData.businessName);
        fd.append('businessPhone', formData.businessPhone);
        fd.append('businessEmail', formData.businessEmail);
        fd.append('businessAddress', formData.businessAddress);
        fd.append('businessProofType', formData.businessProofType);
        fd.append('clinicProofType', formData.clinicProofType);
        fd.append('accountName', accountName);
        fd.append('password', accountPassword);
        fd.append('isLogin', 'false');

        if (businessProofFile) fd.append('businessProofFile', businessProofFile);
        if (clinicProofFile) fd.append('clinicProofFile', clinicProofFile);

        const doctorsData = formData.doctors.map(doc => ({
            name: doc.doctorName,
            specialty: doc.doctorSpecialty,
            phone: doc.doctorPhone
        }));
        fd.append('doctors', JSON.stringify(doctorsData));

        formData.doctors.forEach((doc, idx) => {
            if (doctorFiles[idx]) {
                fd.append(`doctors_${idx}_certificate`, doctorFiles[idx]);
            }
        });

        return fd;
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setIsSubmitting(true);
        setServerMessage(null);

        try {
            const payload = prepareFormDataForApi();

            const response = await fetch(ONBOARDING_CONFIG.post_submission.api_endpoint, {
                method: 'POST',
                body: payload,
            });

            const data = await response.json();

            if (response.ok) {
                if (data.orderId) {
                    const pendingOrder = {
                        orderId: data.orderId,
                        plan: selectedPlanKey,
                        clinicName: formData.clinicName,
                        amount: planPrice,
                        currency: 'INR',
                        timestamp: Date.now(),
                        checkoutUrl: data.checkoutUrl || data.redirect_url,
                        service_type: 'medesk'
                    };
                    localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
                }

                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    setSubmitSuccess(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } else {
                setServerMessage(data.message || 'Submission failed. Please check your information and try again.');
            }
        } catch (err) {
            console.error('[Medesk] Submission error:', err);
            setServerMessage('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Plan Selection Render
    const renderPlanSelection = () => (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/20 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-primary-main" />
                    <span className="text-xs font-medium text-primary-main uppercase tracking-wider">Choose your plan</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif text-text-primary mb-4">Simple, transparent pricing</h1>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">Select the perfect plan for your practice. All plans include core features and dedicated support.</p>
            </div>

            {errors.plan && <p className="text-red-500 text-sm text-center mb-6">{errors.plan}</p>}

            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(ONBOARDING_CONFIG.plan_selection.options).map(([key, plan]) => {
                    const isSelected = selectedPlanKey === key;
                    return (
                        <div
                            key={key}
                            onClick={() => setSelectedPlanKey(key)}
                            className={`relative rounded-sm border transition-all cursor-pointer p-6 ${
                                isSelected ? 'border-primary-main bg-white shadow-sm' : 'border-border bg-white hover:border-primary-light'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-main text-white text-xs px-3 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            <div className="text-center mb-4">
                                <span className="text-4xl mb-2 block">{plan.icon}</span>
                                <h3 className="text-xl font-serif font-medium text-text-primary">{plan.name}</h3>
                                <p className="text-sm text-text-muted mt-1">{plan.description}</p>
                            </div>
                            <div className="text-center mb-4">
                                <span className="text-3xl font-bold text-text-primary">₹{plan.price}</span>
                                <span className="text-text-muted">/year</span>
                            </div>
                            <div className="text-center text-sm text-text-secondary mb-6">
                                Up to {plan.max_doctors} doctor{plan.max_doctors > 1 ? 's' : ''}
                            </div>
                            <button
                                className={`w-full py-3 text-center font-medium transition-all rounded-sm ${
                                    isSelected
                                        ? 'bg-primary-main text-white'
                                        : 'border border-primary-main text-primary-main hover:bg-primary-main hover:text-white'
                                }`}
                            >
                                {isSelected ? 'Selected' : 'Select Plan'}
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end mt-10">
                <button onClick={nextStep} disabled={!selectedPlanKey} className="bg-primary-main hover:bg-primary-dark text-white px-8 py-3 font-medium transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    Continue to Clinic <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // Clinic Information Render
    const renderClinicInfo = () => (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex p-3 bg-primary-light/20 rounded-full mb-4">
                    <Building2 className="w-6 h-6 text-primary-main" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-2">Clinic Information</h2>
                <p className="text-text-secondary">Tell us about your practice</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Name of the Clinic <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className={`w-full px-4 py-3 bg-background-subtle border ${errors.clinicName ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`}
                        value={formData.clinicName}
                        onChange={e => handleFieldChange('clinicName', e.target.value)}
                        placeholder="e.g., City Care Medical Center"
                    />
                    {errors.clinicName && <p className="text-red-500 text-xs mt-1">{errors.clinicName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Type of Clinic <span className="text-red-500">*</span></label>
                    <select
                        className={`w-full px-4 py-3 bg-background-subtle border ${errors.clinicType ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`}
                        value={formData.clinicType}
                        onChange={e => handleFieldChange('clinicType', e.target.value)}
                    >
                        <option value="">Select clinic type</option>
                        {ONBOARDING_CONFIG.steps[0].fields.find(f => f.id === 'clinicType').options.map(opt => (<option key={opt}>{opt}</option>))}
                    </select>
                    {errors.clinicType && <p className="text-red-500 text-xs mt-1">{errors.clinicType}</p>}
                </div>

                {formData.clinicType === 'Other' && (
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Please specify clinic type <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className={`w-full px-4 py-3 bg-background-subtle border ${errors.otherClinicType ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`}
                            value={formData.otherClinicType}
                            onChange={e => handleFieldChange('otherClinicType', e.target.value)}
                            placeholder="Enter clinic type"
                        />
                        {errors.otherClinicType && <p className="text-red-500 text-xs mt-1">{errors.otherClinicType}</p>}
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 text-text-secondary hover:text-primary-main transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-primary-main hover:bg-primary-dark text-white px-8 py-3 font-medium transition-all rounded-sm flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
            </div>
        </div>
    );

    // Doctors Render
    const renderDoctors = () => (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex p-3 bg-primary-light/20 rounded-full mb-4">
                    <Stethoscope className="w-6 h-6 text-primary-main" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-2">Doctor Information</h2>
                <p className="text-text-secondary">Based on your selected plan, you can add up to {maxDoctors} doctor(s)</p>
            </div>

            {errors.doctorsEmpty && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 rounded-sm">
                    <AlertCircle className="w-4 h-4" /> {errors.doctorsEmpty}
                </div>
            )}

            <div className="space-y-8">
                {formData.doctors.map((doctor, idx) => (
                    <div key={doctor.id} className="border border-border rounded-sm p-6 relative bg-white">
                        {idx > 0 && (
                            <button onClick={() => removeDoctor(idx)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 transition-colors rounded-sm">
                                <X className="w-4 h-4 text-text-muted" />
                            </button>
                        )}
                        <h3 className="font-medium text-text-primary mb-4">Doctor {idx + 1}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Doctor's Name <span className="text-red-500">*</span></label>
                                <input type="text" className={`w-full px-4 py-3 bg-background-subtle border ${errors[`doctor_${idx}_name`] ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={doctor.doctorName} onChange={e => updateDoctor(idx, 'doctorName', e.target.value)} placeholder="Full name as per medical registration" />
                                {errors[`doctor_${idx}_name`] && <p className="text-red-500 text-xs mt-1">{errors[`doctor_${idx}_name`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Specialty <span className="text-red-500">*</span></label>
                                <select className={`w-full px-4 py-3 bg-background-subtle border ${errors[`doctor_${idx}_specialty`] ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={doctor.doctorSpecialty} onChange={e => updateDoctor(idx, 'doctorSpecialty', e.target.value)}>
                                    <option value="">Select specialty</option>
                                    {ONBOARDING_CONFIG.steps[1].fields.find(f => f.id === 'doctorSpecialty').options.map(opt => (<option key={opt}>{opt}</option>))}
                                </select>
                                {errors[`doctor_${idx}_specialty`] && <p className="text-red-500 text-xs mt-1">{errors[`doctor_${idx}_specialty`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number <span className="text-red-500">*</span></label>
                                <input type="tel" className={`w-full px-4 py-3 bg-background-subtle border ${errors[`doctor_${idx}_phone`] ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={doctor.doctorPhone} onChange={e => updateDoctor(idx, 'doctorPhone', e.target.value)} placeholder="10-digit mobile number" />
                                {errors[`doctor_${idx}_phone`] && <p className="text-red-500 text-xs mt-1">{errors[`doctor_${idx}_phone`]}</p>}
                            </div>

                            <FileUpload
                                label="Registration Certificate"
                                file={doctorFiles[idx]}
                                onFileChange={(file) => setDoctorFiles(prev => ({ ...prev, [idx]: file }))}
                                error={errors[`doctor_${idx}_file`]}
                                helpText="Medical Council registration certificate. Max 10MB, PDF/JPG/PNG"
                                required
                                maxSize={10}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {formData.doctors.length < maxDoctors && (
                <button onClick={addDoctor} className="mt-6 w-full py-4 border-2 border-dashed border-border text-text-secondary hover:text-primary-main hover:border-primary-main transition-all rounded-sm flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add Another Doctor
                </button>
            )}

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 text-text-secondary hover:text-primary-main transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-primary-main hover:bg-primary-dark text-white px-8 py-3 font-medium transition-all rounded-sm flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
            </div>
        </div>
    );

    // Business Render
    const renderBusiness = () => (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex p-3 bg-primary-light/20 rounded-full mb-4">
                    <Briefcase className="w-6 h-6 text-primary-main" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-2">Business Information</h2>
                <p className="text-text-secondary">Legal details for verification</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Business / Clinic Name <span className="text-red-500">*</span></label>
                    <input type="text" className={`w-full px-4 py-3 bg-background-subtle border ${errors.businessName ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={formData.businessName} onChange={e => handleFieldChange('businessName', e.target.value)} placeholder="Legal name of the business entity" />
                    {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number <span className="text-red-500">*</span></label>
                        <input type="tel" className={`w-full px-4 py-3 bg-background-subtle border ${errors.businessPhone ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={formData.businessPhone} onChange={e => handleFieldChange('businessPhone', e.target.value)} placeholder="10-digit mobile number" />
                        {errors.businessPhone && <p className="text-red-500 text-xs mt-1">{errors.businessPhone}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email Address <span className="text-red-500">*</span></label>
                        <input type="email" className={`w-full px-4 py-3 bg-background-subtle border ${errors.businessEmail ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={formData.businessEmail} onChange={e => handleFieldChange('businessEmail', e.target.value)} placeholder="clinic@example.com" />
                        {errors.businessEmail && <p className="text-red-500 text-xs mt-1">{errors.businessEmail}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Address <span className="text-red-500">*</span></label>
                    <textarea rows={3} className={`w-full px-4 py-3 bg-background-subtle border ${errors.businessAddress ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={formData.businessAddress} onChange={e => handleFieldChange('businessAddress', e.target.value)} placeholder="Full address with city, state, pin code" />
                    {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Business Proof Type <span className="text-red-500">*</span></label>
                    <select className={`w-full px-4 py-3 bg-background-subtle border ${errors.businessProofType ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={formData.businessProofType} onChange={e => handleFieldChange('businessProofType', e.target.value)}>
                        <option value="">Select proof type</option>
                        {ONBOARDING_CONFIG.steps[2].fields.find(f => f.id === 'businessProofType').options.map(opt => (<option key={opt}>{opt}</option>))}
                    </select>
                    {errors.businessProofType && <p className="text-red-500 text-xs mt-1">{errors.businessProofType}</p>}
                </div>

                <FileUpload label="Upload Business Proof" file={businessProofFile} onFileChange={setBusinessProofFile} error={errors.businessProofFile} helpText="PAN Card, GST Certificate, Trade License. Max 10MB, PDF/JPG/PNG" required maxSize={10} />
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 text-text-secondary hover:text-primary-main transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-primary-main hover:bg-primary-dark text-white px-8 py-3 font-medium transition-all rounded-sm flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
            </div>
        </div>
    );

    // Clinic Verification Render
    const renderClinicVerification = () => (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex p-3 bg-primary-light/20 rounded-full mb-4">
                    <Shield className="w-6 h-6 text-primary-main" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-2">Clinic Verification</h2>
                <p className="text-text-secondary">Verify your clinic's existence</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Document Type <span className="text-red-500">*</span></label>
                    <select className={`w-full px-4 py-3 bg-background-subtle border ${errors.clinicProofType ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={formData.clinicProofType} onChange={e => handleFieldChange('clinicProofType', e.target.value)}>
                        <option value="">Select document type</option>
                        {ONBOARDING_CONFIG.steps[3].fields.find(f => f.id === 'clinicProofType').options.map(opt => (<option key={opt}>{opt}</option>))}
                    </select>
                    {errors.clinicProofType && <p className="text-red-500 text-xs mt-1">{errors.clinicProofType}</p>}
                </div>

                <FileUpload label="Upload Document" file={clinicProofFile} onFileChange={setClinicProofFile} error={errors.clinicProofFile} helpText="Clinic Registration Certificate, Trade License, etc. Max 10MB, PDF/JPG/PNG" required maxSize={10} />
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 text-text-secondary hover:text-primary-main transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-primary-main hover:bg-primary-dark text-white px-8 py-3 font-medium transition-all rounded-sm flex items-center gap-2">Review & Pay <ArrowRight className="w-4 h-4" /></button>
            </div>
        </div>
    );

    // Review Render
    const renderReview = () => (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex p-3 bg-primary-light/20 rounded-full mb-4">
                    <ClipboardList className="w-6 h-6 text-primary-main" />
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-2">Review Your Application</h2>
                <p className="text-text-secondary">Please review all information before creating your account</p>
            </div>

            {/* Price Summary Card */}
            <div className="mb-8 border border-primary-main bg-primary-main/5 p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-text-primary">Order Summary</h3>
                    <CreditCard className="w-5 h-5 text-primary-main" />
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-text-muted">Total Amount</p>
                        <p className="text-3xl font-bold text-text-primary">₹{planPrice}</p>
                        <p className="text-xs text-text-muted mt-1">{selectedPlan?.name} • Annual Billing</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-muted">Inclusive of all taxes</p>
                        <p className="text-xs text-text-muted">Secure payment via PhonePe/PayPal</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="border border-border rounded-sm p-6 bg-white">
                    <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary-main" /> Clinic Details</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="text-text-muted">Clinic name:</span> {formData.clinicName || '—'}</p>
                        <p><span className="text-text-muted">Clinic type:</span> {formData.clinicType === 'Other' ? formData.otherClinicType : formData.clinicType || '—'}</p>
                    </div>
                </div>

                {formData.doctors.length > 0 && (
                    <div className="border border-border rounded-sm p-6 bg-white">
                        <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-primary-main" /> Doctors ({formData.doctors.length})</h3>
                        <div className="space-y-3">
                            {formData.doctors.map((doc, idx) => (
                                <div key={idx} className="border-b border-border last:border-0 pb-2 last:pb-0">
                                    <p className="font-medium text-text-primary">{doc.doctorName || '—'}</p>
                                    <p className="text-sm text-text-muted">{doc.doctorSpecialty || '—'} • {doc.doctorPhone || '—'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border border-border rounded-sm p-6 bg-white">
                    <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary-main" /> Business Details</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="text-text-muted">Business name:</span> {formData.businessName || '—'}</p>
                        <p><span className="text-text-muted">Contact:</span> {formData.businessPhone || '—'} • {formData.businessEmail || '—'}</p>
                        <p><span className="text-text-muted">Address:</span> {formData.businessAddress || '—'}</p>
                        <p><span className="text-text-muted">Proof type:</span> {formData.businessProofType || '—'}</p>
                    </div>
                </div>

                <div className="border border-border rounded-sm p-6 bg-white">
                    <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary-main" /> Clinic Verification</h3>
                    <p className="text-sm"><span className="text-text-muted">Document type:</span> {formData.clinicProofType || '—'}</p>
                    <p className="text-xs text-text-muted mt-1">Document uploaded: {clinicProofFile ? clinicProofFile.name : '—'}</p>
                </div>
            </div>

            {serverMessage && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2 rounded-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {serverMessage}
                </div>
            )}

            <div className="flex justify-between mt-8">
                <button onClick={prevStep} className="px-6 py-3 text-text-secondary hover:text-primary-main transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-primary-main hover:bg-primary-dark text-white px-8 py-3 font-medium transition-all rounded-sm flex items-center gap-2">
                    Continue to Account Setup <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    // Account Setup Render
    const renderAccountSetup = () => {
        if (submitSuccess) {
            return (
                <div className="max-w-2xl mx-auto text-center">
                    <div className="border border-green-200 bg-green-50 p-8 rounded-sm">
                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-serif text-text-primary mb-2">Payment Initiated!</h2>
                        <p className="text-text-secondary">Your order has been created. Complete payment to activate your account.</p>
                        <div className="mt-6 text-left">
                            <h3 className="font-medium text-text-primary mb-3">Next Steps:</h3>
                            <ul className="space-y-2">
                                {ONBOARDING_CONFIG.post_submission.next_steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <Check className="w-4 h-4 text-green-600 mt-0.5" /> {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex p-3 bg-primary-light/20 rounded-full mb-4">
                        <Lock className="w-6 h-6 text-primary-main" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-2">Create Your Account</h2>
                    <p className="text-text-secondary">Set up your credentials to access the dashboard</p>
                </div>

                <div className="border border-border rounded-sm p-8 bg-white">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Full Name <span className="text-red-500">*</span></label>
                            <input type="text" className={`w-full px-4 py-3 bg-background-subtle border ${errors.accountName ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm`} value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Your full name" />
                            {errors.accountName && <p className="text-red-500 text-xs mt-1">{errors.accountName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} className={`w-full px-4 py-3 bg-background-subtle border ${errors.accountPassword ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm pr-12`} value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder="Create a strong password" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-main">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {accountPassword && (
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-text-muted">Password Strength</span>
                                        <span className="text-xs font-medium" style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                                    </div>
                                    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                                        <div className="h-full transition-all duration-300 rounded-full" style={{ width: `${(passwordStrength + 1) * 20}%`, backgroundColor: strengthInfo.color }} />
                                    </div>
                                    <p className="text-xs text-text-muted mt-2">Use at least 8 characters with uppercase, numbers, and special characters</p>
                                </div>
                            )}
                            {errors.accountPassword && <p className="text-red-500 text-xs mt-1">{errors.accountPassword}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type={showConfirmPassword ? "text" : "password"} className={`w-full px-4 py-3 bg-background-subtle border ${errors.confirmPassword ? 'border-red-500' : 'border-border'} focus:outline-none focus:border-primary-main transition-all rounded-sm pr-12`} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-main">
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <button onClick={prevStep} className="px-6 py-3 text-text-secondary hover:text-primary-main transition-colors flex items-center gap-2">← Back to Review</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary-main hover:bg-primary-dark text-white px-8 py-3 font-medium transition-all rounded-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        {isSubmitting ? "Processing..." : `Pay ₹${planPrice} & Activate`}
                    </button>
                </div>
            </div>
        );
    };

    const stepComponents = {
        1: renderPlanSelection,
        2: renderClinicInfo,
        3: renderDoctors,
        4: renderBusiness,
        5: renderClinicVerification,
        6: renderReview,
        7: renderAccountSetup,
    };

    return (
        <div className="min-h-screen bg-background-base">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <StepIndicator currentStep={currentStep} steps={steps} setStep={setCurrentStep} />
                {stepComponents[currentStep]()}
            </div>
            <footer className="py-8 border-t border-border bg-background-subtle">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm text-text-muted">
                    <p>© 2024 Medesk. Secure healthcare practice management.</p>
                </div>
            </footer>
        </div>
    );
}