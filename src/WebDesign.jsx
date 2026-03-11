// WebDesign.jsx - Updated with Hosting.jsx pattern
import React, { useState, useEffect } from 'react';
import {
    Layout, ArrowRight, Loader2, CheckCircle2, Check, User, Phone, Mail,
    Lock, Briefcase, FileText, CheckSquare, Square, Monitor, Sparkles, AlertTriangle,
    Server, MapPin, Eye, EyeOff
} from 'lucide-react';
import { CustomStyles } from './App';

// --- Data Models ---
const PLANS = {
    starter: {
        id: "starter",
        name: "Starter Website",
        priceInr: 18000,
        priceUsd: 215,
        priceDisplay: "₹18,000",
        description: "Entry-level website for small businesses establishing an online presence.",
        pages: "Up to 5",
        features: ["Custom built pages", "Mobile responsive design", "Basic SEO structure", "WhatsApp API integration"],
        delivery: "2–4 weeks"
    },
    professional: {
        id: "professional",
        name: "Professional Website",
        priceInr: 40000,
        priceUsd: 480,
        priceDisplay: "₹40,000",
        description: "Advanced website architecture for growing businesses needing stronger positioning.",
        pages: "10–12",
        features: ["Custom UI/UX architecture", "CMS integration", "Security hardening & WAF", "Lead capture systems"],
        delivery: "3–5 weeks"
    },
    advanced: {
        id: "advanced",
        name: "Advanced / E-Commerce",
        priceInr: 0,
        priceUsd: 0,
        priceDisplay: "Custom Quote",
        description: "Full-scale dynamic websites or e-commerce platforms with transaction systems.",
        pages: "Unlimited",
        features: ["Dynamic page architecture", "E-commerce engine", "Payment gateway integration", "High traffic scalability"],
        delivery: "4–6 weeks"
    }
};

const INDUSTRIES = [
    "Tech / SaaS", "Medical / Healthcare", "Fintech / Finance",
    "E-commerce / Retail", "Consulting / Agency", "Education", "Other"
];

const OPTIONAL_FEATURES = [
    "Shop / E-Commerce", "User Forum", "Booking System",
    "Blog / News Section", "Portfolio / Gallery", "Advanced Analytics",
    "Multilingual Support", "Membership Portal"
];

const THEMES = [
    { id: 'light', name: 'Clean Light', class: 'theme-preview-light', accent: 'bg-blue-600' },
    { id: 'dark', name: 'Modern Dark', class: 'theme-preview-dark', accent: 'bg-indigo-500' },
    { id: 'neon', name: 'Cyber Neon', class: 'theme-preview-neon', accent: 'accent' },
    { id: 'minimalist', name: 'Minimalist', class: 'theme-preview-minimalist', accent: 'bg-stone-800' },
];

const HOSTING_LOCATIONS = [
    { id: 'mumbai', label: 'APAC - Mumbai' },
    { id: 'singapore', label: 'APAC - Singapore' },
    { id: 'us', label: 'United States' },
    { id: 'eu', label: 'Europe (EU)' }
];

// Validation functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^[\+\d\s\-\(\)]{8,20}$/;
    return phoneRegex.test(phone);
};

