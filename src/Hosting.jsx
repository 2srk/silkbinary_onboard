import React, { useState, useEffect } from 'react';
import {
    Globe, ArrowRight, Loader2, Shield, Activity, HardDrive, Mail, Lock, CheckCircle2,
    Check, Info, User, Phone, MapPin, LayoutDashboard, LockKeyhole, AlertTriangle, Sparkles, Star
} from 'lucide-react';
import { CustomStyles, StatusDot } from './App';

// --- Data Models ---
const PLANS = {
    starter: {
        name: "Starter",
        priceUsd: 15.00,
        priceInr: 1299,
        period: "yr",
        monthlyPrice: 109,
        features: {
            storage_capacity: "5GB SSD",
            bandwidth_allocation: "100GB / Month",
            domains_hosted: "1 Domain",
            business_email: "5 Accounts (2GB)",
            ddos_protection: "Basic Edge",
        }
    },
    essential: {
        name: "Essential",
        priceUsd: 18.00,
        priceInr: 1499,
        period: "mo",
        features: {
            storage_capacity: "25GB NVMe",
            bandwidth_allocation: "Unmetered",
            domains_hosted: "Unlimited",
            business_email: "Unlimited (10GB)",
            ddos_protection: "Advanced (WAF)",
        }
    },
    pro: {
        name: "Pro",
        priceUsd: 48.00,
        priceInr: 3999,
        period: "mo",
        features: {
            storage_capacity: "50GB NVMe",
            bandwidth_allocation: "Unmetered (Dedicated)",
            domains_hosted: "Unlimited",
            business_email: "Unlimited (25GB)",
            ddos_protection: "Enterprise Edge",
        }
    }
};

const LOCATIONS = {
    mumbai: { label: "Mumbai, India", allowed: ["starter", "essential", "pro"] },
    singapore: { label: "Singapore", allowed: ["essential", "pro"] },
    dallas: { label: "Dallas, US", allowed: ["essential", "pro"] },
    eygelshoven: { label: "Eygelshoven, NL", allowed: ["essential", "pro"] },
};

const CONTROL_PANELS = {
    directadmin: { label: "DirectAdmin", allowed: ["starter", "essential", "pro"] },
    cpanel: { label: "cPanel", allowed: ["essential", "pro"] },
};

// Add this helper function before the Hosting component
const formatDomainInput = (input) => {
    // Remove protocol and www
    let cleaned = input.toLowerCase().trim()
        .replace(/^(https?:\/\/)?(www\.)?/, '')
        .split('/')[0]
        .split('?')[0]
        .split('#')[0];

    // Remove any invalid characters
    cleaned = cleaned.replace(/[^a-z0-9.-]/g, '');

    // Remove multiple consecutive dots
    cleaned = cleaned.replace(/\.{2,}/g, '.');

    // Remove leading/trailing dots and hyphens
    cleaned = cleaned.replace(/^[.-]+|[.-]+$/g, '');

    return cleaned;
};
// Allowed TLDs for display
const ALLOWED_TLDS = [
    '.com', '.net', '.org', '.in', '.co.in', '.org.in', '.firm.in', '.gen.in', '.ind.in'
];
const isValidTLD = (domain) => {
    const parts = domain.split('.');
    if (parts.length < 2) return false;

    // Check for multi-part TLDs (co.in, org.in, etc.)
    const possibleTld = parts.slice(1).join('.');
    const multiPartTlds = ['co.in', 'org.in', 'firm.in', 'gen.in', 'ind.in'];

    if (multiPartTlds.includes(possibleTld)) {
        return ALLOWED_TLDS.includes(`.${possibleTld}`);
    }

    // Single TLD
    const tld = parts.pop();
    return ALLOWED_TLDS.includes(`.${tld}`);
};
// Validation functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone) => {
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

