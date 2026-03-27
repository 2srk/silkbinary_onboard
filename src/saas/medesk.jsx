import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ArrowRight, Loader2, CheckCircle2, Check, X, Upload,
    Eye, EyeOff, Building2, Stethoscope, Briefcase, Shield, ClipboardList, Lock, File, Plus, CreditCard,
    Activity, CalendarCheck, Users, MessageCircle
} from 'lucide-react';

// ==========================================
// 🎨 BRAND LOGO COMPONENT
// ==========================================
const BrandLogo = ({ theme = 'dark', className = '' }) => {
    const isLight = theme === 'light';
    return (
        <div className={`flex items-center justify-center gap-3 ${className}`}>
            <div className={`w-9 h-9 flex items-center justify-center ${isLight ? 'bg-white text-[#1C2321]' : 'bg-[#2B5B4D] text-[#F9F8F6]'}`}>
                <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
                <span className={`font-serif text-2xl tracking-tight leading-none ${isLight ? 'text-white' : 'text-[#1C2321]'}`}>MeDesk</span>
                <span className={`text-[0.6rem] tracking-[0.15em] font-bold uppercase mt-0.5 ${isLight ? 'text-[#AEC2BA]' : 'text-[#73807B]'}`}>by SilkBinary</span>
            </div>
        </div>
    );
};

