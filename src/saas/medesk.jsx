import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ArrowRight, ArrowLeft, Loader2, CheckCircle2, Check, X, Upload,
    Eye, EyeOff, Building2, Stethoscope, FileText, Mail, Phone, MapPin,
    User, Lock, Shield, AlertCircle, Briefcase, ClipboardList, File, Trash2, Plus, Globe
} from 'lucide-react';

// --- Onboarding Configuration ---
const ONBOARDING_CONFIG = {
    "plan_selection": {
        "question": "Which plan are you signing up for?",
        "type": "url_param",
        "options": {
            "seed": { "name": "Seed Plan", "price": 999, "max_doctors": 1 },
            "bamboo": { "name": "Bamboo Plan", "price": 1499, "max_doctors": 3 },
            "banyan": { "name": "Banyan Plan", "price": 2499, "max_doctors": 5 }
        }
    },
    "steps": [
        {
            "step": 1, "title": "Clinic Information",
            "fields": [
                { "id": "clinicName", "question": "Name of the Clinic", "type": "text", "placeholder": "e.g., City Care Medical Center", "required": true },
                { "id": "clinicType", "question": "Type of Clinic", "type": "select", "options": ["General Clinic", "Multi-Specialty Clinic", "Dental Clinic", "Orthopedic Clinic", "Pediatric Clinic", "Gynecology Clinic", "ENT Clinic", "Ayurveda Clinic", "Homeopathy Clinic", "Physiotherapy Center", "Diagnostic Center", "Other"], "required": true },
                { "id": "otherClinicType", "question": "Please specify clinic type", "type": "text", "conditional": { "depends_on": "clinicType", "value": "Other" }, "required": true }
            ]
        },
        {
            "step": 2, "title": "Doctor Information",
            "description": "Based on your selected plan, you can add up to {max_doctors} doctor(s)",
            "dynamic_fields": true, "max_entries": "{plan.max_doctors}",
            "fields": [
                { "id": "doctorName", "question": "Doctor's Name", "type": "text", "placeholder": "Full name as per medical registration", "required": true },
                { "id": "doctorSpecialty", "question": "Specialty", "type": "select", "options": ["General Physician", "Cardiologist", "Dermatologist", "ENT Specialist", "Gynecologist", "Neurologist", "Orthopedic Surgeon", "Pediatrician", "Psychiatrist", "Radiologist", "Dentist", "Physiotherapist", "Ayurvedic Doctor", "Homeopathic Doctor", "Other"], "required": true },
                { "id": "doctorPhone", "question": "Doctor's Phone Number", "type": "tel", "placeholder": "10-digit mobile number", "required": true },
                { "id": "doctorRegistrationFile", "question": "Doctor's Registration Certificate", "type": "file", "accept": ".pdf,.jpg,.jpeg,.png", "max_size": "10MB", "required": true, "help_text": "Medical Council registration, state registration, or relevant council certificate." }
            ]
        },
        {
            "step": 3, "title": "Business Information",
            "fields": [
                { "id": "businessName", "question": "Business / Clinic Name", "type": "text", "placeholder": "Legal name of the business entity", "required": true },
                { "id": "businessPhone", "question": "Phone Number", "type": "tel", "placeholder": "10-digit mobile number", "required": true },
                { "id": "businessEmail", "question": "Email Address", "type": "email", "placeholder": "clinic@example.com", "required": true },
                { "id": "businessAddress", "question": "Address", "type": "textarea", "rows": 3, "placeholder": "Full address with city, state, pin code", "required": true },
                { "id": "businessProofType", "question": "Business Proof Type", "type": "select", "options": ["PAN Card", "GST Certificate", "Trade License", "Shop & Establishment Certificate", "Partnership Deed", "Company Incorporation Certificate"], "required": true },
                { "id": "businessProofFile", "question": "Upload Business Proof", "type": "file", "accept": ".pdf,.jpg,.jpeg,.png", "max_size": "10MB", "required": true, "help_text": "PAN Card, GST Certificate, Trade License, etc." }
            ]
        },
        {
            "step": 4, "title": "Medical Clinic Proof",
            "fields": [
                { "id": "clinicProofType", "question": "Document Type", "type": "select", "options": ["Clinic Registration Certificate", "Trade License / Shop & Establishment License", "Electricity Bill", "Rent Agreement", "Property Tax Receipt"], "required": true },
                { "id": "clinicProofFile", "question": "Upload Document", "type": "file", "accept": ".pdf,.jpg,.jpeg,.png", "max_size": "10MB", "required": true }
            ]
        },
        {
            "step": 5, "title": "Review & Submit",
            "review_sections": [
                { "title": "Clinic Details", "fields": ["clinicName", "clinicType"] },
                { "title": "Doctors", "fields": ["doctorName", "doctorSpecialty", "doctorPhone"], "dynamic": true },
                { "title": "Business Details", "fields": ["businessName", "businessPhone", "businessEmail", "businessAddress", "businessProofType"] },
                { "title": "Clinic Proof", "fields": ["clinicProofType"] }
            ],
            "submit_button": "Submit Application",
            "submitting_text": "Submitting..."
        }
    ],
    "post_submission": {
        "success_message": "Application Submitted Successfully!",
        "description": "Your documents will be verified within 1-3 business days.",
        "next_steps": [
            "Please verify your email using the verification link sent to your email",
            "Please verify your phone number using the OTP sent via SMS",
            "Once verified, your account will be activated",
            "You will receive a confirmation email upon successful verification"
        ],
        "api_endpoint": "https://api.silkbinary.com/api/onboarding/saas/medesk",
        "method": "POST", "content_type": "multipart/form-data"
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

// File Upload Component - Clean, sharp design
const FileUpload = ({ label, file, onFileChange, error, helpText, accept = ".pdf,.jpg,.jpeg,.png", required }) => {
    const inputRef = useRef(null);

    return (
        <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => inputRef.current?.click()}
                className={`border-2 ${error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} hover:border-black transition-colors cursor-pointer`}
            >
                {file ? (
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1">
                            <File className="w-5 h-5 text-gray-500" />
                            <div className="flex-1 text-left">
                                <p className="text-sm font-mono text-gray-700 truncate">{file.name}</p>
                                <p className="text-xs text-gray-400 font-mono">{formatBytes(file.size)}</p>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFileChange(null); }}
                            className="p-1 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Click to upload</p>
                        <p className="text-[10px] font-mono text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => onFileChange(e.target.files[0] || null)}
                    className="hidden"
                />
            </div>
            {helpText && <p className="text-[10px] font-mono text-gray-400">{helpText}</p>}
            {error && <p className="text-xs font-mono text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{error}</p>}
        </div>
    );
};

// Step Indicator - Sharp, monospace, no curves
const StepIndicator = ({ currentStep, steps, setStep }) => (
    <>
        <div className="hidden sm:flex items-center w-full max-w-4xl mx-auto mb-12">
            {steps.map((step, idx) => {
                const isActive = currentStep === idx + 1;
                const isPast = currentStep > idx + 1;
                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center relative z-10">
                            <button
                                onClick={() => isPast && setStep(idx + 1)}
                                disabled={!isPast}
                                className={`w-8 h-8 flex items-center justify-center font-mono text-sm border-2 transition-colors ${
                                    isActive ? 'border-black bg-black text-white font-bold' :
                                        isPast ? 'border-black bg-black text-white cursor-pointer hover:opacity-80' : 'border-gray-200 bg-white text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                            </button>
                            <span className={`absolute top-10 text-[10px] sm:text-xs font-mono uppercase tracking-widest whitespace-nowrap ${isActive ? 'text-black font-bold' : 'text-gray-400'}`}>
                                {step}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-[2px] mx-2 sm:mx-4 transition-colors ${isPast ? 'bg-black' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
        <div className="sm:hidden w-full max-w-4xl mx-auto mb-8">
            <select
                value={currentStep}
                onChange={(e) => setStep(parseInt(e.target.value))}
                className="w-full p-4 border-2 border-gray-200 font-mono text-sm uppercase tracking-widest bg-white"
                disabled={currentStep > 1}
            >
                {steps.map((step, idx) => (
                    <option key={step} value={idx + 1} disabled={idx + 1 > currentStep}>
                        Step {idx + 1}: {step}
                    </option>
                ))}
            </select>
        </div>
    </>
);

// Main Component
export default function MedeskOnboarding() {
    const steps = ["Plan", "Clinic", "Doctors", "Business", "Proof", "Review"];
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
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState(null);
    const recaptchaRef = useRef(null);

    const selectedPlan = selectedPlanKey ? ONBOARDING_CONFIG.plan_selection.options[selectedPlanKey] : null;
    const maxDoctors = selectedPlan ? selectedPlan.max_doctors : 1;

    // URL param handling for plan selection
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const planFromUrl = params.get('plan');
        if (planFromUrl && ONBOARDING_CONFIG.plan_selection.options[planFromUrl]) {
            setSelectedPlanKey(planFromUrl);
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
        else if (currentStep === 6) {
            if (!password) newErrors.password = 'Password is required';
            else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
            if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
            if (!captchaToken) newErrors.captcha = 'Please complete reCAPTCHA';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [currentStep, selectedPlanKey, formData, doctorFiles, businessProofFile, clinicProofFile, password, confirmPassword, captchaToken]);

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
        fd.append('password', password);
        fd.append('recaptcha_token', captchaToken);

        if (businessProofFile) fd.append('businessProofFile', businessProofFile);
        if (clinicProofFile) fd.append('clinicProofFile', clinicProofFile);

        formData.doctors.forEach((doc, idx) => {
            fd.append(`doctors[${idx}][name]`, doc.doctorName);
            fd.append(`doctors[${idx}][specialty]`, doc.doctorSpecialty);
            fd.append(`doctors[${idx}][phone]`, doc.doctorPhone);
            if (doctorFiles[idx]) fd.append(`doctors[${idx}][certificate]`, doctorFiles[idx]);
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
                // ✅ CHECK FOR PAYMENT REDIRECT URL
                if (data.checkoutUrl) {
                    // Redirect to payment gateway (PhonePe/PayPal)
                    console.log('[Medesk] Redirecting to payment:', data.checkoutUrl);
                    window.location.href = data.checkoutUrl;
                } else if (data.redirect_url) {
                    // Fallback redirect
                    window.location.href = data.redirect_url;
                } else {
                    // No payment needed - show success page
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
    // Load reCAPTCHA script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            const scripts = document.querySelectorAll('script[src*="recaptcha"]');
            scripts.forEach(s => s.remove());
        };
    }, []);

    const renderPlanSelection = () => (
        <div className="w-full">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Select Infrastructure</h1>
                <p className="text-gray-500 font-mono text-sm">Choose the computing power and environment for your project.</p>
            </div>

            {errors.plan && <p className="text-red-500 text-xs font-mono mb-4 text-center">{errors.plan}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(ONBOARDING_CONFIG.plan_selection.options).map(([key, plan]) => {
                    const isSelected = selectedPlanKey === key;
                    return (
                        <div
                            key={key}
                            onClick={() => setSelectedPlanKey(key)}
                            className={`relative flex flex-col border-2 cursor-pointer transition-all duration-200 bg-white
                                ${isSelected ? 'border-black border-l-[6px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]' : 'border-gray-200 border-l-[6px] border-l-transparent hover:border-gray-300 hover:shadow-sm'}`}
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-black text-2xl uppercase tracking-tight">{plan.name}</h3>
                                    {isSelected && <CheckCircle2 className="w-6 h-6 text-black" />}
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-3xl font-bold">₹{plan.price}</span>
                                    <span className="font-mono text-sm text-gray-500 uppercase">/year</span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 bg-gray-50/50">
                                <p className="text-sm font-mono text-gray-600 mb-3">Up to {plan.max_doctors} doctor{plan.max_doctors > 1 ? 's' : ''}</p>
                                <ul className="space-y-2 font-mono text-xs">
                                    <li className="flex justify-between items-center py-2 border-b border-gray-200/60">
                                        <span className="text-gray-500">Doctor Accounts</span>
                                        <span className="font-bold">{plan.max_doctors}</span>
                                    </li>
                                    <li className="flex justify-between items-center py-2">
                                        <span className="text-gray-500">Support</span>
                                        <span className="font-bold">{plan.max_doctors === 1 ? 'Standard' : 'Priority'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end mt-10">
                <button
                    onClick={nextStep}
                    disabled={!selectedPlanKey}
                    className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                    Continue to Clinic Information <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderClinicInfo = () => (
        <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Clinic Information</h1>
                <p className="text-gray-500 font-mono text-sm">Tell us about your practice</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Name of the Clinic <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className={`w-full p-4 bg-gray-50 border-2 ${errors.clinicName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                        value={formData.clinicName}
                        onChange={e => handleFieldChange('clinicName', e.target.value)}
                        placeholder="e.g., City Care Medical Center"
                    />
                    {errors.clinicName && <p className="text-red-500 text-xs font-mono mt-1">{errors.clinicName}</p>}
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Type of Clinic <span className="text-red-500">*</span></label>
                    <select
                        className={`w-full p-4 bg-gray-50 border-2 ${errors.clinicType ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                        value={formData.clinicType}
                        onChange={e => handleFieldChange('clinicType', e.target.value)}
                    >
                        <option value="">Select clinic type</option>
                        {ONBOARDING_CONFIG.steps[0].fields.find(f => f.id === 'clinicType').options.map(opt => (
                            <option key={opt}>{opt}</option>
                        ))}
                    </select>
                    {errors.clinicType && <p className="text-red-500 text-xs font-mono mt-1">{errors.clinicType}</p>}
                </div>

                {formData.clinicType === 'Other' && (
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Please specify clinic type <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            className={`w-full p-4 bg-gray-50 border-2 ${errors.otherClinicType ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                            value={formData.otherClinicType}
                            onChange={e => handleFieldChange('otherClinicType', e.target.value)}
                            placeholder="Enter clinic type"
                        />
                        {errors.otherClinicType && <p className="text-red-500 text-xs font-mono mt-1">{errors.otherClinicType}</p>}
                    </div>
                )}
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200">
                    ← Back to Plans
                </button>
                <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                    Continue to Doctors <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderDoctors = () => (
        <div className="max-w-3xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Doctor Information</h1>
                <p className="text-gray-500 font-mono text-sm">
                    Based on your selected plan, you can add up to {maxDoctors} doctor(s)
                </p>
            </div>

            {errors.doctorsEmpty && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-600 text-sm font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errors.doctorsEmpty}
                </div>
            )}

            <div className="space-y-8">
                {formData.doctors.map((doctor, idx) => (
                    <div key={doctor.id} className="border-2 border-gray-200 p-6 relative bg-white">
                        {idx > 0 && (
                            <button
                                onClick={() => removeDoctor(idx)}
                                className="absolute top-4 right-4 p-1 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        )}
                        <h3 className="font-mono font-bold text-sm uppercase tracking-widest text-gray-500 mb-4">Doctor {idx + 1}</h3>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Doctor's Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`w-full p-4 bg-gray-50 border-2 ${errors[`doctor_${idx}_name`] ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                                    value={doctor.doctorName}
                                    onChange={e => updateDoctor(idx, 'doctorName', e.target.value)}
                                    placeholder="Full name as per medical registration"
                                />
                                {errors[`doctor_${idx}_name`] && <p className="text-red-500 text-xs font-mono mt-1">{errors[`doctor_${idx}_name`]}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Specialty <span className="text-red-500">*</span></label>
                                <select
                                    className={`w-full p-4 bg-gray-50 border-2 ${errors[`doctor_${idx}_specialty`] ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                                    value={doctor.doctorSpecialty}
                                    onChange={e => updateDoctor(idx, 'doctorSpecialty', e.target.value)}
                                >
                                    <option value="">Select specialty</option>
                                    {ONBOARDING_CONFIG.steps[1].fields.find(f => f.id === 'doctorSpecialty').options.map(opt => (
                                        <option key={opt}>{opt}</option>
                                    ))}
                                </select>
                                {errors[`doctor_${idx}_specialty`] && <p className="text-red-500 text-xs font-mono mt-1">{errors[`doctor_${idx}_specialty`]}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Doctor's Phone Number <span className="text-red-500">*</span></label>
                                <input
                                    type="tel"
                                    className={`w-full p-4 bg-gray-50 border-2 ${errors[`doctor_${idx}_phone`] ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                                    value={doctor.doctorPhone}
                                    onChange={e => updateDoctor(idx, 'doctorPhone', e.target.value)}
                                    placeholder="10-digit mobile number"
                                />
                                {errors[`doctor_${idx}_phone`] && <p className="text-red-500 text-xs font-mono mt-1">{errors[`doctor_${idx}_phone`]}</p>}
                            </div>

                            <FileUpload
                                label="Doctor's Registration Certificate"
                                file={doctorFiles[idx]}
                                onFileChange={(file) => setDoctorFiles(prev => ({ ...prev, [idx]: file }))}
                                error={errors[`doctor_${idx}_file`]}
                                helpText="Medical Council registration, state registration, or relevant council certificate."
                                required
                            />
                        </div>
                    </div>
                ))}
            </div>

            {formData.doctors.length < maxDoctors && (
                <button
                    onClick={addDoctor}
                    className="mt-6 w-full py-4 border-2 border-dashed border-gray-300 text-gray-600 hover:border-black hover:text-black transition-all font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Add Another Doctor
                </button>
            )}

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200">
                    ← Back to Clinic
                </button>
                <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                    Continue to Business <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderBusiness = () => (
        <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Business Information</h1>
                <p className="text-gray-500 font-mono text-sm">Legal details for verification</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Business / Clinic Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        className={`w-full p-4 bg-gray-50 border-2 ${errors.businessName ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                        value={formData.businessName}
                        onChange={e => handleFieldChange('businessName', e.target.value)}
                        placeholder="Legal name of the business entity"
                    />
                    {errors.businessName && <p className="text-red-500 text-xs font-mono mt-1">{errors.businessName}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Phone Number <span className="text-red-500">*</span></label>
                        <input
                            type="tel"
                            className={`w-full p-4 bg-gray-50 border-2 ${errors.businessPhone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                            value={formData.businessPhone}
                            onChange={e => handleFieldChange('businessPhone', e.target.value)}
                            placeholder="10-digit mobile number"
                        />
                        {errors.businessPhone && <p className="text-red-500 text-xs font-mono mt-1">{errors.businessPhone}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Email Address <span className="text-red-500">*</span></label>
                        <input
                            type="email"
                            className={`w-full p-4 bg-gray-50 border-2 ${errors.businessEmail ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                            value={formData.businessEmail}
                            onChange={e => handleFieldChange('businessEmail', e.target.value)}
                            placeholder="clinic@example.com"
                        />
                        {errors.businessEmail && <p className="text-red-500 text-xs font-mono mt-1">{errors.businessEmail}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Address <span className="text-red-500">*</span></label>
                    <textarea
                        rows={3}
                        className={`w-full p-4 bg-gray-50 border-2 ${errors.businessAddress ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                        value={formData.businessAddress}
                        onChange={e => handleFieldChange('businessAddress', e.target.value)}
                        placeholder="Full address with city, state, pin code"
                    />
                    {errors.businessAddress && <p className="text-red-500 text-xs font-mono mt-1">{errors.businessAddress}</p>}
                </div>

                <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Business Proof Type <span className="text-red-500">*</span></label>
                    <select
                        className={`w-full p-4 bg-gray-50 border-2 ${errors.businessProofType ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                        value={formData.businessProofType}
                        onChange={e => handleFieldChange('businessProofType', e.target.value)}
                    >
                        <option value="">Select proof type</option>
                        {ONBOARDING_CONFIG.steps[2].fields.find(f => f.id === 'businessProofType').options.map(opt => (
                            <option key={opt}>{opt}</option>
                        ))}
                    </select>
                    {errors.businessProofType && <p className="text-red-500 text-xs font-mono mt-1">{errors.businessProofType}</p>}
                </div>

                <FileUpload
                    label="Upload Business Proof"
                    file={businessProofFile}
                    onFileChange={setBusinessProofFile}
                    error={errors.businessProofFile}
                    helpText="PAN Card, GST Certificate, Trade License, Shop & Establishment Certificate, Partnership Deed, or Company Incorporation Certificate"
                    required
                />
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200">
                    ← Back to Doctors
                </button>
                <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                    Continue to Clinic Proof <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderClinicProof = () => (
        <div className="max-w-2xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Medical Clinic Proof</h1>
                <p className="text-gray-500 font-mono text-sm">Verify your clinic's existence</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Document Type <span className="text-red-500">*</span></label>
                    <select
                        className={`w-full p-4 bg-gray-50 border-2 ${errors.clinicProofType ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono`}
                        value={formData.clinicProofType}
                        onChange={e => handleFieldChange('clinicProofType', e.target.value)}
                    >
                        <option value="">Select document type</option>
                        {ONBOARDING_CONFIG.steps[3].fields.find(f => f.id === 'clinicProofType').options.map(opt => (
                            <option key={opt}>{opt}</option>
                        ))}
                    </select>
                    {errors.clinicProofType && <p className="text-red-500 text-xs font-mono mt-1">{errors.clinicProofType}</p>}
                </div>

                <FileUpload
                    label="Upload Document"
                    file={clinicProofFile}
                    onFileChange={setClinicProofFile}
                    error={errors.clinicProofFile}
                    helpText="Clinic Registration Certificate, Trade License, Electricity Bill, Rent Agreement, or Property Tax Receipt"
                    required
                />
            </div>

            <div className="flex justify-between mt-10">
                <button onClick={prevStep} className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200">
                    ← Back to Business
                </button>
                <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                    Review Application <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    const renderReview = () => {
        if (submitSuccess) {
            return (
                <div className="max-w-2xl mx-auto text-center">
                    <div className="border-2 border-green-500 bg-green-50 p-8">
                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-black uppercase tracking-tight">{ONBOARDING_CONFIG.post_submission.success_message}</h2>
                        <p className="text-gray-600 font-mono text-sm mt-2">{ONBOARDING_CONFIG.post_submission.description}</p>
                        <div className="mt-6 text-left">
                            <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-3">Next Steps:</h3>
                            <ul className="space-y-2">
                                {ONBOARDING_CONFIG.post_submission.next_steps.map((step, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm font-mono text-gray-600">
                                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Review & Submit</h1>
                    <p className="text-gray-500 font-mono text-sm">Please review all information before submitting</p>
                </div>

                <div className="space-y-6">
                    <div className="border-2 border-gray-200 p-6 bg-white">
                        <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-3">Clinic Details</h3>
                        <div className="space-y-2 text-sm font-mono">
                            <p><span className="text-gray-500">Clinic name:</span> {formData.clinicName || '—'}</p>
                            <p><span className="text-gray-500">Clinic type:</span> {formData.clinicType === 'Other' ? formData.otherClinicType : formData.clinicType || '—'}</p>
                        </div>
                    </div>

                    {formData.doctors.length > 0 && (
                        <div className="border-2 border-gray-200 p-6 bg-white">
                            <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-3">Doctors ({formData.doctors.length})</h3>
                            <div className="space-y-3">
                                {formData.doctors.map((doc, idx) => (
                                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                                        <p className="font-mono font-medium">{doc.doctorName || '—'}</p>
                                        <p className="text-xs font-mono text-gray-500">{doc.doctorSpecialty || '—'} • {doc.doctorPhone || '—'}</p>
                                        <p className="text-[10px] font-mono text-gray-400 mt-1">Certificate uploaded</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-2 border-gray-200 p-6 bg-white">
                        <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-3">Business Details</h3>
                        <div className="space-y-2 text-sm font-mono">
                            <p><span className="text-gray-500">Business name:</span> {formData.businessName || '—'}</p>
                            <p><span className="text-gray-500">Contact:</span> {formData.businessPhone || '—'} • {formData.businessEmail || '—'}</p>
                            <p><span className="text-gray-500">Address:</span> {formData.businessAddress || '—'}</p>
                            <p><span className="text-gray-500">Proof type:</span> {formData.businessProofType || '—'}</p>
                        </div>
                    </div>

                    <div className="border-2 border-gray-200 p-6 bg-white">
                        <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-3">Clinic Proof</h3>
                        <p className="text-sm font-mono"><span className="text-gray-500">Document type:</span> {formData.clinicProofType || '—'}</p>
                        <p className="text-xs font-mono text-gray-500 mt-1">Document uploaded: {clinicProofFile ? clinicProofFile.name : '—'}</p>
                    </div>

                    <div className="border-2 border-gray-200 p-6 bg-white">
                        <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-3">Account Security</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`w-full p-4 bg-gray-50 border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono pr-12`}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-xs font-mono mt-1">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`w-full p-4 bg-gray-50 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-black transition-all font-mono pr-12`}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs font-mono mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="border-2 border-gray-200 p-6 bg-white">
                        <h3 className="font-mono font-bold text-sm uppercase tracking-widest mb-3">Security Verification</h3>
                        <div className="g-recaptcha" data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" data-callback={(token) => setCaptchaToken(token)}></div>
                        {errors.captcha && <p className="text-red-500 text-xs font-mono mt-2">{errors.captcha}</p>}
                    </div>
                </div>

                {serverMessage && (
                    <div className="mt-6 p-4 bg-red-50 border-2 border-red-500 text-red-600 text-sm font-mono flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {serverMessage}
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <button onClick={prevStep} className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200">
                        ← Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        {isSubmitting ? ONBOARDING_CONFIG.steps[4].submitting_text : ONBOARDING_CONFIG.steps[4].submit_button}
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
        5: renderClinicProof,
        6: renderReview,
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <StepIndicator currentStep={currentStep} steps={steps} setStep={setCurrentStep} />
                {stepComponents[currentStep]()}
            </div>
            <footer className="h-1 w-full bg-black mt-auto" />
        </div>
    );
}