export default function Hosting({ currency }) {
    const steps = ["Plan", "Domain", "Account", "Checkout"];
    const [step, setStep] = useState(1);
    const exchangeRate = 83;

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [config, setConfig] = useState({ location: 'mumbai', cp: 'directadmin' });
    const [domainMode, setDomainMode] = useState('register');
    const [domainQuery, setDomainQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [domainResult, setDomainResult] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState(null);
    const [account, setAccount] = useState({ name: '', email: '', phone: '', password: '' });
    const [isLogin, setIsLogin] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState([]);
    const [checkoutError, setCheckoutError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Load saved state from localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('hostingCheckout');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                // Only restore if less than 1 hour old
                if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
                    setSelectedPlan(parsed.selectedPlan);
                    setConfig(parsed.config);
                    setDomainMode(parsed.domainMode);
                    setSelectedDomain(parsed.selectedDomain);
                    setStep(parsed.step);
                } else {
                    localStorage.removeItem('hostingCheckout');
                }
            } catch (e) {
                console.error('Failed to parse saved state');
            }
        }
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (selectedPlan) {
            localStorage.setItem('hostingCheckout', JSON.stringify({
                selectedPlan,
                config,
                domainMode,
                selectedDomain,
                step,
                timestamp: Date.now()
            }));
        }
    }, [selectedPlan, config, domainMode, selectedDomain, step]);

    // Support direct plan linking
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const planFromQuery = params.get('plan');
        const planFromHash = window.location.hash.replace('#', '');
        const pathParts = window.location.pathname.split('/');
        const planFromPath = pathParts[pathParts.length - 1];

        const matchedPlan = [planFromQuery, planFromHash, planFromPath].find(p => p && PLANS[p]);

        if (matchedPlan) {
            setSelectedPlan(matchedPlan);
        }
    }, []);

    useEffect(() => {
        if (selectedPlan === 'starter') {
            setConfig({ location: 'mumbai', cp: 'directadmin' });
        }
    }, [selectedPlan]);

    const getPriceDisplay = (plan) => {
        if (currency === 'INR') {
            if (plan.name === 'Starter') {
                return (
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm text-gray-400 line-through">₹{plan.priceInr}</span>
                            <span className="text-3xl font-bold text-green-600">₹{plan.monthlyPrice}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">/mo (billed annually)</span>
                    </div>
                );
            }
            return `₹${plan.priceInr.toLocaleString('en-IN')}`;
        }

        if (plan.name === 'Starter') {
            return (
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm text-gray-400 line-through">${plan.priceUsd.toFixed(2)}</span>
                        <span className="text-3xl font-bold text-green-600">${(plan.priceUsd / 12).toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">/mo (billed annually)</span>
                </div>
            );
        }
        return `$${plan.priceUsd.toFixed(2)}`;
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
            if (!selectedDomain) {
                errors.domain = 'Please select a domain';
            }
        }

        if (stepNumber === 3) {
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

    const handleDomainSubmit = async (e) => {
        e.preventDefault();
        if (!domainQuery.trim()) return;

        // Format the domain input
        const formattedDomain = formatDomainInput(domainQuery);

        // STRICT VALIDATION - Check domain format before sending to API
        const domainRegex = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z]{2,})+$/;
        const hasValidFormat = domainRegex.test(formattedDomain);

        if (!hasValidFormat) {
            setCheckoutError('Please enter a valid domain name (e.g., example.com)');
            return;
        }

        // Check if domain has a valid TLD from allowed list
        const tld = formattedDomain.split('.').slice(1).join('.');
        if (!ALLOWED_TLDS.map(t => t.substring(1)).includes(tld)) {
            setCheckoutError(`TLD .${tld} is not supported. Allowed TLDs: ${ALLOWED_TLDS.join(', ')}`);
            return;
        }

        // Basic validation before sending to backend
        if (formattedDomain.length < 3) {
            setCheckoutError('Domain name must be at least 3 characters');
            return;
        }

        if (domainMode === 'existing') {
            setSelectedDomain(formattedDomain);
            nextStep();
            return;
        }

        setIsSearching(true);
        setDomainResult(null);
        setCheckoutError(null);

        if (domainMode === 'transfer') {
            setTimeout(() => {
                setDomainResult({
                    domain: formattedDomain,
                    available: true,
                    price: currency === 'INR' ? 899 : 10.99,
                    type: 'transfer',
                    premium: false,
                    validation: { tld: formattedDomain.split('.').pop() }
                });
                setIsSearching(false);
            }, 800);
            return;
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const res = await fetch('https://sbinapi.plak.in/api/domain/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ domain: formattedDomain }),
                signal: controller.signal,
                mode: 'cors',
                credentials: 'include'
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                // Handle 400 errors specifically
                if (res.status === 400) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Invalid domain format. Please check and try again.');
                }
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error ${res.status}`);
            }

            const data = await res.json();

            // Check if domain validation failed
            if (data.source === 'validation' && data.error) {
                setCheckoutError(data.errorMessage);
                setDomainResult(null);
                setIsSearching(false);
                return;
            }

            // Convert price if needed
            if (currency === 'INR' && data.available && data.price) {
                data.price = (parseFloat(data.price) * exchangeRate).toFixed(2);
            }

            setDomainResult(data);
        } catch (err) {
            console.error('Domain search error:', err);

            let errorMessage = 'Domain search failed. ';
            if (err.name === 'AbortError') {
                errorMessage += 'Request timeout. Please try again.';
            } else if (err.message.includes('Failed to fetch')) {
                errorMessage += 'Cannot connect to server.';
            } else if (err.message.includes('400')) {
                errorMessage += 'Invalid domain format. Please use a valid domain (e.g., example.com)';
            } else {
                errorMessage += err.message;
            }

            setCheckoutError(errorMessage);
        } finally {
            setIsSearching(false);
        }
    };

    const calculateTotal = () => {
        if (!selectedPlan) return 0;

        let total = currency === 'INR' ? PLANS[selectedPlan].priceInr : PLANS[selectedPlan].priceUsd;

        if (selectedDomain && domainResult) {
            const domainPrice = parseFloat(domainResult.price) || 0;

            if (selectedPlan === 'starter') {
                total += domainPrice;
            }

            if (selectedPlan !== 'starter' && domainResult.premium) {
                total += domainPrice;
            }
        }

        return total;
    };

    const getDomainPriceDisplay = () => {
        if (!domainResult || !domainResult.available) return null;

        const isStarter = selectedPlan === 'starter';
        const isPremium = domainResult.premium;
        const showFree = (!isStarter && !isPremium);

        if (showFree) {
            return (
                <div className="flex items-center gap-2">
                    <span className="font-mono text-sm line-through text-gray-400">
                        {currency === 'INR' ? '₹' : '$'}{domainResult.price}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-mono font-bold animate-pulse">
                        FREE 🎉
                    </span>
                </div>
            );
        }

        return (
            <span className="font-mono font-bold text-lg">
                {currency === 'INR' ? '₹' : '$'}{domainResult.price}
            </span>
        );
    };

// In hosting.jsx - Update the handleCheckout function

    const handleCheckout = async () => {
        if (!validateStep(3)) {
            setStep(3);
            return;
        }

        setIsDeploying(true);
        setCheckoutError(null);
        setDeployLogs(["Securing connection to backend API...", "Encrypting payload data..."]);

        // Determine the plan key
        let planKey = null;
        if (selectedPlan === 'starter') planKey = 'starter';
        else if (selectedPlan === 'essential') planKey = 'essential';
        else if (selectedPlan === 'pro') planKey = 'pro';

        // Clean payload structure
        const payload = {
            plan: {
                name: PLANS[selectedPlan].name,
                key: planKey,
                period: PLANS[selectedPlan].period,
                features: PLANS[selectedPlan].features
            },
            config: {
                location: config.location,
                cp: config.cp
            },
            domain: selectedDomain ? {
                name: selectedDomain,
                mode: domainMode,
                price: domainResult?.price,
                premium: domainResult?.premium || false
            } : null,
            account: {
                name: isLogin ? undefined : account.name,
                email: account.email,
                phone: isLogin ? undefined : account.phone,
                password: account.password // Always send password for validation
            },
            currency: currency,
            totalAmount: calculateTotal(),
            isLogin: isLogin
        };

        try {
            setDeployLogs(prev => [...prev, "Submitting order to provisioning system..."]);

            const res = await fetch('https://sbinapi.plak.in/api/onboarding/hosting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            // DEBUG: See what the backend returns
            console.log('Backend response:', data);

            if (!res.ok) {
                // Handle specific error codes
                if (data.code === 'INVALID_CREDENTIALS') {
                    throw new Error('Invalid email or password. Please try again.');
                } else if (data.code === 'USER_EXISTS') {
                    throw new Error('An account with this email already exists. Please login instead.');
                } else if (data.code === 'PASSWORD_REQUIRED') {
                    throw new Error('Password is required.');
                } else if (data.code === 'NAME_REQUIRED') {
                    throw new Error('Name is required for new accounts.');
                } else {
                    throw new Error(data.message || "An unexpected error occurred during checkout.");
                }
            }

            setDeployLogs(prev => [...prev, "Payload submitted successfully.", "Fetching payment gateway URL..."]);

            // 🔥 IMPORTANT: Store order data in localStorage BEFORE redirect
            if (data.orderId) {
                const pendingOrder = {
                    orderId: data.orderId,
                    plan: selectedPlan,
                    domain: selectedDomain,
                    amount: calculateTotal(),
                    currency: currency,
                    timestamp: Date.now(),
                    checkoutUrl: data.checkoutUrl || data.redirect_url
                };

                localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
                console.log('[Hosting] Order saved to localStorage:', pendingOrder);
            }

            // Clear saved state after successful order
            localStorage.removeItem('hostingCheckout');

            // Check for checkoutUrl first (new backend response)
            if (data.checkoutUrl) {
                setDeployLogs(prev => [...prev, "Redirecting to secure payment gateway..."]);
                console.log('Redirecting to PhonePe:', data.checkoutUrl);

                // Small delay to ensure localStorage is written
                setTimeout(() => {
                    window.location.href = data.checkoutUrl; // This will be the PhonePe URL
                }, 800);
            }
            // Fallback for backward compatibility
            else if (data.redirect_url) {
                setDeployLogs(prev => [...prev, "Redirecting to secure checkout..."]);
                setTimeout(() => {
                    window.location.href = data.redirect_url;
                }, 800);
            }
            else if (data.orderId) {
                setDeployLogs(prev => [...prev, "Order created successfully!", "Redirecting to order confirmation..."]);
                setTimeout(() => {
                    window.location.href = `/payment/success?orderId=${data.orderId}`;
                }, 800);
            }
            else {
                throw new Error("No redirect URL provided by the server.");
            }

        } catch (err) {
            console.error('Checkout error:', err);
            setIsDeploying(false);
            setCheckoutError(err.message);
        }
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

    // Loading skeleton for domain search
    const DomainSkeleton = () => (
        <div className="mt-6 border border-gray-200 bg-white animate-pulse">
            <div className="p-5">
                <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 bg-gray-300"></div>
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 w-32"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col relative">
            <CustomStyles />

            {checkoutError && (
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
            )}

            <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-6 py-12">
                <StepIndicator currentStep={step} steps={steps} setStep={setStep} />

                {/* Desktop layout with sidebar for steps 2-4 */}
                <div className="flex gap-8 w-full">
                    {/* Main content */}
                    <div className="flex-1">
                        {step === 1 && (
                            <div className="w-full animate-slide-left">
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Select Infrastructure</h1>
                                    <p className="text-gray-500 font-mono text-sm">Choose the computing power and environment for your project.</p>
                                </div>

                                {validationErrors.plan && (
                                    <p className="text-red-500 text-xs font-mono mb-4 text-center">{validationErrors.plan}</p>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {Object.entries(PLANS).map(([key, plan]) => {
                                        const isSelected = selectedPlan === key;
                                        return (
                                            <div
                                                key={key}
                                                onClick={() => setSelectedPlan(key)}
                                                className={`relative flex flex-col border-2 cursor-pointer transition-all duration-200 bg-white
                                                ${isSelected ? 'border-primary-600 border-l-[6px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]' : 'border-gray-200 border-l-[6px] border-l-transparent hover:border-gray-300 hover:shadow-sm'}
                                                ${key === 'starter' ? 'border-t-4 border-t-green-500' : ''}`}
                                            >
                                                {key === 'starter' && (
                                                    <div className="absolute -top-3 left-4 bg-green-500 text-white px-3 py-1 text-xs font-mono uppercase tracking-widest flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" /> Best Value
                                                    </div>
                                                )}
                                                <div className="p-6 border-b border-gray-100">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h3 className="font-black text-2xl uppercase tracking-tight flex items-center gap-2">
                                                            {plan.name}
                                                            {key === 'starter' && currency === 'INR' && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 font-mono">Just ₹109/mo*</span>
                                                            )}
                                                            {key === 'starter' && currency === 'USD' && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 font-mono">Just ${(plan.priceUsd / 12).toFixed(2)}/mo*</span>
                                                            )}
                                                        </h3>
                                                        {isSelected && <CheckCircle2 className="w-6 h-6 text-primary-600" />}
                                                    </div>
                                                    <div className="flex items-baseline gap-1">
                                                        {typeof getPriceDisplay(plan) === 'string' ? (
                                                            <span className="font-mono text-3xl font-bold">{getPriceDisplay(plan)}</span>
                                                        ) : (
                                                            getPriceDisplay(plan)
                                                        )}
                                                        {key !== 'starter' && (
                                                            <span className="font-mono text-sm text-gray-500 uppercase">/{plan.period}</span>
                                                        )}
                                                    </div>
                                                    {key === 'starter' && (
                                                        <p className="text-xs text-gray-500 mt-2 font-mono">
                                                            {currency === 'INR' ? `*₹${plan.priceInr}/year, just ₹${plan.monthlyPrice}/month` : `*$${plan.priceUsd.toFixed(2)}/year, just $${(plan.priceUsd / 12).toFixed(2)}/month`}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="p-6 flex-1 bg-gray-50/50">
                                                    <ul className="space-y-3 font-mono text-xs">
                                                        <li className="flex justify-between items-center py-2 border-b border-gray-200/60">
                                                            <span className="text-gray-500 flex items-center gap-2"><HardDrive className="w-3.5 h-3.5"/> Storage</span>
                                                            <span className="font-bold text-right">{plan.features.storage_capacity}</span>
                                                        </li>
                                                        <li className="flex justify-between items-center py-2 border-b border-gray-200/60">
                                                            <span className="text-gray-500 flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Bandwidth</span>
                                                            <span className="font-bold text-right">{plan.features.bandwidth_allocation}</span>
                                                        </li>
                                                        <li className="flex justify-between items-center py-2 border-b border-gray-200/60">
                                                            <span className="text-gray-500 flex items-center gap-2"><Mail className="w-3.5 h-3.5"/> Email</span>
                                                            <span className="font-bold text-right">{plan.features.business_email}</span>
                                                        </li>
                                                        <li className="flex justify-between items-center py-2">
                                                            <span className="text-gray-500 flex items-center gap-2"><Shield className="w-3.5 h-3.5"/> DDoS</span>
                                                            <span className="font-bold text-right">{plan.features.ddos_protection}</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {selectedPlan && (
                                    <div className="mt-12 p-8 border-2 border-gray-200 bg-gray-50/30 animate-slide-left">
                                        <h3 className="font-black text-xl uppercase tracking-tight mb-6">Environment Configuration</h3>

                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">
                                                    <MapPin className="w-4 h-4" /> Datacenter Location
                                                </label>
                                                <div className="space-y-3">
                                                    {Object.entries(LOCATIONS).map(([key, loc]) => {
                                                        const isAllowed = loc.allowed.includes(selectedPlan);
                                                        return (
                                                            <label key={key} className={`flex items-center p-4 border-2 transition-all cursor-pointer ${
                                                                !isAllowed ? 'opacity-40 grayscale cursor-not-allowed bg-gray-100 border-gray-200' :
                                                                    config.location === key ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white hover:border-black'
                                                            }`}>
                                                                <input
                                                                    type="radio" name="location" value={key}
                                                                    disabled={!isAllowed}
                                                                    checked={config.location === key}
                                                                    onChange={(e) => setConfig({...config, location: e.target.value})}
                                                                    className="hidden"
                                                                />
                                                                <div className={`w-4 h-4 border-2 flex items-center justify-center mr-3 ${config.location === key ? 'border-primary-600' : 'border-gray-300'}`}>
                                                                    {config.location === key && <div className="w-2 h-2 bg-primary-600" />}
                                                                </div>
                                                                <span className="font-mono text-sm">{loc.label}</span>
                                                                {!isAllowed && <span className="ml-auto text-xs font-mono text-gray-400 uppercase">Upgrade Req.</span>}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">
                                                    <LayoutDashboard className="w-4 h-4" /> Control Panel
                                                </label>
                                                <div className="space-y-3">
                                                    {Object.entries(CONTROL_PANELS).map(([key, cp]) => {
                                                        const isAllowed = cp.allowed.includes(selectedPlan);
                                                        return (
                                                            <label key={key} className={`flex items-center p-4 border-2 transition-all cursor-pointer ${
                                                                !isAllowed ? 'opacity-40 grayscale cursor-not-allowed bg-gray-100 border-gray-200' :
                                                                    config.cp === key ? 'border-primary-600 bg-primary-50 text-primary-900' : 'border-gray-200 bg-white hover:border-black'
                                                            }`}>
                                                                <input
                                                                    type="radio" name="cp" value={key}
                                                                    disabled={!isAllowed}
                                                                    checked={config.cp === key}
                                                                    onChange={(e) => setConfig({...config, cp: e.target.value})}
                                                                    className="hidden"
                                                                />
                                                                <div className={`w-4 h-4 border-2 flex items-center justify-center mr-3 ${config.cp === key ? 'border-primary-600' : 'border-gray-300'}`}>
                                                                    {config.cp === key && <div className="w-2 h-2 bg-primary-600" />}
                                                                </div>
                                                                <span className="font-mono text-sm">{cp.label}</span>
                                                                {!isAllowed && <span className="ml-auto text-xs font-mono text-gray-400 uppercase">Upgrade Req.</span>}
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-end">
                                            <button
                                                onClick={nextStep}
                                                className="bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3"
                                            >
                                                Continue to Domain Selection <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="w-full max-w-2xl mx-auto animate-slide-left">
                                <div className="mb-8 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Connect Domain</h1>
                                    <p className="text-gray-500 font-mono text-sm">Select a primary domain for your new <span className="font-bold text-black">{PLANS[selectedPlan]?.name}</span> environment.</p>
                                    {selectedPlan !== 'starter' && (
                                        <p className="text-xs text-green-600 mt-2 font-mono animate-pulse">
                                            ✨ Free domain with Selected Tlds!
                                        </p>
                                    )}
                                    {validationErrors.domain && (
                                        <p className="text-red-500 text-xs font-mono mt-2">{validationErrors.domain}</p>
                                    )}
                                </div>

                                <div className="flex bg-gray-100 p-1 mb-6 rounded-none">
                                    {[
                                        { id: 'register', label: 'Register New' },
                                        { id: 'transfer', label: 'Transfer' },
                                        { id: 'existing', label: 'Use Existing' }
                                    ].map(mode => (
                                        <button
                                            key={mode.id}
                                            onClick={() => { setDomainMode(mode.id); setDomainResult(null); }}
                                            className={`flex-1 py-3 text-xs sm:text-sm font-mono uppercase tracking-widest font-bold transition-colors ${
                                                domainMode === mode.id ? 'bg-white shadow-sm text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-700'
                                            }`}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="mb-6 flex items-start gap-3 bg-blue-50/50 p-4 border-l-4 border-blue-500">
                                    <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-gray-600 font-mono">
                                        {domainMode === 'register' && (
                                            <>
                                                Find and register a brand new domain name.
                                                {selectedPlan !== 'starter' && (
                                                    <span className="block mt-1 text-green-600 font-bold">Free domain with Essential & Pro plans</span>
                                                )}
                                            </>
                                        )}
                                        {domainMode === 'transfer' && "Move your existing domain to Silkbinary to manage your billing and DNS records in one unified dashboard."}
                                        {domainMode === 'existing' && "Keep your domain at your current registrar and point the DNS A-Record or Nameservers to our infrastructure."}
                                    </p>
                                </div>

                                <form onSubmit={handleDomainSubmit} className="relative group">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Globe
                                            className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors"/>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={domainQuery}
                                        onChange={(e) => {
                                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, '');
                                            setDomainQuery(value);
                                        }}
                                        placeholder={domainMode === 'register' ? "yourdomain (e.g., example)" : "your-domain.com"}
                                        className={`w-full pl-12 pr-32 py-5 bg-gray-50 border-2 text-lg font-mono placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-all rounded-none ${
                                            checkoutError && checkoutError.includes('domain') ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        disabled={isSearching}
                                        maxLength={63}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSearching || !domainQuery.trim()}
                                        className="absolute right-2 top-2 bottom-2 bg-black hover:bg-gray-800 text-white px-6 font-mono text-sm uppercase tracking-wider disabled:opacity-50 transition-colors rounded-none flex items-center gap-2"
                                    >
                                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin"/> :
                                            domainMode === 'existing' ? 'Continue' : 'Check'}
                                    </button>
                                </form>
                                {domainQuery && domainMode === 'register' && (
                                    <div className="mt-2 text-xs font-mono">
                                        {(() => {
                                            const testDomain = formatDomainInput(domainQuery);
                                            const hasDot = testDomain.includes('.');
                                            const isValidLength = testDomain.replace(/\./g, '').length >= 3;
                                            const validChars = /^[a-z0-9.-]+$/.test(testDomain);

                                            if (!testDomain) return null;

                                            return (
                                                <div className="space-y-1">
                                                    {!validChars && (
                                                        <p className="text-amber-600">⚠ Only letters, numbers, dots, and hyphens allowed</p>
                                                    )}
                                                    {!isValidLength && (
                                                        <p className="text-amber-600">⚠ Domain must be at least 3 characters</p>
                                                    )}
                                                    {validChars && isValidLength && !hasDot && (
                                                        <p className="text-gray-500">ℹ No TLD specified - will default to .com</p>
                                                    )}
                                                    {validChars && isValidLength && hasDot && isValidTLD(testDomain) && (
                                                        <p className="text-green-600">✓ Valid domain format</p>
                                                    )}
                                                    {hasDot && !isValidTLD(testDomain) && (
                                                        <p className="text-red-600">✗ Unsupported TLD. Allowed: {ALLOWED_TLDS.join(', ')}</p>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                                {/* Add TLD suggestions */}
                                {domainMode === 'register' && !isSearching && !domainResult && (
                                    <div className="mt-4">
                                        <p className="text-xs font-mono text-gray-500 mb-2">Popular TLDs:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {ALLOWED_TLDS.map(tld => (
                                                <button
                                                    key={tld}
                                                    onClick={() => {
                                                        const base = domainQuery.replace(/\.[^.]*$/, '');
                                                        if (base) {
                                                            setDomainQuery(base + tld);
                                                        } else {
                                                            setDomainQuery(tld.substring(1));
                                                        }
                                                    }}
                                                    className="text-xs px-3 py-1 border border-gray-200 hover:border-black font-mono transition-colors"
                                                >
                                                    {tld}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {isSearching && <DomainSkeleton />}

                                {/* Domain Result Section */}
                                {domainResult && domainMode !== 'existing' && (
                                    <div className="mt-6 border border-gray-200 bg-white shadow-sm animate-slide-left">
                                        <div className="p-5">
                                            {/* Error State */}
                                            {domainResult.error && (
                                                <div className="flex items-start gap-4">
                                                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                                    <div>
                                                        <h3 className="font-bold text-lg text-red-600">Check Failed</h3>
                                                        <p className="text-sm font-mono text-gray-600 mt-1">
                                                            {domainResult.errorMessage || 'Unable to check domain availability'}
                                                        </p>
                                                        <p className="text-xs font-mono text-gray-400 mt-2">
                                                            Please try again later or contact support
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* DNS Source State */}
                                            {!domainResult.error && domainResult.source === 'dns' && (
                                                <div className="flex items-start gap-4">
                                                    <StatusDot available={false} loading={false} />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg">{domainResult.domain}</h3>
                                                        <p className="text-xs font-mono text-gray-500 mt-1">
                                                            Unavailable (Already Registered)
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-1">
                                                            ✓ Verified via DNS
                                                        </p>
                                                    </div>
                                                    <button disabled className="bg-gray-100 text-gray-400 border border-gray-200 px-6 py-2.5 font-mono text-sm uppercase tracking-widest cursor-not-allowed">
                                                        Unavailable
                                                    </button>
                                                </div>
                                            )}

                                            {/* API Source State */}
                                            {!domainResult.error && domainResult.source === 'api' && (
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <StatusDot available={domainResult.available} loading={false} />
                                                        <div>
                                                            <h3 className="font-bold text-lg">{domainResult.domain}</h3>
                                                            <p className="text-xs font-mono text-gray-500 mt-1 uppercase">
                                                                {domainResult.available ? 'Available' : 'Registered'}
                                                            </p>
                                                            {/* Show TLD info if available */}
                                                            {domainResult.validation && (
                                                                <p className="text-[10px] text-gray-400 font-mono mt-1">
                                                                    TLD: .{domainResult.validation.tld}
                                                                </p>
                                                            )}
                                                            {domainResult.premium && domainResult.available && (
                                                                <p className="text-[10px] text-amber-600 font-mono mt-1 flex items-center gap-1">
                                                                    <Star className="w-3 h-3" /> Premium domain
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {domainResult.available ? (
                                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                            <span className="font-mono font-bold text-lg">
                                                                {currency === 'INR' ? '₹' : '$'}{domainResult.price}
                                                            </span>
                                                            <button
                                                                onClick={() => { setSelectedDomain(domainResult.domain); nextStep(); }}
                                                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 font-mono text-sm uppercase tracking-widest transition-colors"
                                                            >
                                                                Select
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button disabled className="bg-gray-100 text-gray-400 border border-gray-200 px-6 py-2.5 font-mono text-sm uppercase tracking-widest cursor-not-allowed">
                                                            Unavailable
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Fallback for other sources */}
                                            {!domainResult.error && !domainResult.source && (
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <StatusDot available={domainResult.available} loading={false} />
                                                        <div>
                                                            <h3 className="font-bold text-lg">{domainResult.domain}</h3>
                                                            <p className="text-xs font-mono text-gray-500 mt-1 uppercase">
                                                                {domainResult.available ? 'Available' : 'Registered'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {domainResult.available ? (
                                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                                            <span className="font-mono font-bold text-lg">
                                                                {currency === 'INR' ? '₹' : '$'}{domainResult.price}
                                                            </span>
                                                            <button
                                                                onClick={() => { setSelectedDomain(domainResult.domain); nextStep(); }}
                                                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 font-mono text-sm uppercase tracking-widest transition-colors"
                                                            >
                                                                Select
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button disabled className="bg-gray-100 text-gray-400 border border-gray-200 px-6 py-2.5 font-mono text-sm uppercase tracking-widest cursor-not-allowed">
                                                            Unavailable
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-start">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200"
                                    >
                                        ← Back to Plans
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="w-full max-w-xl mx-auto animate-slide-left">
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
                                        {isLogin ? 'Welcome Back' : 'Create Account'}
                                    </h1>
                                    <p className="text-gray-500 font-mono text-sm">
                                        {isLogin ? 'Log in to your account to complete your order.' : 'Owner details for this infrastructure.'}
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
                                                    required={!isLogin}
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={account.name}
                                                    onChange={e => setAccount({...account, name: e.target.value})}
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
                                                required
                                                type="email"
                                                placeholder="john@example.com"
                                                value={account.email}
                                                onChange={e => setAccount({...account, email: e.target.value})}
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
                                                required
                                                type="password"
                                                placeholder="••••••••"
                                                value={account.password}
                                                onChange={e => setAccount({...account, password: e.target.value})}
                                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 transition-all font-mono ${
                                                    validationErrors.password ? 'border-red-500' : 'border-gray-200 focus:border-black focus:bg-white'
                                                }`}
                                            />
                                        </div>
                                        {validationErrors.password && (
                                            <p className="text-red-500 text-xs font-mono mt-1">{validationErrors.password}</p>
                                        )}
                                        {!isLogin && account.password && !validationErrors.password && (
                                            <div className="mt-2 animate-slide-left">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-mono uppercase text-gray-500">Security Level</span>
                                                    <span className={`text-[10px] font-mono uppercase font-bold transition-colors ${
                                                        calculateStrength(account.password) < 2 ? 'text-red-500' :
                                                            calculateStrength(account.password) < 4 ? 'text-yellow-500' : 'text-green-500'
                                                    }`}>
                                                        {['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][calculateStrength(account.password)]}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-200 flex gap-1 rounded-none overflow-hidden">
                                                    <div className={`h-full transition-all duration-300 ${calculateStrength(account.password) >= 1 ? (calculateStrength(account.password) < 2 ? 'bg-red-500' : calculateStrength(account.password) < 4 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all duration-300 ${calculateStrength(account.password) >= 2 ? (calculateStrength(account.password) < 4 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all duration-300 ${calculateStrength(account.password) >= 3 ? (calculateStrength(account.password) < 4 ? 'bg-yellow-400' : 'bg-green-500') : 'bg-transparent'}`} style={{ width: '25%' }} />
                                                    <div className={`h-full transition-all duration-300 ${calculateStrength(account.password) >= 4 ? 'bg-green-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
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
                                                    type="tel"
                                                    pattern="[0-9+\s-]{8,15}"
                                                    placeholder="+1 234 567 8900"
                                                    value={account.phone}
                                                    onChange={e => setAccount({...account, phone: e.target.value})}
                                                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 transition-all font-mono ${
                                                        validationErrors.phone ? 'border-red-500' : 'border-gray-200 focus:border-black focus:bg-white'
                                                    }`}
                                                />
                                            </div>
                                            {validationErrors.phone && (
                                                <p className="text-red-500 text-xs font-mono mt-1">{validationErrors.phone}</p>
                                            )}
                                            <p className="text-[10px] text-gray-400 font-mono mt-2">* Used for critical infrastructure alerts.</p>
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
                                        <button
                                            type="submit"
                                            className="w-full bg-black hover:bg-gray-800 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-3"
                                        >
                                            {isLogin ? 'Secure Login & Continue' : 'Review Order'} <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-6 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black hover:underline transition-all"
                                    >
                                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                                    </button>
                                </div>

                                <div className="mt-4 flex justify-start">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-transparent hover:border-gray-200"
                                    >
                                        ← Back to Domain
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="w-full max-w-4xl mx-auto animate-slide-left">
                                {!isDeploying ? (
                                    <>
                                        <div className="mb-10 text-center">
                                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Final Review</h1>
                                            <p className="text-gray-500 font-mono text-sm">Verify configuration before proceeding to secure checkout.</p>
                                        </div>

                                        <div className="bg-gray-50 border-2 border-gray-200 p-8 mb-8">
                                            <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-6 border-b border-gray-200 pb-2">Order Summary</h3>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-sm">
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase">Plan</span>
                                                    <span className="font-bold">{PLANS[selectedPlan].name}</span>
                                                    {selectedPlan === 'starter' && (
                                                        <span className="text-[10px] text-green-600 block">
                                                            {currency === 'INR' ? `(₹${PLANS[selectedPlan].monthlyPrice}/month)` : `($${(PLANS[selectedPlan].priceUsd / 12).toFixed(2)}/month)`}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase">Domain</span>
                                                    <span className="font-bold">{selectedDomain}</span>
                                                    <span className="block text-[10px] text-gray-500 uppercase mt-1">({domainMode})</span>
                                                    {domainResult && (
                                                        <div className="text-[10px] mt-1">
                                                            {selectedPlan === 'starter' ? (
                                                                <span className="text-amber-600">Domain included in total</span>
                                                            ) : (
                                                                !domainResult.premium ? (
                                                                    <span className="text-green-600 font-bold animate-pulse">FREE 🎉</span>
                                                                ) : (
                                                                    <span className="text-amber-600">Premium domain</span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase">Location</span>
                                                    <span className="font-bold">{LOCATIONS[config.location].label}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase">Control Panel</span>
                                                    <span className="font-bold">{CONTROL_PANELS[config.cp].label}</span>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                                <div>
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase font-mono">Account Entry</span>
                                                    <span className="font-mono font-bold text-sm">{account.email || 'Google Auth'}</span>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <span className="block text-gray-400 text-xs mb-1 uppercase font-mono">Total Due</span>
                                                    <span className="font-black text-3xl">
                                                        {currency === 'INR' ? '₹' : '$'}{calculateTotal().toFixed(2)}
                                                        <span className="text-lg text-gray-500 font-mono uppercase ml-1">/{PLANS[selectedPlan].period}</span>
                                                    </span>
                                                    {selectedPlan === 'starter' && (
                                                        <p className="text-[10px] text-gray-500 mt-1">
                                                            {currency === 'INR' ? `₹${PLANS[selectedPlan].monthlyPrice}/month equivalent` : `$${(PLANS[selectedPlan].priceUsd / 12).toFixed(2)}/month equivalent`}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment methods */}
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

                                        <div className="flex justify-end gap-4">
                                            <button
                                                onClick={() => setStep(3)}
                                                className="px-8 py-4 font-mono text-sm uppercase tracking-widest border-2 border-gray-200 hover:border-black transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleCheckout}
                                                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3"
                                            >
                                                <LockKeyhole className="w-4 h-4" /> Secure Checkout
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
                                                Checkout Initialization — {selectedDomain}
                                            </div>
                                        </div>

                                        <div className="p-6 font-mono text-sm min-h-[300px] text-gray-300">
                                            {deployLogs.map((log, idx) => (
                                                <div key={idx} className="flex gap-4 mb-2 animate-slide-left">
                                                    <span className="text-gray-600">[{new Date().toISOString().substring(11, 19)}]</span>
                                                    <span className={idx === deployLogs.length - 1 && log.includes("Redirecting") ? 'text-green-400 font-bold' : 'text-gray-300'}>
                                                        {log}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex gap-4 mb-2">
                                                <span className="text-gray-600">[{new Date().toISOString().substring(11, 19)}]</span>
                                                <span className="text-primary-400 flex items-center gap-2">
                                                    <span className="w-1.5 h-3 bg-primary-400 animate-pulse inline-block" /> Processing request...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Persistent sidebar for steps 2-4 */}
                    {step > 1 && selectedPlan && (
                        <div className="hidden lg:block w-80">
                            <div className="sticky top-24 border-2 border-gray-200 p-6 bg-white">
                                <h4 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">Your Selection</h4>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Plan</p>
                                        <p className="font-bold text-sm">{PLANS[selectedPlan].name}</p>
                                        <p className="text-xs font-mono text-primary-600">
                                            {currency === 'INR' ? '₹' : '$'}{calculateTotal().toFixed(2)}/{PLANS[selectedPlan].period}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Location</p>
                                        <p className="text-sm">{LOCATIONS[config.location]?.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-gray-400">Control Panel</p>
                                        <p className="text-sm">{CONTROL_PANELS[config.cp]?.label}</p>
                                    </div>
                                    {selectedDomain && (
                                        <div>
                                            <p className="text-xs font-mono text-gray-400">Domain</p>
                                            <p className="text-sm font-mono break-all">{selectedDomain}</p>
                                        </div>
                                    )}
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