const StepIndicator = ({ currentStep, steps, setStep }) => (
    <>
        {/* Desktop version */}
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
                                className={`w-8 h-8 flex items-center justify-center font-mono text-sm border-2 rounded-none transition-colors ${
                                    isActive ? 'border-primary-600 bg-primary-600 text-white font-bold' :
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

        {/* Mobile dropdown */}
        <div className="sm:hidden w-full max-w-4xl mx-auto mb-8">
            <select
                value={currentStep}
                onChange={(e) => setStep(parseInt(e.target.value))}
                className="w-full p-4 border-2 border-gray-200 font-mono text-sm uppercase tracking-widest bg-white"
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

const ThemeVisualizer = ({ theme }) => {
    const t = THEMES.find(x => x.id === theme) || THEMES[0];

    return (
        <div className={`w-full h-64 border-4 rounded-none overflow-hidden flex flex-col transition-all duration-700 ${t.class}`}>
            <div className="h-10 border-b-2 inherit-border flex items-center px-4 gap-2 opacity-50">
                <div className="w-3 h-3 rounded-full border border-current"></div>
                <div className="w-3 h-3 rounded-full border border-current"></div>
                <div className="w-3 h-3 rounded-full border border-current"></div>
                <div className="mx-auto w-1/2 h-4 border border-current rounded-sm opacity-30"></div>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div className="w-24 h-6 border-b-2 border-current opacity-40"></div>
                    <div className="flex gap-3">
                        <div className="w-8 h-2 bg-current opacity-20"></div>
                        <div className="w-8 h-2 bg-current opacity-20"></div>
                        <div className="w-8 h-2 bg-current opacity-20"></div>
                    </div>
                </div>

                <div className="flex-1 flex items-center gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="w-3/4 h-8 bg-current opacity-80 rounded-sm"></div>
                        <div className="w-full h-3 bg-current opacity-20"></div>
                        <div className="w-5/6 h-3 bg-current opacity-20"></div>
                        <div className={`w-32 h-10 mt-4 transition-colors duration-500 flex items-center justify-center border border-current ${t.accent}`}>
                            <span className="w-16 h-2 bg-white opacity-80"></span>
                        </div>
                    </div>
                    <div className="hidden sm:block w-1/3 h-full border-2 border-current opacity-20 rounded-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-current opacity-10 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function WebDesign({ currency }) {
    const steps = ["Plan", "Project", "Design", "Hosting", "Account", "Submit"];
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [project, setProject] = useState({
        name: '',
        industry: '',
        features: [],
        description: ''
    });
    const [theme, setTheme] = useState('light');
    const [hosting, setHosting] = useState({ optIn: true, location: 'mumbai' });
    const [account, setAccount] = useState({ name: '', email: '', phone: '', password: '' });
    const [isLogin, setIsLogin] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState([]);
    const [checkoutError, setCheckoutError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

    // Load saved state from localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('webdesignCheckout');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
                    setSelectedPlan(parsed.selectedPlan);
                    setProject(parsed.project);
                    setTheme(parsed.theme);
                    setHosting(parsed.hosting);
                    setStep(parsed.step);
                } else {
                    localStorage.removeItem('webdesignCheckout');
                }
            } catch (e) {
                console.error('Failed to parse saved state');
            }
        }
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const planFromQuery = params.get('plan');
        const planFromHash = window.location.hash.replace('#', '');

        const matchedPlan = [planFromQuery, planFromHash].find(
            p => p && PLANS[p]
        );

        if (matchedPlan) {
            setSelectedPlan(matchedPlan);
            setStep(2); // skip plan step
        }
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (selectedPlan) {
            localStorage.setItem('webdesignCheckout', JSON.stringify({
                selectedPlan,
                project,
                theme,
                hosting,
                step,
                timestamp: Date.now()
            }));
        }
    }, [selectedPlan, project, theme, hosting, step]);

    const getPriceDisplay = (plan) => {
        if (plan.priceInr === 0) return "Custom Quote";
        if (currency === 'USD') {
            return `$${plan.priceUsd}`;
        }
        return plan.priceDisplay;
    };

    const toggleFeature = (feat) => {
        setProject(prev => ({
            ...prev,
            features: prev.features.includes(feat)
                ? prev.features.filter(f => f !== feat)
                : [...prev.features, feat]
        }));
    };

    const calculateStrength = (pwd) => {
        if (!pwd) return 0;
        let score = 0;
        if (pwd.length > 5) score += 1;
        if (pwd.length > 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
        return Math.min(score, 4);
    };

    const validateStep = (stepNumber) => {
        const errors = {};

        if (stepNumber === 1) {
            if (!selectedPlan) {
                errors.plan = 'Please select a plan';
            }
        }

        if (stepNumber === 2) {
            if (!project.name.trim()) {
                errors.projectName = 'Project name is required';
            }
        }

        if (stepNumber === 5) {
            if (!isLogin) {
                if (!account.name.trim()) {
                    errors.name = 'Full name is required';
                }
            }
            if (!account.email.trim()) {
                errors.email = 'Email is required';
            } else if (!isValidEmail(account.email)) {
                errors.email = 'Invalid email format';
            }
            if (!account.password) {
                errors.password = 'Password is required';
            } else if (!isLogin && account.password.length < 8) {
                errors.password = 'Password must be at least 8 characters';
            }
            if (!isLogin && account.phone && !isValidPhone(account.phone)) {
                errors.phone = 'Invalid phone format';
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            window.scrollTo(0, 0);
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        window.scrollTo(0, 0);
        setStep(prev => prev - 1);
    };

    const calculateTotal = () => {
        if (!selectedPlan) return 0;

        // For web design, total is just the plan price
        // Advanced plan is custom quote (0)
        if (selectedPlan === 'advanced') return 0;

        return currency === 'INR' ? PLANS[selectedPlan].priceInr : PLANS[selectedPlan].priceUsd;
    };

    const handleCheckout = async () => {
        if (!validateStep(5)) {
            setStep(5);
            return;
        }

        setIsDeploying(true);
        setCheckoutError(null);
        setDeployLogs(["Initializing project payload...", "Securing connection to backend..."]);

        // Determine plan key
        let planKey = null;
        if (selectedPlan === 'starter') planKey = 'starter';
        else if (selectedPlan === 'professional') planKey = 'professional';
        else if (selectedPlan === 'advanced') planKey = 'advanced';

        const payload = {
            plan: {
                name: PLANS[selectedPlan].name,
                key: planKey,
                features: PLANS[selectedPlan].features,
                pages: PLANS[selectedPlan].pages,
                delivery: PLANS[selectedPlan].delivery
            },
            project: {
                name: project.name,
                industry: project.industry,
                features: project.features,
                description: project.description
            },
            design: {
                theme: theme,
                themeName: THEMES.find(t => t.id === theme)?.name
            },
            hosting: {
                optIn: hosting.optIn,
                location: hosting.location
            },
            account: {
                name: isLogin ? undefined : account.name,
                email: account.email,
                phone: isLogin ? undefined : account.phone,
                password: account.password
            },
            currency: currency,
            totalAmount: calculateTotal(),
            isLogin: isLogin,
            isCustomQuote: selectedPlan === 'advanced'
        };

        try {
            setDeployLogs(prev => [...prev, "Submitting to SilkBinary API..."]);

            const res = await fetch('https://api.silkbinary.com/api/onboarding/webdesign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log('[WebDesign] Backend response:', data);

            if (!res.ok) {
                if (data.code === 'INVALID_CREDENTIALS') {
                    throw new Error('Invalid email or password. Please try again.');
                } else if (data.code === 'USER_EXISTS') {
                    throw new Error('An account with this email already exists. Please login instead.');
                } else if (data.code === 'PASSWORD_REQUIRED') {
                    throw new Error('Password is required.');
                } else if (data.code === 'NAME_REQUIRED') {
                    throw new Error('Name is required for new accounts.');
                } else {
                    throw new Error(data.message || "An unexpected error occurred.");
                }
            }

            setDeployLogs(prev => [...prev, "Payload accepted by server..."]);

            // 🔥 IMPORTANT: Store order data in localStorage BEFORE redirect
            if (data.orderId) {
                const pendingOrder = {
                    orderId: data.orderId,
                    plan: selectedPlan,
                    projectName: project.name,
                    amount: calculateTotal(),
                    currency: currency,
                    timestamp: Date.now(),
                    checkoutUrl: data.checkoutUrl || data.redirect_url,
                    isCustomQuote: selectedPlan === 'advanced'
                };

                localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
                console.log('[WebDesign] Order saved to localStorage:', pendingOrder);
            }

            // Clear saved state after successful order
            localStorage.removeItem('webdesignCheckout');

            // Handle custom quote (no payment)
            if (selectedPlan === 'advanced' || data.isCustomQuote) {
                setDeployLogs(prev => [
                    ...prev,
                    "✅ SUCCESS: Requirements logged securely.",
                    "📋 STATUS: Custom Quote Pending.",
                    "👥 Action: Our architects will contact you within 24 hours."
                ]);
                setTimeout(() => {
                    window.location.href = `/quote-requested?orderId=${data.orderId}`;
                }, 2000);
            }
            // Handle payment flow
            else if (data.checkoutUrl) {
                setDeployLogs(prev => [
                    ...prev,
                    "✅ SUCCESS: Payload accepted.",
                    "💰 Generating invoice...",
                    "↪️ Redirecting to secure payment gateway..."
                ]);
                setTimeout(() => {
                    window.location.href = data.checkoutUrl;
                }, 2000);
            }
            // Fallback for backward compatibility
            else if (data.redirect_url) {
                setDeployLogs(prev => [
                    ...prev,
                    "✅ SUCCESS: Payload accepted.",
                    "💰 Generating invoice...",
                    "↪️ Redirecting to secure payment gateway..."
                ]);
                setTimeout(() => {
                    window.location.href = data.redirect_url;
                }, 2000);
            }
            else if (data.orderId) {
                setDeployLogs(prev => [...prev, "✅ Order created successfully!", "↪️ Redirecting to confirmation..."]);
                setTimeout(() => {
                    window.location.href = `/payment/success?orderId=${data.orderId}`;
                }, 1500);
            }

        } catch (err) {
            console.error('Checkout error:', err);
            setIsDeploying(false);
            setCheckoutError(err.message);
        }
    };

    // Error modal component
    const ErrorModal = () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-slide-left">
            <div className="bg-white border-l-[6px] border-red-500 p-6 max-w-md w-full shadow-2xl rounded-none relative">
                <div className="flex items-start gap-4">
                    <div className="bg-red-50 p-3 flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black uppercase tracking-tight text-lg mb-2 text-red-600">Checkout Failed</h3>
                        <p className="font-mono text-sm text-gray-700 mb-6 leading-relaxed">{checkoutError}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setCheckoutError(null)}
                                className="bg-black hover:bg-gray-800 text-white px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors rounded-none"
                            >
                                Dismiss & Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col relative">
            <CustomStyles />

            {checkoutError && <ErrorModal />}

            <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-6 py-12">
                <StepIndicator currentStep={step} steps={steps} setStep={setStep} />

                {/* Desktop layout with sidebar for steps 2-6 */}
                <div className="flex gap-8 w-full">
                    {/* Main content */}
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="w-full animate-slide-left">
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Select Architecture</h1>
                                    <p className="text-gray-500 font-mono text-sm">Choose the foundation for your digital presence.</p>
                                    {validationErrors.plan && (
                                        <p className="text-red-500 text-xs font-mono mt-2">{validationErrors.plan}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {Object.entries(PLANS).map(([key, plan]) => {
                                        const isSelected = selectedPlan === key;
                                        return (
                                            <div
                                                key={key}
                                                onClick={() => setSelectedPlan(key)}
                                                className={`relative flex flex-col border-2 cursor-pointer transition-all duration-200 bg-white
                                                ${isSelected ? 'border-primary-600 border-l-[6px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]' : 'border-gray-200 border-l-[6px] border-l-transparent hover:border-gray-300 hover:shadow-sm'}
                                                `}
                                            >
                                                <div className="p-6 border-b border-gray-100 min-h-[140px]">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="font-black text-xl uppercase tracking-tight">{plan.name}</h3>
                                                        {isSelected && <CheckCircle2 className="w-6 h-6 text-primary-600 flex-shrink-0" />}
                                                    </div>
                                                    <div className="flex items-baseline gap-1 mt-auto">
                                                        <span className="font-mono text-3xl font-bold">{getPriceDisplay(plan)}</span>
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 bg-gray-50/50 flex flex-col">
                                                    <p className="text-sm text-gray-600 mb-6 font-mono leading-relaxed h-16">{plan.description}</p>
                                                    <ul className="space-y-3 font-mono text-xs flex-1 mb-6">
                                                        <li className="flex justify-between items-center py-2 border-b border-gray-200/60 font-bold">
                                                            <span>Pages</span>
                                                            <span>{plan.pages}</span>
                                                        </li>
                                                        {plan.features.map((feat, i) => (
                                                            <li key={i} className="flex items-center gap-2 py-1.5 text-gray-600">
                                                                <Check className="w-3.5 h-3.5 text-black" /> {feat}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="text-xs font-mono text-gray-400 bg-gray-100 p-3 flex justify-between">
                                                        <span>Est. Delivery</span>
                                                        <span className="text-black font-bold">{plan.delivery}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-10 flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        disabled={!selectedPlan}
                                        className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                    >
                                        Continue to Project <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="w-full max-w-2xl animate-slide-left">
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Project Brief</h1>
                                    <p className="text-gray-500 font-mono text-sm">Tell us about your brand and required capabilities.</p>
                                    {validationErrors.projectName && (
                                        <p className="text-red-500 text-xs font-mono mt-2">{validationErrors.projectName}</p>
                                    )}
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-8">
                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Company / Website Name</label>
                                        <div className="relative">
                                            <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                required type="text" placeholder="e.g. NxtTech Solutions"
                                                value={project.name} onChange={e => setProject({...project, name: e.target.value})}
                                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 transition-all font-mono ${
                                                    validationErrors.projectName ? 'border-red-500' : 'border-gray-200 focus:border-black focus:bg-white'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Industry Sector</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {INDUSTRIES.map(ind => (
                                                <button
                                                    type="button" key={ind}
                                                    onClick={() => setProject({...project, industry: ind})}
                                                    className={`p-3 text-xs font-mono uppercase border-2 transition-all ${
                                                        project.industry === ind ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                                                    }`}
                                                >
                                                    {ind}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Required Features</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {OPTIONAL_FEATURES.map(feat => {
                                                const isActive = project.features.includes(feat);
                                                return (
                                                    <button
                                                        type="button" key={feat}
                                                        onClick={() => toggleFeature(feat)}
                                                        className={`flex items-center gap-3 p-3 border-2 transition-all text-left ${
                                                            isActive ? 'border-black bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {isActive ? <CheckSquare className="w-5 h-5 text-black" /> : <Square className="w-5 h-5 text-gray-300" />}
                                                        <span className={`text-sm font-mono ${isActive ? 'text-black font-bold' : 'text-gray-600'}`}>{feat}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Brief Explanation (Optional)</label>
                                        <textarea
                                            placeholder="Describe your vision, target audience, or specific requirements..."
                                            value={project.description} onChange={e => setProject({...project, description: e.target.value})}
                                            rows={4}
                                            className="w-full p-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-between pt-6 border-t border-gray-200">
                                        <button type="button" onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                                            ← Back
                                        </button>
                                        <button type="submit" className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                            Design System <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="w-full max-w-4xl animate-slide-left">
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Design Language</h1>
                                    <p className="text-gray-500 font-mono text-sm">Select the core aesthetic for your interface. We'll customize it further.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-12 items-center">
                                    <div className="order-2 md:order-1 relative">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 opacity-20 blur-lg"></div>
                                        <ThemeVisualizer theme={theme} />
                                    </div>

                                    <div className="order-1 md:order-2 space-y-4">
                                        {THEMES.map(t => (
                                            <label
                                                key={t.id}
                                                className={`flex items-center p-5 border-2 cursor-pointer transition-all ${
                                                    theme === t.id ? 'border-black bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-400 bg-white'
                                                }`}
                                            >
                                                <input
                                                    type="radio" name="theme" value={t.id}
                                                    checked={theme === t.id}
                                                    onChange={(e) => setTheme(e.target.value)}
                                                    className="hidden"
                                                />
                                                <div className={`w-5 h-5 border-2 flex items-center justify-center mr-4 ${theme === t.id ? 'border-black' : 'border-gray-300'}`}>
                                                    {theme === t.id && <div className="w-2.5 h-2.5 bg-black" />}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-mono text-lg font-bold block">{t.name}</span>
                                                    <span className="font-mono text-xs text-gray-500 uppercase">Preview Active →</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-12 flex justify-between pt-6 border-t border-gray-200">
                                    <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                                        ← Back
                                    </button>
                                    <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                        Hosting Options <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="w-full max-w-2xl mx-auto animate-slide-left">
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Cloud Infrastructure</h1>
                                    <p className="text-gray-500 font-mono text-sm">Avail 3 years of premium cloud hosting, completely free with your plan.</p>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => setHosting({...hosting, optIn: true})}
                                            className={`flex-1 p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all ${hosting.optIn ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <Server className={`w-8 h-8 ${hosting.optIn ? 'text-primary-600' : 'text-gray-400'}`} />
                                            <span className="font-bold font-mono uppercase">Claim Free Hosting</span>
                                            <span className="text-xs text-center text-gray-500 font-mono">3 Years Included</span>
                                        </button>
                                        <button
                                            onClick={() => setHosting({...hosting, optIn: false})}
                                            className={`flex-1 p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all ${!hosting.optIn ? 'border-black bg-gray-50 text-black' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <Layout className={`w-8 h-8 ${!hosting.optIn ? 'text-black' : 'text-gray-400'}`} />
                                            <span className="font-bold font-mono uppercase">I Have Hosting</span>
                                            <span className="text-xs text-center text-gray-500 font-mono">Use Own Infrastructure</span>
                                        </button>
                                    </div>

                                    {hosting.optIn && (
                                        <div className="animate-slide-left space-y-4">
                                            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Select Server Region</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {HOSTING_LOCATIONS.map(loc => (
                                                    <label key={loc.id} className={`flex items-center p-4 border-2 cursor-pointer transition-all ${hosting.location === loc.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                                        <input
                                                            type="radio" name="location" value={loc.id}
                                                            checked={hosting.location === loc.id}
                                                            onChange={(e) => setHosting({...hosting, location: e.target.value})}
                                                            className="hidden"
                                                        />
                                                        <MapPin className={`w-5 h-5 mr-3 flex-shrink-0 ${hosting.location === loc.id ? 'text-primary-600' : 'text-gray-400'}`} />
                                                        <span className={`font-mono text-sm font-bold ${hosting.location === loc.id ? 'text-primary-700' : 'text-gray-700'}`}>{loc.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between pt-6 border-t border-gray-200">
                                        <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                                            ← Back
                                        </button>
                                        <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                            Account Setup <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="w-full max-w-xl mx-auto animate-slide-left">
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
                                        {isLogin ? 'Welcome Back' : 'Create Account'}
                                    </h1>
                                    <p className="text-gray-500 font-mono text-sm">
                                        {isLogin ? 'Log in to securely link your project request.' : 'Owner details for client portal access.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex-1 h-[2px] bg-gray-100"></div>
                                    <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                                         {isLogin ? 'login' : 'create account'} with email
                                    </span>
                                    <div className="flex-1 h-[2px] bg-gray-100"></div>
                                </div>

                                <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                                    {!isLogin && (
                                        <div className="animate-slide-left">
                                            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    required={!isLogin} type="text" placeholder="John Doe"
                                                    value={account.name} onChange={e => setAccount({...account, name: e.target.value})}
                                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 transition-all font-mono ${
                                                        validationErrors.name ? 'border-red-500' : 'border-gray-200 focus:border-black focus:bg-white'
                                                    }`}
                                                />
                                            </div>
                                            {validationErrors.name && (
                                                <p className="text-red-500 text-xs font-mono mt-1">{validationErrors.name}</p>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                required type="email" placeholder="john@example.com"
                                                value={account.email} onChange={e => setAccount({...account, email: e.target.value})}
                                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 transition-all font-mono ${
                                                    validationErrors.email ? 'border-red-500' : 'border-gray-200 focus:border-black focus:bg-white'
                                                }`}
                                            />
                                        </div>
                                        {validationErrors.email && (
                                            <p className="text-red-500 text-xs font-mono mt-1">{validationErrors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                required type={showPassword ? "text" : "password"} placeholder="••••••••"
                                                value={account.password} onChange={e => setAccount({...account, password: e.target.value})}
                                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 transition-all font-mono ${
                                                    validationErrors.password ? 'border-red-500' : 'border-gray-200 focus:border-black focus:bg-white'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                                            </button>
                                        </div>
                                        {validationErrors.password && (
                                            <p className="text-red-500 text-xs font-mono mt-1">{validationErrors.password}</p>
                                        )}
                                        {!isLogin && account.password && !validationErrors.password && (
                                            <div className="mt-2 animate-slide-left">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-mono uppercase text-gray-500">Security Level</span>
                                                    <span className={`text-[10px] font-mono uppercase font-bold ${
                                                        calculateStrength(account.password) < 2 ? 'text-red-500' :
                                                            calculateStrength(account.password) < 4 ? 'text-yellow-500' : 'text-green-500'
                                                    }`}>
                                                        {['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][calculateStrength(account.password)]}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-200 flex gap-1">
                                                    <div className={`h-full transition-all ${calculateStrength(account.password) >= 1 ? (calculateStrength(account.password) < 2 ? 'bg-red-500' : calculateStrength(account.password) < 4 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all ${calculateStrength(account.password) >= 2 ? (calculateStrength(account.password) < 4 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all ${calculateStrength(account.password) >= 3 ? (calculateStrength(account.password) < 4 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all ${calculateStrength(account.password) >= 4 ? 'bg-green-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {!isLogin && (
                                        <div className="animate-slide-left">
                                            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Phone Number (Optional)</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel" placeholder="+1 234 567 8900"
                                                    value={account.phone} onChange={e => setAccount({...account, phone: e.target.value})}
                                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 transition-all font-mono ${
                                                        validationErrors.phone ? 'border-red-500' : 'border-gray-200 focus:border-black focus:bg-white'
                                                    }`}
                                                />
                                            </div>
                                            {validationErrors.phone && (
                                                <p className="text-red-500 text-xs font-mono mt-1">{validationErrors.phone}</p>
                                            )}
                                        </div>
                                    )}

                                    {isLogin && (
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-4 h-4 border-2 border-gray-300"
                                                />
                                                <span className="text-xs font-mono text-gray-600">Remember me</span>
                                            </label>
                                            <a href="#" className="text-xs font-mono text-primary-600 hover:underline">Forgot password?</a>
                                        </div>
                                    )}

                                    <div className="pt-6">
                                        <button type="submit" className="w-full bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-3">
                                            Review Order <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-6 text-center">
                                    <button
                                        type="button" onClick={() => setIsLogin(!isLogin)}
                                        className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black hover:underline transition-all"
                                    >
                                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                                    </button>
                                </div>

                                <div className="mt-8 flex justify-start">
                                    <button onClick={prevStep} className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200">
                                        ← Back
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="w-full max-w-5xl mx-auto animate-slide-left">
                                {!isDeploying ? (
                                    <>
                                        <div className="mb-10 text-center">
                                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Final Review</h1>
                                            <p className="text-gray-500 font-mono text-sm">Verify configuration before finalizing your request.</p>
                                        </div>

                                        <div className="bg-gray-50 border-2 border-gray-200 p-8 mb-8">
                                            <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-6 border-b border-gray-200 pb-2">Order Manifest</h3>

                                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 font-mono text-sm">
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase flex items-center gap-2"><Briefcase className="w-3 h-3"/> Plan</span>
                                                    <span className="font-bold block">{PLANS[selectedPlan]?.name}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase mt-1 block">Est. {PLANS[selectedPlan]?.delivery}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase flex items-center gap-2"><Layout className="w-3 h-3"/> Project</span>
                                                    <span className="font-bold block">{project.name || 'Not Provided'}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase mt-1 block">{project.industry || 'General'}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase flex items-center gap-2"><Monitor className="w-3 h-3"/> Aesthetic</span>
                                                    <span className="font-bold block">{THEMES.find(t=>t.id===theme)?.name}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase flex items-center gap-2"><FileText className="w-3 h-3"/> Features</span>
                                                    <span className="font-bold block">{project.features.length} Selected</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase flex items-center gap-2"><Server className="w-3 h-3"/> Hosting</span>
                                                    <span className="font-bold block">{hosting.optIn ? '3 Years Free' : 'External'}</span>
                                                    {hosting.optIn && <span className="text-[10px] text-gray-500 uppercase mt-1 block">Region: {HOSTING_LOCATIONS.find(l => l.id === hosting.location)?.label}</span>}
                                                </div>
                                            </div>

                                            {selectedPlan === 'advanced' && (
                                                <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 flex gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                                    <p className="text-sm font-mono text-yellow-800">
                                                        You selected a <b>Custom Architecture</b>. No payment is required today. Submitting this form will log your requirements and our team will contact you with a customized quote and timeline.
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase font-mono">Client Account</span>
                                                    <span className="font-mono font-bold text-sm">{account.email || 'Not Provided'}</span>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase font-mono">Amount Due Today</span>
                                                    <span className="font-black text-3xl text-primary-600">
                                                        {getPriceDisplay(PLANS[selectedPlan])}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment methods */}
                                        {selectedPlan !== 'advanced' && (
                                            <div className="mb-6">
                                                <p className="text-xs font-mono text-gray-500 mb-2">Accepted payment methods:</p>
                                                <div className="flex gap-4 items-center">
                                                    <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png" alt="Visa" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
                                                    <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png" alt="Mastercard" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
                                                    {currency === 'INR' ? (
                                                        <span className="text-sm font-mono bg-blue-100 text-blue-700 px-3 py-1">PhonePe</span>
                                                    ) : (
                                                        <span className="text-sm font-mono bg-blue-100 text-blue-700 px-3 py-1">PayPal</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                                            <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors">
                                                ← Back
                                            </button>
                                            <button onClick={handleCheckout} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                                {selectedPlan === 'advanced' ? 'Request Custom Quote' : 'Proceed to Checkout'} <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-brand-dark rounded-none overflow-hidden shadow-2xl border border-gray-800 animate-slide-left">
                                        <div className="bg-[#111827] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                                            </div>
                                            <div className="flex-1 text-center font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                                                System Process — {project.name || 'Project'}
                                            </div>
                                        </div>

                                        <div className="p-6 font-mono text-sm min-h-[300px] text-gray-300">
                                            {deployLogs.map((log, idx) => {
                                                let colorClass = 'text-gray-300';
                                                if (log.includes("SUCCESS")) colorClass = 'text-green-400 font-bold';
                                                if (log.includes("Redirecting") || log.includes("Action:")) colorClass = 'text-blue-400';
                                                if (log.includes("STATUS:")) colorClass = 'text-yellow-400';

                                                return (
                                                    <div key={idx} className="flex gap-4 mb-2 animate-slide-left">
                                                        <span className="text-gray-600 whitespace-nowrap">[{new Date().toISOString().substring(11, 19)}]</span>
                                                        <span className={colorClass}>{log}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Persistent sidebar for steps 2-6 */}
                    {step > 1 && selectedPlan && (
                        <div className="hidden lg:block w-80">
                            <div className="sticky top-24 border-2 border-gray-200 p-6 bg-white">
                                <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">Your Selection</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Plan</p>
                                        <p className="font-bold text-sm">{PLANS[selectedPlan]?.name}</p>
                                        <p className="text-xs font-mono text-primary-600">
                                            {getPriceDisplay(PLANS[selectedPlan])}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Project</p>
                                        <p className="text-sm">{project.name || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Theme</p>
                                        <p className="text-sm">{THEMES.find(t => t.id === theme)?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Features</p>
                                        <p className="text-sm">{project.features.length} selected</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Hosting</p>
                                        <p className="text-sm">{hosting.optIn ? 'Free (3 years)' : 'External'}</p>
                                        {hosting.optIn && (
                                            <p className="text-xs text-gray-500">{HOSTING_LOCATIONS.find(l => l.id === hosting.location)?.label}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <footer className="h-1 w-full bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 mt-auto" />
        </div>
    );
}