// --- Onboarding Configuration ---
const ONBOARDING_CONFIG = {
    "plan_selection": {
        "question": "Which plan are you signing up for?",
        "type": "url_param",
        "options": {
            "seed": { "name": "The Seed Plan", "price": 999, "max_doctors": 1, "description": "Perfect for solo practitioners starting their digital journey.", "features": ["1 Doctor Account", "Up to 500 appointments/mo", "Standard WhatsApp Notifications", "Basic Patient CRM"] },
            "bamboo": { "name": "The Bamboo Plan", "price": 1499, "max_doctors": 3, "description": "For established clinics needing more hands on deck.", "features": ["Up to 3 Doctor Accounts", "Unlimited appointments", "Custom Branding (Web Forms)", "Automated WhatsApp Reminders"], "popular": true },
            "banyan": { "name": "The Banyan Plan", "price": 2499, "max_doctors": 5, "description": "For growing polyclinics needing robust management.", "features": ["Up to 5 Doctor Accounts", "Unlimited appointments", "Custom Branding (Web Forms)", "Custom WhatsApp Number", "Priority Phone Support"] }
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
            <label className="block text-sm font-medium text-[#1C2321] mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`border bg-[#F9F8F6] transition-all cursor-pointer ${error ? 'border-red-500' : 'border-[#E2E8E4] hover:border-[#2B5B4D]'}`}
            >
                {file ? (
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                            <File className="w-6 h-6 text-[#2B5B4D]" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-[#1C2321] truncate">{file.name}</p>
                                <p className="text-xs text-[#73807B]">{formatBytes(file.size)}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                            className="p-2 hover:bg-[#E2E8E4] transition-colors rounded-full"
                        >
                            <X className="w-4 h-4 text-[#4A5552]" />
                        </button>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Upload className="w-8 h-8 text-[#AEC2BA] mx-auto mb-3" />
                        <p className="text-sm font-medium text-[#1C2321] uppercase tracking-wider">Click to upload document</p>
                        <p className="text-xs text-[#73807B] mt-1">PDF, JPG, PNG up to {maxSize}MB</p>
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
            {helpText && <p className="text-xs text-[#73807B] mt-2">{helpText}</p>}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

// Step Indicator
const StepIndicator = ({ currentStep, steps, setStep }) => {
    return (
        <div className="hidden md:block max-w-4xl mx-auto mb-16 relative">
            <div className="absolute top-5 left-0 w-full h-[2px] bg-[#E2E8E4] -z-10"></div>
            <div className="flex items-center justify-between">
                {steps.map((step, idx) => {
                    const stepNumber = idx + 1;
                    const isActive = currentStep === stepNumber;
                    const isPast = currentStep > stepNumber;

                    return (
                        <div key={step} className="flex flex-col items-center">
                            <button
                                onClick={() => isPast && setStep(stepNumber)}
                                disabled={!isPast}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                                    isActive ? 'bg-[#2B5B4D] text-white' :
                                        isPast ? 'bg-[#AEC2BA] text-white cursor-pointer hover:bg-[#2B5B4D]' :
                                            'bg-[#F9F8F6] text-[#73807B] border-2 border-[#E2E8E4] cursor-not-allowed'
                                }`}
                            >
                                {isPast ? <Check className="w-5 h-5" /> : stepNumber}
                            </button>
                            <span className={`mt-3 text-xs font-bold tracking-wider uppercase ${isActive ? 'text-[#1C2321]' : 'text-[#73807B]'}`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Main Component
export default function MedeskOnboarding() {
    const steps = ["Plan", "Clinic", "Doctors", "Business", "Verify", "Review", "Account"];
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const planFromUrl = params.get('plan');
        if (planFromUrl && ONBOARDING_CONFIG.plan_selection.options[planFromUrl]) {
            setSelectedPlanKey(planFromUrl);
            setCurrentStep(2);
        }
    }, []);

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
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="font-serif text-5xl md:text-6xl text-[#1C2321] mb-6">Honest, sustainable pricing.</h1>
                <p className="text-[#4A5552] text-xl max-w-2xl mx-auto font-light">Select the perfect plan for your practice. All plans include core features and dedicated support.</p>
            </div>

            {errors.plan && <p className="text-red-500 text-sm text-center mb-6 font-bold uppercase tracking-widest">{errors.plan}</p>}

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Seed Plan */}
                <div onClick={() => setSelectedPlanKey('seed')} className={`cursor-pointer transition-all border p-10 relative bg-white flex flex-col shadow-sm text-[#1C2321] ${selectedPlanKey === 'seed' ? 'border-[#2B5B4D] ring-2 ring-[#2B5B4D] ring-offset-2' : 'border-[#E2E8E4] hover:border-[#2B5B4D]'}`}>
                    <div className="mb-8">
                        <h3 className="font-serif text-2xl mb-2">{ONBOARDING_CONFIG.plan_selection.options.seed.name}</h3>
                        <p className="text-[#73807B] text-sm h-10">{ONBOARDING_CONFIG.plan_selection.options.seed.description}</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-4xl font-serif">₹{ONBOARDING_CONFIG.plan_selection.options.seed.price}</span>
                        <span className="text-[#73807B]"> / year</span>
                    </div>
                    <ul className="space-y-4 mb-10 text-[#4A5552] flex-grow">
                        {ONBOARDING_CONFIG.plan_selection.options.seed.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-[#2B5B4D] shrink-0" /> {feat}</li>
                        ))}
                    </ul>
                    <div className={`w-full py-4 text-center font-medium transition-colors border mt-auto ${selectedPlanKey === 'seed' ? 'bg-[#2B5B4D] text-white border-[#2B5B4D]' : 'border-[#2B5B4D] text-[#2B5B4D]'}`}>
                        {selectedPlanKey === 'seed' ? 'Selected' : 'Select Seed'}
                    </div>
                </div>

                {/* Bamboo Plan */}
                <div onClick={() => setSelectedPlanKey('bamboo')} className={`cursor-pointer transition-all border p-10 relative bg-[#2B5B4D] text-white shadow-xl flex flex-col z-10 scale-105 ${selectedPlanKey === 'bamboo' ? 'ring-2 ring-[#1C2321] ring-offset-2 border-[#1C2321]' : 'border-[#2B5B4D]'}`}>
                    <div className="absolute top-0 right-0 bg-[#E2E8E4] text-[#1C2321] text-xs font-bold uppercase tracking-widest px-3 py-1">
                        Recommended
                    </div>
                    <div className="mb-8 mt-2">
                        <h3 className="font-serif text-2xl mb-2">{ONBOARDING_CONFIG.plan_selection.options.bamboo.name}</h3>
                        <p className="text-[#AEC2BA] text-sm h-10">{ONBOARDING_CONFIG.plan_selection.options.bamboo.description}</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-4xl font-serif">₹{ONBOARDING_CONFIG.plan_selection.options.bamboo.price}</span>
                        <span className="text-[#AEC2BA]"> / year</span>
                    </div>
                    <ul className="space-y-4 mb-10 text-[#E2E8E4] flex-grow">
                        {ONBOARDING_CONFIG.plan_selection.options.bamboo.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-[#AEC2BA] shrink-0" /> {feat}</li>
                        ))}
                    </ul>
                    <div className={`w-full py-4 text-center font-medium transition-colors mt-auto ${selectedPlanKey === 'bamboo' ? 'bg-[#1C2321] text-white' : 'bg-white text-[#2B5B4D]'}`}>
                        {selectedPlanKey === 'bamboo' ? 'Selected' : 'Select Bamboo'}
                    </div>
                </div>

                {/* Banyan Plan */}
                <div onClick={() => setSelectedPlanKey('banyan')} className={`cursor-pointer transition-all border p-10 relative bg-[#1C2321] text-white shadow-lg flex flex-col ${selectedPlanKey === 'banyan' ? 'ring-2 ring-[#2B5B4D] ring-offset-2 border-[#2B5B4D]' : 'border-[#1C2321]'}`}>
                    <div className="mb-8">
                        <h3 className="font-serif text-2xl mb-2">{ONBOARDING_CONFIG.plan_selection.options.banyan.name}</h3>
                        <p className="text-[#73807B] text-sm h-10">{ONBOARDING_CONFIG.plan_selection.options.banyan.description}</p>
                    </div>
                    <div className="mb-8">
                        <span className="text-4xl font-serif">₹{ONBOARDING_CONFIG.plan_selection.options.banyan.price}</span>
                        <span className="text-[#73807B]"> / year</span>
                    </div>
                    <ul className="space-y-4 mb-10 text-[#E2E8E4] flex-grow">
                        {ONBOARDING_CONFIG.plan_selection.options.banyan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-[#73807B] shrink-0" /> {feat}</li>
                        ))}
                    </ul>
                    <div className={`w-full py-4 text-center font-medium transition-colors border mt-auto ${selectedPlanKey === 'banyan' ? 'bg-white text-[#1C2321] border-white' : 'border-[#73807B] text-[#E2E8E4]'}`}>
                        {selectedPlanKey === 'banyan' ? 'Selected' : 'Select Banyan'}
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-12">
                <button onClick={nextStep} disabled={!selectedPlanKey} className="bg-[#2B5B4D] text-white px-8 py-4 font-medium hover:bg-[#1f4439] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    Continue to Clinic <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );

    // Section Header Helper
    const SectionHeader = ({ icon: Icon, title, subtitle }) => (
        <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#2B5B4D] flex items-center justify-center mb-6 mx-auto">
                <Icon className="text-white w-8 h-8" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1C2321] mb-4">{title}</h2>
            <p className="text-lg text-[#4A5552] font-light max-w-xl mx-auto leading-relaxed">{subtitle}</p>
        </div>
    );

    // Clinic Information Render
    const renderClinicInfo = () => (
        <div className="max-w-3xl mx-auto">
            <SectionHeader icon={Building2} title="Clinic Information" subtitle="Tell us about your practice. This information will be used to customize your front desk experience." />

            <div className="bg-white border border-[#E2E8E4] p-8 md:p-12 shadow-sm">
                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-medium text-[#1C2321] mb-2">Name of the Clinic <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.clinicName ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`}
                            value={formData.clinicName}
                            onChange={e => handleFieldChange('clinicName', e.target.value)}
                            placeholder="e.g., City Care Medical Center"
                        />
                        {errors.clinicName && <p className="text-red-500 text-xs mt-2">{errors.clinicName}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1C2321] mb-2">Type of Clinic <span className="text-red-500">*</span></label>
                        <select
                            className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.clinicType ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`}
                            value={formData.clinicType}
                            onChange={e => handleFieldChange('clinicType', e.target.value)}
                        >
                            <option value="">Select clinic type</option>
                            {ONBOARDING_CONFIG.steps[0].fields.find(f => f.id === 'clinicType').options.map(opt => (<option key={opt}>{opt}</option>))}
                        </select>
                        {errors.clinicType && <p className="text-red-500 text-xs mt-2">{errors.clinicType}</p>}
                    </div>

                    {formData.clinicType === 'Other' && (
                        <div>
                            <label className="block text-sm font-medium text-[#1C2321] mb-2">Please specify clinic type <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.otherClinicType ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`}
                                value={formData.otherClinicType}
                                onChange={e => handleFieldChange('otherClinicType', e.target.value)}
                                placeholder="Enter clinic type"
                            />
                            {errors.otherClinicType && <p className="text-red-500 text-xs mt-2">{errors.otherClinicType}</p>}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center mt-8">
                <button onClick={prevStep} className="px-6 py-4 text-[#4A5552] font-medium hover:text-[#1C2321] transition-colors flex items-center gap-2">
                    ← Back
                </button>
                <button onClick={nextStep} className="bg-[#2B5B4D] text-white px-8 py-4 font-medium hover:bg-[#1f4439] transition-colors flex items-center gap-2">
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );

    // Doctors Render
    const renderDoctors = () => (
        <div className="max-w-4xl mx-auto">
            <SectionHeader icon={Stethoscope} title="Doctor Profiles" subtitle={`Based on the ${selectedPlan?.name}, you can add up to ${maxDoctors} doctor(s) to your account.`} />

            {errors.doctorsEmpty && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                    <X className="w-5 h-5" /> {errors.doctorsEmpty}
                </div>
            )}

            <div className="space-y-8">
                {formData.doctors.map((doctor, idx) => (
                    <div key={doctor.id} className="bg-white border border-[#E2E8E4] p-8 md:p-12 relative shadow-sm">
                        {idx > 0 && (
                            <button onClick={() => removeDoctor(idx)} className="absolute top-6 right-6 p-2 hover:bg-[#E2E8E4] transition-colors rounded-full text-[#4A5552]">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                        <h3 className="font-serif text-2xl text-[#1C2321] mb-8 border-b border-[#E2E8E4] pb-4">Doctor {idx + 1}</h3>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-[#1C2321] mb-2">Doctor's Name <span className="text-red-500">*</span></label>
                                <input type="text" className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors[`doctor_${idx}_name`] ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={doctor.doctorName} onChange={e => updateDoctor(idx, 'doctorName', e.target.value)} placeholder="Full name as per medical registration" />
                                {errors[`doctor_${idx}_name`] && <p className="text-red-500 text-xs mt-2">{errors[`doctor_${idx}_name`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1C2321] mb-2">Specialty <span className="text-red-500">*</span></label>
                                <select className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors[`doctor_${idx}_specialty`] ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={doctor.doctorSpecialty} onChange={e => updateDoctor(idx, 'doctorSpecialty', e.target.value)}>
                                    <option value="">Select specialty</option>
                                    {ONBOARDING_CONFIG.steps[1].fields.find(f => f.id === 'doctorSpecialty').options.map(opt => (<option key={opt}>{opt}</option>))}
                                </select>
                                {errors[`doctor_${idx}_specialty`] && <p className="text-red-500 text-xs mt-2">{errors[`doctor_${idx}_specialty`]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#1C2321] mb-2">Phone Number <span className="text-red-500">*</span></label>
                                <input type="tel" className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors[`doctor_${idx}_phone`] ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={doctor.doctorPhone} onChange={e => updateDoctor(idx, 'doctorPhone', e.target.value)} placeholder="10-digit mobile number" />
                                {errors[`doctor_${idx}_phone`] && <p className="text-red-500 text-xs mt-2">{errors[`doctor_${idx}_phone`]}</p>}
                            </div>
                        </div>

                        <div className="pt-4">
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
                <button onClick={addDoctor} className="mt-8 w-full py-6 border border-dashed border-[#AEC2BA] text-[#4A5552] hover:text-[#2B5B4D] hover:border-[#2B5B4D] transition-colors flex items-center justify-center gap-3 bg-white font-medium">
                    <Plus className="w-5 h-5" /> Add Another Doctor
                </button>
            )}

            <div className="flex justify-between items-center mt-12">
                <button onClick={prevStep} className="px-6 py-4 text-[#4A5552] font-medium hover:text-[#1C2321] transition-colors flex items-center gap-2">
                    ← Back
                </button>
                <button onClick={nextStep} className="bg-[#2B5B4D] text-white px-8 py-4 font-medium hover:bg-[#1f4439] transition-colors flex items-center gap-2">
                    Continue <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );

    // Business Render
    const renderBusiness = () => (
        <div className="max-w-3xl mx-auto">
            <SectionHeader icon={Briefcase} title="Business Verification" subtitle="We need some legal details to verify your entity before establishing the clinic dashboard." />

            <div className="bg-white border border-[#E2E8E4] p-8 md:p-12 shadow-sm">
                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-medium text-[#1C2321] mb-2">Business / Clinic Name <span className="text-red-500">*</span></label>
                        <input type="text" className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.businessName ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={formData.businessName} onChange={e => handleFieldChange('businessName', e.target.value)} placeholder="Legal name of the business entity" />
                        {errors.businessName && <p className="text-red-500 text-xs mt-2">{errors.businessName}</p>}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-[#1C2321] mb-2">Official Phone Number <span className="text-red-500">*</span></label>
                            <input type="tel" className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.businessPhone ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={formData.businessPhone} onChange={e => handleFieldChange('businessPhone', e.target.value)} placeholder="10-digit mobile number" />
                            {errors.businessPhone && <p className="text-red-500 text-xs mt-2">{errors.businessPhone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1C2321] mb-2">Support Email Address <span className="text-red-500">*</span></label>
                            <input type="email" className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.businessEmail ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={formData.businessEmail} onChange={e => handleFieldChange('businessEmail', e.target.value)} placeholder="clinic@example.com" />
                            {errors.businessEmail && <p className="text-red-500 text-xs mt-2">{errors.businessEmail}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#1C2321] mb-2">Complete Address <span className="text-red-500">*</span></label>
                        <textarea rows={3} className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.businessAddress ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={formData.businessAddress} onChange={e => handleFieldChange('businessAddress', e.target.value)} placeholder="Full address with city, state, pin code" />
                        {errors.businessAddress && <p className="text-red-500 text-xs mt-2">{errors.businessAddress}</p>}
                    </div>

                    <div className="pt-4 border-t border-[#E2E8E4]">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#1C2321] mb-2">Business Proof Type <span className="text-red-500">*</span></label>
                            <select className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.businessProofType ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={formData.businessProofType} onChange={e => handleFieldChange('businessProofType', e.target.value)}>
                                <option value="">Select proof type</option>
                                {ONBOARDING_CONFIG.steps[2].fields.find(f => f.id === 'businessProofType').options.map(opt => (<option key={opt}>{opt}</option>))}
                            </select>
                            {errors.businessProofType && <p className="text-red-500 text-xs mt-2">{errors.businessProofType}</p>}
                        </div>

                        <FileUpload label="Upload Business Proof" file={businessProofFile} onFileChange={setBusinessProofFile} error={errors.businessProofFile} helpText="PAN Card, GST Certificate, Trade License. Max 10MB, PDF/JPG/PNG" required maxSize={10} />
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="px-6 py-4 text-[#4A5552] font-medium hover:text-[#1C2321] transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-[#2B5B4D] text-white px-8 py-4 font-medium hover:bg-[#1f4439] transition-colors flex items-center gap-2">Continue <ArrowRight size={18} /></button>
            </div>
        </div>
    );

    // Clinic Verification Render
    const renderClinicVerification = () => (
        <div className="max-w-3xl mx-auto">
            <SectionHeader icon={Shield} title="Clinic Documentation" subtitle="Upload secondary documentation to establish the physical existence of your practice." />

            <div className="bg-white border border-[#E2E8E4] p-8 md:p-12 shadow-sm">
                <div className="space-y-8">
                    <div>
                        <label className="block text-sm font-medium text-[#1C2321] mb-2">Document Type <span className="text-red-500">*</span></label>
                        <select className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.clinicProofType ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={formData.clinicProofType} onChange={e => handleFieldChange('clinicProofType', e.target.value)}>
                            <option value="">Select document type</option>
                            {ONBOARDING_CONFIG.steps[3].fields.find(f => f.id === 'clinicProofType').options.map(opt => (<option key={opt}>{opt}</option>))}
                        </select>
                        {errors.clinicProofType && <p className="text-red-500 text-xs mt-2">{errors.clinicProofType}</p>}
                    </div>

                    <FileUpload label="Upload Document" file={clinicProofFile} onFileChange={setClinicProofFile} error={errors.clinicProofFile} helpText="Clinic Registration Certificate, Trade License, etc. Max 10MB, PDF/JPG/PNG" required maxSize={10} />
                </div>
            </div>

            <div className="flex justify-between mt-12">
                <button onClick={prevStep} className="px-6 py-4 text-[#4A5552] font-medium hover:text-[#1C2321] transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-[#2B5B4D] text-white px-8 py-4 font-medium hover:bg-[#1f4439] transition-colors flex items-center gap-2">Review Application <ArrowRight size={18} /></button>
            </div>
        </div>
    );

    // Review Render
    const renderReview = () => (
        <div className="max-w-4xl mx-auto">
            <SectionHeader icon={ClipboardList} title="Final Review" subtitle="Please ensure all provided details are accurate. Your platform is almost ready." />

            {/* Price Summary Card */}
            <div className="mb-10 border border-[#2B5B4D] bg-[#2B5B4D] text-white p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Activity className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white text-xs font-bold uppercase tracking-widest mb-4">
                            <CreditCard className="w-4 h-4" /> Order Summary
                        </div>
                        <h3 className="font-serif text-3xl mb-1">{selectedPlan?.name}</h3>
                        <p className="text-[#AEC2BA]">Monthly Billing Cycle</p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-sm text-[#AEC2BA] mb-1">Total Subscription Amount</p>
                        <p className="text-4xl font-serif">₹{planPrice}</p>
                        <p className="text-xs text-[#AEC2BA] mt-2">Inclusive of all taxes</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white border border-[#E2E8E4] p-8 shadow-sm h-full">
                    <h3 className="font-serif text-2xl text-[#1C2321] mb-6 border-b border-[#E2E8E4] pb-4 flex items-center gap-3">
                        <Building2 className="text-[#2B5B4D] w-6 h-6" /> Clinic Details
                    </h3>
                    <div className="space-y-4 text-[15px] text-[#4A5552]">
                        <p><strong className="text-[#1C2321] font-medium">Clinic name:</strong><br/>{formData.clinicName || '—'}</p>
                        <p><strong className="text-[#1C2321] font-medium">Clinic type:</strong><br/>{formData.clinicType === 'Other' ? formData.otherClinicType : formData.clinicType || '—'}</p>
                    </div>
                </div>

                <div className="bg-white border border-[#E2E8E4] p-8 shadow-sm h-full">
                    <h3 className="font-serif text-2xl text-[#1C2321] mb-6 border-b border-[#E2E8E4] pb-4 flex items-center gap-3">
                        <Briefcase className="text-[#2B5B4D] w-6 h-6" /> Business Details
                    </h3>
                    <div className="space-y-4 text-[15px] text-[#4A5552]">
                        <p><strong className="text-[#1C2321] font-medium">Business entity:</strong><br/>{formData.businessName || '—'}</p>
                        <p><strong className="text-[#1C2321] font-medium">Contact:</strong><br/>{formData.businessPhone || '—'} <br/> {formData.businessEmail || '—'}</p>
                        <p><strong className="text-[#1C2321] font-medium">Address:</strong><br/>{formData.businessAddress || '—'}</p>
                        <p><strong className="text-[#1C2321] font-medium">Proof provided:</strong><br/>{formData.businessProofType || '—'} & {formData.clinicProofType || '—'}</p>
                    </div>
                </div>
            </div>

            {formData.doctors.length > 0 && (
                <div className="bg-white border border-[#E2E8E4] p-8 shadow-sm mb-8">
                    <h3 className="font-serif text-2xl text-[#1C2321] mb-6 border-b border-[#E2E8E4] pb-4 flex items-center gap-3">
                        <Stethoscope className="text-[#2B5B4D] w-6 h-6" /> Practitioners ({formData.doctors.length})
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        {formData.doctors.map((doc, idx) => (
                            <div key={idx} className="p-4 border border-[#E2E8E4] bg-[#F9F8F6]">
                                <p className="font-serif text-xl text-[#1C2321] mb-1">{doc.doctorName || '—'}</p>
                                <p className="text-sm text-[#4A5552]">{doc.doctorSpecialty || '—'}</p>
                                <p className="text-sm text-[#73807B] mt-2">{doc.doctorPhone || '—'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {serverMessage && (
                <div className="mt-8 p-6 bg-red-50 border border-red-200 text-red-600 flex items-start gap-3">
                    <X className="w-6 h-6 flex-shrink-0" />
                    <p className="font-medium">{serverMessage}</p>
                </div>
            )}

            <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#E2E8E4]">
                <button onClick={prevStep} className="px-6 py-4 text-[#4A5552] font-medium hover:text-[#1C2321] transition-colors flex items-center gap-2">← Back</button>
                <button onClick={nextStep} className="bg-[#1C2321] text-white px-8 py-4 font-medium hover:bg-[#2B5B4D] transition-colors flex items-center gap-2">
                    Continue to Account Setup <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );

    // Account Setup Render
    const renderAccountSetup = () => {
        if (submitSuccess) {
            return (
                <div className="max-w-2xl mx-auto text-center py-12">
                    <div className="bg-white border border-[#E2E8E4] p-12 shadow-sm">
                        <div className="w-20 h-20 bg-[#2B5B4D] rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="font-serif text-4xl text-[#1C2321] mb-4">Payment Initiated!</h2>
                        <p className="text-lg text-[#4A5552] font-light mb-10 leading-relaxed">Your order has been created. Complete payment to activate your command center.</p>

                        <div className="bg-[#F9F8F6] border border-[#E2E8E4] p-8 text-left">
                            <h3 className="font-medium text-[#1C2321] tracking-wide uppercase text-sm mb-6">Next Steps</h3>
                            <ul className="space-y-4">
                                {ONBOARDING_CONFIG.post_submission.next_steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-4 text-[#4A5552]">
                                        <div className="mt-1 bg-[#AEC2BA]/30 p-1 rounded-full"><Check className="w-3 h-3 text-[#2B5B4D]" /></div>
                                        {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-3xl mx-auto">
                <SectionHeader icon={Lock} title="Create Your Account" subtitle="Establish the master credentials for your clinic's dashboard." />

                <div className="bg-white border border-[#E2E8E4] p-8 md:p-12 shadow-sm">
                    <div className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-[#1C2321] mb-2">Administrator Full Name <span className="text-red-500">*</span></label>
                            <input type="text" className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors ${errors.accountName ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Your full name" />
                            {errors.accountName && <p className="text-red-500 text-xs mt-2">{errors.accountName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1C2321] mb-2">Master Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors pr-14 ${errors.accountPassword ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder="Create a formidable password" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#73807B] hover:text-[#1C2321] transition-colors p-2">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {accountPassword && (
                                <div className="mt-4 bg-[#F9F8F6] p-4 border border-[#E2E8E4]">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs uppercase tracking-widest font-bold text-[#4A5552]">Security Strength</span>
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#E2E8E4] overflow-hidden">
                                        <div className="h-full transition-all duration-300" style={{ width: `${(passwordStrength + 1) * 20}%`, backgroundColor: strengthInfo.color }} />
                                    </div>
                                    <p className="text-[11px] text-[#73807B] mt-3 uppercase tracking-wider">Use at least 8 characters with uppercase, numbers, and symbols.</p>
                                </div>
                            )}
                            {errors.accountPassword && <p className="text-red-500 text-xs mt-2">{errors.accountPassword}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#1C2321] mb-2">Confirm Master Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input type={showConfirmPassword ? "text" : "password"} className={`w-full border p-4 bg-[#F9F8F6] focus:outline-none transition-colors pr-14 ${errors.confirmPassword ? 'border-red-500' : 'border-[#E2E8E4] focus:border-[#2B5B4D]'}`} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Verify your password" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#73807B] hover:text-[#1C2321] transition-colors p-2">
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs mt-2">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#E2E8E4]">
                    <button onClick={prevStep} className="px-6 py-4 text-[#4A5552] font-medium hover:text-[#1C2321] transition-colors flex items-center gap-2">← Back to Review</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#2B5B4D] text-white px-8 py-4 font-medium hover:bg-[#1f4439] transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
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
        <div className="min-h-screen bg-[#F9F8F6] text-[#1C2321] font-sans selection:bg-[#2B5B4D] selection:text-white flex flex-col">
            <div className="pt-16 pb-8 text-center">
                <BrandLogo theme="dark" className="opacity-80 scale-90 mb-6" />
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-6 w-full pb-24">
                <StepIndicator currentStep={currentStep} steps={steps} setStep={setCurrentStep} />
                {stepComponents[currentStep]()}
            </main>

            <footer className="py-8 border-t border-[#E2E8E4] bg-white mt-auto">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#73807B]">
                    <p>© {new Date().getFullYear()} MeDesk by SilkBinary. All rights reserved.</p>
                    <p className="mt-2 md:mt-0 uppercase tracking-widest font-bold">MEDESK</p>
                </div>
            </footer>
        </div>
    );
}