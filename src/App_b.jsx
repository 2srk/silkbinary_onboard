import React, { useState, useEffect } from 'react';
import {
    Globe, ArrowRight, Loader2, Shield, Activity, HardDrive, Mail, Lock, CheckCircle2,
    Check, Info, User, Phone, MapPin, LayoutDashboard, LockKeyhole, AlertTriangle
} from 'lucide-react';

// Custom Styles Injection
const CustomStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes slideLeft {
      0% { transform: translateX(20px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-left {
      animation: slideLeft 0.3s ease-out forwards;
    }
    .bg-brand-dark { background-color: #0B0F19; }
    .border-primary-600 { border-color: #4f46e5; }
    .bg-primary-600 { background-color: #4f46e5; }
    .text-primary-600 { color: #4f46e5; }
    .hover\\:bg-primary-700:hover { background-color: #4338ca; }
  `}} />
);

// --- Data Models ---
const PLANS = {
    starter: {
        name: "Starter",
        priceUsd: 15.00,
        priceInr: 1299,
        period: "yr",
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

// --- Components ---
const StatusDot = ({ available, loading }) => {
    if (loading) return <div className="w-2.5 h-2.5 rounded-none bg-yellow-400 animate-pulse" />;
    if (available) return <div className="w-2.5 h-2.5 rounded-none bg-green-500 animate-[pulse_4s_ease-in-out_infinite]" />;
    return <div className="w-2.5 h-2.5 rounded-none bg-red-500" />;
};

const Header = ({ currency, setCurrency }) => (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center rounded-none">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-white" />
            </div>
            <span className="font-black tracking-tighter text-xl uppercase">NxtHost</span>
        </div>
        <div className="flex items-center gap-4">
            <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-gray-50 border-2 border-gray-200 text-xs font-mono uppercase font-bold px-3 py-1.5 focus:outline-none focus:border-black rounded-none cursor-pointer transition-colors"
            >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
            </select>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-gray-500 hidden sm:flex">
                <StatusDot available={true} />
                System Operational
            </div>
        </div>
    </header>
);

const StepIndicator = ({ currentStep, steps }) => (
    <div className="flex items-center w-full max-w-4xl mx-auto mb-12">
        {steps.map((step, idx) => {
            const isActive = currentStep === idx + 1;
            const isPast = currentStep > idx + 1;
            return (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 flex items-center justify-center font-mono text-sm border-2 rounded-none transition-colors ${
                            isActive ? 'border-primary-600 bg-primary-600 text-white font-bold' :
                                isPast ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-400'
                        }`}>
                            {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
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
);

export default function App() {
    const steps = ["Plan", "Domain", "Account", "Checkout"];
    const [step, setStep] = useState(1);
    const [currency, setCurrency] = useState('USD');
    const exchangeRate = 83; // 1 USD = 83 INR mock

    // Plan & Config State
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [config, setConfig] = useState({ location: 'mumbai', cp: 'directadmin' });

    // Domain State
    const [domainMode, setDomainMode] = useState('register'); // register, transfer, existing
    const [domainQuery, setDomainQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [domainResult, setDomainResult] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState(null);

    // Account State
    const [account, setAccount] = useState({ name: '', email: '', phone: '', password: '' });
    const [isLogin, setIsLogin] = useState(false);

    // Checkout State
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState([]);
    const [checkoutError, setCheckoutError] = useState(null);

    // Support direct plan linking & Detect location for currency
    useEffect(() => {
        // 1. Detect Timezone for Pricing
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') {
                setCurrency('INR');
            }
        } catch (e) { console.warn("Could not detect timezone"); }

        // 2. Direct Plan Links (Path, Query, Hash)
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

    // Enforce plan constraints dynamically
    useEffect(() => {
        if (selectedPlan === 'starter') {
            setConfig({ location: 'mumbai', cp: 'directadmin' });
        }
    }, [selectedPlan]);

    const getPriceDisplay = (plan) => {
        if (currency === 'INR') return `₹${plan.priceInr.toLocaleString('en-IN')}`;
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

    const handleDomainSubmit = async (e) => {
        e.preventDefault();
        if (!domainQuery.trim()) return;

        if (domainMode === 'existing') {
            setSelectedDomain(domainQuery);
            nextStep();
            return;
        }

        setIsSearching(true);
        setDomainResult(null);

        if (domainMode === 'transfer') {
            setTimeout(() => {
                setDomainResult({ domain: domainQuery, available: true, price: currency === 'INR' ? 899 : 10.99, type: 'transfer' });
                setIsSearching(false);
            }, 800);
            return;
        }

        try {
            const res = await fetch('http://localhost:8080/api/domain/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain: domainQuery })
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();

            // Override price format based on currency
            if (currency === 'INR' && data.available) data.price = (parseFloat(data.price) * exchangeRate).toFixed(2);
            setDomainResult(data);
        } catch (err) {
            setTimeout(() => {
                const isAvailable = domainQuery.length % 2 !== 0;
                setDomainResult({
                    domain: domainQuery.toLowerCase() + (domainQuery.includes('.') ? '' : '.com'),
                    available: isAvailable,
                    price: isAvailable ? (currency === 'INR' ? 1078 : 12.99) : null
                });
            }, 1200);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCheckout = async () => {
        setIsDeploying(true);
        setCheckoutError(null);
        setDeployLogs(["Securing connection to backend API...", "Encrypting payload data..."]);

        const payload = {
            plan: PLANS[selectedPlan],
            config: config,
            domain: {
                name: selectedDomain,
                mode: domainMode,
                price: domainResult?.price
            },
            account: account,
            currency: currency,
            totalDue: currency === 'INR' ? PLANS[selectedPlan].priceInr : PLANS[selectedPlan].priceUsd
        };

        try {
            setDeployLogs(prev => [...prev, "Submitting order to provisioning system..."]);

            const res = await fetch('http://localhost:8080/api/newservice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "An unexpected error occurred during checkout.");
            }

            setDeployLogs(prev => [...prev, "Payload submitted successfully.", "Fetching payment gateway URL..."]);

            if (data.redirect_url) {
                setDeployLogs(prev => [...prev, "Redirecting to secure checkout..."]);
                setTimeout(() => {
                    window.location.href = data.redirect_url;
                }, 800);
            } else {
                throw new Error("No redirect URL provided by the server.");
            }

        } catch (err) {
            setIsDeploying(false);
            setCheckoutError(err.message);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col relative">
            <CustomStyles />
            <Header currency={currency} setCurrency={setCurrency} />

            {/* Error Popup */}
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
                <StepIndicator currentStep={step} steps={steps} />

                {/* --- STEP 1: PLAN & CONFIG --- */}
                {step === 1 && (
                    <div className="w-full animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Select Infrastructure</h1>
                            <p className="text-gray-500 font-mono text-sm">Choose the computing power and environment for your project.</p>
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
                                        <div className="p-6 border-b border-gray-100">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-black text-2xl uppercase tracking-tight">{plan.name}</h3>
                                                {isSelected && <CheckCircle2 className="w-6 h-6 text-primary-600" />}
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="font-mono text-3xl font-bold">{getPriceDisplay(plan)}</span>
                                                <span className="font-mono text-sm text-gray-500 uppercase">/{plan.period}</span>
                                            </div>
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
                                    {/* Location Selection */}
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

                                    {/* CP Selection */}
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

                {/* --- STEP 2: DOMAIN --- */}
                {step === 2 && (
                    <div className="w-full max-w-2xl mt-4 animate-slide-left">
                        <div className="mb-8 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Connect Domain</h1>
                            <p className="text-gray-500 font-mono text-sm">Select a primary domain for your new <span className="font-bold text-black">{PLANS[selectedPlan].name}</span> environment.</p>
                        </div>

                        {/* Domain Mode Selector */}
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

                        {/* Help Text */}
                        <div className="mb-6 flex items-start gap-3 bg-blue-50/50 p-4 border-l-4 border-blue-500">
                            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 font-mono">
                                {domainMode === 'register' && "Find and register a brand new domain name. We'll automatically configure the DNS."}
                                {domainMode === 'transfer' && "Move your existing domain to NxtHost to manage your billing and DNS records in one unified dashboard."}
                                {domainMode === 'existing' && "Keep your domain at your current registrar and point the DNS A-Record or Nameservers to our infrastructure."}
                            </p>
                        </div>

                        <form onSubmit={handleDomainSubmit} className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Globe className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            </div>
                            <input
                                type="text"
                                required
                                value={domainQuery}
                                onChange={(e) => setDomainQuery(e.target.value)}
                                placeholder={domainMode === 'register' ? "example.com" : "your-domain.com"}
                                className="w-full pl-12 pr-32 py-5 bg-gray-50 border-2 border-gray-200 text-lg font-mono placeholder-gray-400 focus:outline-none focus:border-black focus:bg-white transition-all rounded-none"
                            />
                            <button
                                type="submit"
                                disabled={isSearching || !domainQuery.trim()}
                                className="absolute right-2 top-2 bottom-2 bg-black hover:bg-gray-800 text-white px-6 font-mono text-sm uppercase tracking-wider disabled:opacity-50 transition-colors rounded-none flex items-center gap-2"
                            >
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    domainMode === 'existing' ? 'Continue' : 'Check'}
                            </button>
                        </form>

                        {domainResult && domainMode !== 'existing' && (
                            <div className="mt-6 border border-gray-200 bg-white shadow-sm animate-slide-left">
                                <div className="p-5 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <StatusDot available={domainResult.available} loading={false} />
                                        <div>
                                            <h3 className="font-bold text-lg">{domainResult.domain}</h3>
                                            <p className="text-xs font-mono text-gray-500 mt-1 uppercase">
                                                {domainResult.available ? (domainMode === 'transfer' ? 'Eligible for Transfer' : 'Available') : 'Registered'}
                                            </p>
                                        </div>
                                    </div>

                                    {domainResult.available ? (
                                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-mono font-bold text-lg">
                        {currency === 'INR' ? '₹' : '$'}{domainResult.price}/yr
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

                {/* --- STEP 3: ACCOUNT REGISTRATION / LOGIN --- */}
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

                        <button type="button" className="w-full mb-6 flex items-center justify-center gap-3 border-2 border-gray-200 py-4 hover:border-black transition-colors bg-white font-mono text-sm uppercase tracking-widest font-bold">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {isLogin ? 'Log in' : 'Sign up'} with Google
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 h-[2px] bg-gray-100"></div>
                            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                Or {isLogin ? 'login' : 'create account'} with email
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
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        required type="email" placeholder="john@example.com"
                                        value={account.email} onChange={e => setAccount({...account, email: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        required type="password" placeholder="••••••••"
                                        value={account.password} onChange={e => setAccount({...account, password: e.target.value})}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                                    />
                                </div>
                                {!isLogin && account.password && (
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
                                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            required={!isLogin} type="tel" pattern="[0-9+\s-]{8,15}" placeholder="+1 234 567 8900"
                                            value={account.phone} onChange={e => setAccount({...account, phone: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono mt-2">* Used for critical infrastructure alerts.</p>
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

                {/* --- STEP 4: CHECKOUT / SUBMIT --- */}
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
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs mb-1 uppercase">Domain</span>
                                            <span className="font-bold">{selectedDomain}</span>
                                            <span className="block text-[10px] text-gray-500 uppercase mt-1">({domainMode})</span>
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

                                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-end">
                                        <div>
                                            <span className="block text-gray-400 text-xs mb-1 uppercase font-mono">Account Entry</span>
                                            <span className="font-mono font-bold text-sm">{account.email || 'Google Auth'}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-gray-400 text-xs mb-1 uppercase font-mono">Total Due</span>
                                            <span className="font-black text-3xl">
                        {getPriceDisplay(PLANS[selectedPlan])}
                                                <span className="text-lg text-gray-500 font-mono uppercase ml-1">/{PLANS[selectedPlan].period}</span>
                      </span>
                                        </div>
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
                            // Deployment / Submission Terminal
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
            </main>

            <footer className="h-1 w-full bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 mt-auto" />
        </div>
    );
}