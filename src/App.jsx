import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Server, Globe, Cpu, HardDrive, Sparkles, Activity, ArrowRight } from 'lucide-react';
import WebDesign from './WebDesign';
import Hosting from './Hosting';
import VPS from './vps';
import Dedicated from './dedicated';
import PaymentSuccess from './PaymentSuccess';
import PaymentStatus from './PS.jsx';
import SaasRouter from './saas/saas.jsx';


// Custom Styles Injection (shared across all services)
export const CustomStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
    @keyframes slideLeft {
      0% { transform: translateX(20px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    @keyframes strike {
      0% { width: 0; }
      100% { width: 100%; }
    }
    .animate-slide-left {
      animation: slideLeft 0.3s ease-out forwards;
    }
    .price-strike {
      position: relative;
      display: inline-block;
    }
    .price-strike::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, #ef4444, #f97316);
      animation: strike 0.3s ease-out forwards;
      transform: translateY(-50%);
    }
    .bg-brand-dark { background-color: #0B0F19; }
    .border-primary-600 { border-color: #4f46e5; }
    .bg-primary-600 { background-color: #4f46e5; }
    .text-primary-600 { color: #4f46e5; }
    
    /* Theme Visualizer Classes */
    .theme-preview-light { background: #ffffff; color: #111827; border-color: #e5e7eb; }
    .theme-preview-dark { background: #111827; color: #f9fafb; border-color: #374151; }
    .theme-preview-neon { background: #000000; color: #39ff14; border-color: #ff00ff; box-shadow: inset 0 0 10px rgba(255,0,255,0.2); }
    .theme-preview-neon .accent { background: #ff00ff; box-shadow: 0 0 10px #ff00ff; }
    .theme-preview-minimalist { background: #f4f4f0; color: #333333; border-color: #d6d3d1; }
    
    /* Medesk Beautiful & Poppy Background */
    .bg-medesk-poppy {
      /* Base Color */
      background-color: #2B5B4D; 
      /* Clean, Beautiful, "Little Poppy" Mesh Gradient (Natural Aurora) */
      background-image: 
        radial-gradient(at 10% 10%, #3D7A68 0px, transparent 50%),
        radial-gradient(at 90% 20%, #AEC2BA 0px, transparent 50%),
        radial-gradient(at 50% 50%, #1f4439 0px, transparent 50%),
        radial-gradient(at 20% 80%, #2B5B4D 0px, transparent 50%),
        radial-gradient(at 80% 90%, rgba(249, 248, 246, 0.1) 0px, transparent 50%);
    }
  `}} />
);

// StatusDot component (shared)
export const StatusDot = ({ available, loading }) => {
    if (loading) return <div className="w-2.5 h-2.5 rounded-none bg-yellow-400 animate-pulse" />;
    if (available) return <div className="w-2.5 h-2.5 rounded-none bg-green-500 animate-[pulse_4s_ease-in-out_infinite]" />;
    return <div className="w-2.5 h-2.5 rounded-none bg-red-500" />;
};

// Currency Context
export const CurrencyContext = React.createContext();

// Header component with back navigation and currency toggle
const Header = ({ currency, setCurrency }) => {
    const location = useLocation();
    const isRoot = location.pathname === '/';
    const isPaymentPage = location.pathname.includes('/payment/');
    const isDadPage = location.pathname === '/dad'; // Add check for dad page
    const isMedeskPage = location.pathname === '/saas/medesk'; // Add check for dad page


    // Show currency toggle for ALL services except dad and payment pages
    const showCurrencyToggle = !isRoot && !isPaymentPage && !isDadPage &&!isMedeskPage;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex flex-wrap justify-between items-center">
            <div className="flex items-center gap-3">
                <a href="https://silkbinary.com">
                    <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                </a>
                {!isRoot && !isPaymentPage && !isDadPage && (
                    <Link
                        to="/"
                        className="ml-2 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-gray-200 px-3 py-1.5"
                    >
                        ← All Services
                    </Link>
                )}
                {isPaymentPage && (
                    <Link
                        to="/hosting"
                        className="ml-2 text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black transition-colors border border-gray-200 px-3 py-1.5"
                    >
                        ← Back to Services
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-4">
                {showCurrencyToggle && (
                    <div className="flex items-center gap-1 border-2 border-gray-200">
                        <button
                            onClick={() => setCurrency('USD')}
                            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                                currency === 'USD' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            USD $
                        </button>
                        <button
                            onClick={() => setCurrency('INR')}
                            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                                currency === 'INR' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            INR ₹
                        </button>
                    </div>
                )}
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-gray-500">
                    <StatusDot available={true} />
                    Systems Online
                </div>
            </div>
        </header>
    );
};

// Root selection menu component
const ServiceSelection = () => {
    const services = [
        {
            path: '/web-design',
            name: 'Web Design',
            icon: Sparkles,
            description: 'Custom websites, e-commerce, and web applications',
            features: ['Custom UI/UX', 'CMS Integration', 'SEO Optimization', 'Payment Gateways']
        },
        {
            path: '/hosting',
            name: 'Web Hosting',
            icon: Server,
            description: 'Shared hosting plans for small to medium websites',
            features: ['5-50GB Storage', 'Unmetered Bandwidth', 'Business Email', 'DDoS Protection']
        },
        {
            path: '/vps',
            name: 'Virtual Server',
            icon: Cpu,
            description: 'Virtual private servers with dedicated resources',
            features: ['1-8 vCPU Cores', '2-32GB RAM', '50-400GB NVMe', 'Full Root Access'],
            unavailable: true
        },
        {
            path: '/dedicated',
            name: 'Dedicated Server',
            icon: HardDrive,
            description: 'Physical servers for high-performance workloads',
            features: ['8-24 Cores', '32-128GB RAM', 'Enterprise SSDs', 'IPMI Access'],
            unavailable: true
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
            <CustomStyles />
            <Header />

            <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-6 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black uppercase tracking-tight mb-4">Choose Your Service</h1>
                    <p className="text-gray-500 font-mono text-lg max-w-2xl mx-auto">
                        Select the infrastructure or development service that matches your project requirements.
                    </p>
                </div>

                {/* Main Infrastructure & Design Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
                    {services.map((service) => {
                        const Icon = service.icon;
                        return (
                            <Link
                                key={service.path}
                                to={service.path}
                                className={`group relative flex flex-col border-2 transition-all duration-200 bg-white p-8
${service.unavailable
                                    ? 'border-gray-200 opacity-80'
                                    : 'border-gray-200 hover:border-primary-600 hover:shadow-[8px_8px_0px_0px_rgba(79,70,229,0.1)]'
                                }`}                            >
                                {service.unavailable && (
                                    <div className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-widest bg-red-500 text-white px-2 py-1">
                                        Unavailable
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-black flex items-center justify-center rounded-none group-hover:bg-primary-600 transition-colors">
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h2 className="font-black text-3xl uppercase tracking-tight">{service.name}</h2>
                                </div>

                                <p className="text-gray-600 font-mono text-sm mb-8 leading-relaxed">
                                    {service.description}
                                </p>

                                <div className="mt-auto">
                                    <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 mb-4">Includes:</h3>
                                    <ul className="grid grid-cols-2 gap-2">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-xs font-mono text-gray-600">
                                                <div className="w-1.5 h-1.5 bg-primary-600" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-primary-600 font-mono text-sm uppercase tracking-widest">
                                        Select →
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Medesk Special Banner - Beautiful & Poppy Background */}
                <div className="w-full">
                    <Link
                        to="/saas/medesk"
                        className="group relative flex flex-col md:flex-row items-center justify-between bg-medesk-poppy text-[#F9F8F6] p-8 md:p-12 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-[#1f4439]"
                    >
                        {/* Background bespoke organic growth pattern overlay */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="organic_growth" patternUnits="userSpaceOnUse" width="120" height="120" patternTransform="rotate(15)">
                                        <path d="M60 10 C 65 30, 80 40, 90 40 S 110 30, 115 10 M10 60 C 30 65, 40 80, 40 90 S 30 110, 10 115 M60 110 C 55 90, 40 80, 30 80 S 10 90, 5 110 M110 60 C 90 55, 80 40, 80 30 S 90 10, 110 5" stroke="#F9F8F6" strokeWidth="0.5" fill="none" opacity="0.8"/>
                                        <path d="M30 30 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M90 90 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0" fill="#F9F8F6" opacity="0.5"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#organic_growth)" />
                            </svg>
                        </div>

                        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto mb-6 md:mb-0">
                            <div className="w-16 h-16 bg-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-md border border-[#E2E8E4]">
                                <Activity className="w-8 h-8 text-[#1C2321]" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest mb-2 border border-white/20">
                                    SaaS Product
                                </div>
                                <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-white mb-2 leading-none">MeDesk</h2>
                                <p className="text-[#AEC2BA] text-sm md:text-base max-w-lg font-light leading-relaxed">
                                    Precise, beautiful, and reliable clinic management. Designed to reduce doctor burnout and delight your patients.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 w-full md:w-auto flex justify-end">
                            <div className="bg-[#1C2321] text-white px-8 py-4 font-medium flex items-center gap-3 border border-[#3D7A68] group-hover:bg-[#F9F8F6] group-hover:text-[#1C2321] group-hover:border-[#F9F8F6] transition-colors shadow-lg">
                                Explore MeDesk <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                </div>
            </main>

            <footer className="h-1 w-full bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 mt-auto" />
        </div>
    );
};
const UnavailablePage = ({ service }) => (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="max-w-xl w-full border-2 border-gray-200 p-10 text-center">
            <h1 className="text-4xl font-black uppercase tracking-tight mb-4">
                {service} Temporarily Unavailable
            </h1>

            <p className="text-gray-600 font-mono text-sm mb-6 leading-relaxed">
                We're provisioning additional infrastructure and expanding availability.
            </p>

            <p className="text-gray-600 font-mono text-sm mb-8">
                New capacity is on the way and this service will return shortly.
            </p>

            <Link
                to="/"
                className="inline-block border-2 border-black px-6 py-2 text-xs font-mono uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
            >
                Browse Available Services
            </Link>

            <div className="mt-6 text-[11px] font-mono uppercase tracking-widest text-gray-400">
                Capacity Expansion In Progress
            </div>
        </div>
    </div>
);
// Main App with Router
function App() {
    const [currency, setCurrency] = useState('USD');

    // Detect timezone for INR on initial load
    useEffect(() => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') {
                setCurrency('INR');
            }
        } catch (e) {
            console.warn("Could not detect timezone");
        }
    }, []);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            <Router>
                <Routes>
                    <Route path="/" element={<ServiceSelection />} />
                    <Route path="/web-design" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <WebDesign currency={currency} />
                        </>
                    } />
                    <Route path="/hosting" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <Hosting currency={currency} />
                        </>
                    } />
                    <Route path="/vps" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <UnavailablePage service="Virtual Servers" />
                        </>
                    } />

                    <Route path="/dedicated" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <UnavailablePage service="Dedicated Servers" />
                        </>
                    } />
                    <Route path="/payment/status" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <PaymentStatus />
                        </>
                    } />
                    <Route path="/saas/*" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <SaasRouter />
                        </>
                    } />
                    {/* Payment routes */}
                    <Route path="/payment/success" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <PaymentSuccess />
                        </>
                    } />

                    <Route path="/payment/failed" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-3xl font-black mb-4">Payment Failed</h1>
                                    <p className="text-gray-600 mb-4">Please try again or contact support.</p>
                                    <Link to="/hosting" className="text-primary-600 underline">Return to Hosting</Link>
                                </div>
                            </div>
                        </>
                    } />
                    <Route path="/payment/cancelled" element={
                        <>
                            <Header currency={currency} setCurrency={setCurrency} />
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-3xl font-black mb-4">Payment Cancelled</h1>
                                    <p className="text-gray-600 mb-4">You cancelled the payment process.</p>
                                    <Link to="/hosting" className="text-primary-600 underline">Return to Hosting</Link>
                                </div>
                            </div>
                        </>
                    } />
                </Routes>
            </Router>
        </CurrencyContext.Provider>
    );
}

export default App;