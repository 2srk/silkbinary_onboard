import React, { useState } from 'react';
import {
    Layout, ArrowRight, CheckCircle2, Check, User, Phone, Mail,
    Lock, Terminal, Server, MapPin, Cpu, HardDrive, Network, Shield, Key, Globe, Database, MemoryStick
} from 'lucide-react';

const CustomStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        .animate-slide-left { animation: slideLeft 0.4s ease-out forwards; }
        @keyframes slideLeft {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        input:focus ~ .icon-focus { color: #000; }
        
        /* Brutalist Range Slider */
        input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            background: #000;
            cursor: pointer;
            margin-top: -10px;
            border-radius: 0;
            border: 2px solid #000;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #e5e7eb;
        }
    `}} />
);

const DEDICATED_PLAN = {
    name: "Enterprise Dual-Xeon Bare Metal",
    basePrice: 22000,
    cpu: "2x Intel Xeon 2680v4 (28C / 56T)",
    turbo: "3.3 GHz Turbo",
    baseStorageGb: 1600, // 2x800GB
    baseStorageText: "2 x 800GB SAS SSD (RAID 1)",
    baseRamGb: 256,
    baseRamText: "256GB DDR4",
    ip: "1 Free Dedicated IP (Up to /29 available)",
    network: "1Gbps on 10G Port (Unlimited Bandwidth)",
    support: "24/7/365 Dedicated Support",
    location: "India"
};

const OS_OPTIONS = [
    { id: 'ubuntu24', name: 'Ubuntu 24.04 LTS' },
    { id: 'debian12', name: 'Debian 12' },
    { id: 'almalinux9', name: 'AlmaLinux 9' },
    { id: 'centos9', name: 'CentOS Stream 9' },
    { id: 'windows2022', name: 'Windows Server 2022' },
];

const StepIndicator = ({ currentStep, steps }) => (
    <div className="flex items-center w-full max-w-5xl mx-auto mb-12">
        {steps.map((step, idx) => {
            const isActive = currentStep === idx + 1;
            const isPast = currentStep > idx + 1;
            return (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 flex items-center justify-center font-mono text-sm border-2 transition-colors ${
                            isActive ? 'border-red-600 bg-red-600 text-white font-bold' :
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
    const steps = ["Specs", "Resources", "System", "Config", "Account", "Deploy"];
    const [step, setStep] = useState(1);

    // Resource Scaling States
    // Max storage: 12TB (12000GB) -> Base is 1600. Max additional = 10400GB. Steps of 200GB.
    const [extraStorage, setExtraStorage] = useState(0);
    // Max RAM: 512GB -> Base is 256. Max additional = 256GB. Steps of 16GB.
    const [extraRam, setExtraRam] = useState(0);

    const [config, setConfig] = useState({ hostname: '', rootPassword: '', sshKey: '' });
    const [system, setSystem] = useState({ os: 'ubuntu24', cpanel: false });
    const [account, setAccount] = useState({ name: '', email: '', phone: '', password: '' });
    const [isLogin, setIsLogin] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState([]);

    const getRamCost = () => (extraRam / 16) * 5500;
    const getStorageCost = () => (extraStorage / 200) * 7000;

    const getTotalPrice = () => {
        let total = DEDICATED_PLAN.basePrice + getRamCost() + getStorageCost();
        if (system.cpanel) total += 3000;
        return total;
    };

    const nextStep = () => window.scrollTo(0,0) || setStep(prev => prev + 1);
    const prevStep = () => window.scrollTo(0,0) || setStep(prev => prev - 1);

    const handleDeploy = () => {
        setIsDeploying(true);
        setDeployLogs(["Initiating Bare Metal IPMI commands...", "Booting Dual Xeon 2680v4..."]);
        setTimeout(() => {
            setDeployLogs(prev => [...prev, `Verifying ${DEDICATED_PLAN.baseRamGb + extraRam}GB DDR4 RAM Allocation...`, `Configuring Hardware RAID for ${(DEDICATED_PLAN.baseStorageGb + extraStorage)/1000}TB Storage...`]);
            setTimeout(() => {
                setDeployLogs(prev => [...prev, "Assigning 1Gbps Network Uplink...", `Flashing ${OS_OPTIONS.find(o => o.id === system.os).name} image to drives...`]);
                if (system.cpanel) {
                    setTimeout(() => setDeployLogs(prev => [...prev, "Executing cPanel Bare Metal optimization script..."]), 1000);
                }
                setTimeout(() => {
                    setDeployLogs(prev => [
                        ...prev,
                        "SUCCESS: Bare Metal Server is online.",
                        "STATUS: Handing over root control.",
                        "Redirecting..."
                    ]);
                }, system.cpanel ? 3000 : 1500);
            }, 1500);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col relative">
            <CustomStyles />
            <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-6 py-12">
                <StepIndicator currentStep={step} steps={steps} />

                {/* STEP 1: SPECIFICATIONS */}
                {step === 1 && (
                    <div className="w-full animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Dedicated Bare Metal</h1>
                            <p className="text-gray-500 font-mono text-sm">Enterprise-grade isolated infrastructure.</p>
                        </div>
                        <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-3xl mx-auto mb-10">
                            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">{DEDICATED_PLAN.name}</h2>
                                    <p className="font-mono text-gray-500 text-sm mt-1 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Hosted in {DEDICATED_PLAN.location}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black">₹{DEDICATED_PLAN.basePrice}</span>
                                    <span className="font-mono text-gray-500 text-sm block">/ month base</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-sm">
                                <div className="flex items-start gap-4">
                                    <Cpu className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-black uppercase">Processing Power</p>
                                        <p className="text-gray-600">{DEDICATED_PLAN.cpu}</p>
                                        <p className="text-gray-500 text-xs">{DEDICATED_PLAN.turbo}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <HardDrive className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-black uppercase">Base Storage & RAM</p>
                                        <p className="text-gray-600">{DEDICATED_PLAN.baseRamText}</p>
                                        <p className="text-gray-500 text-xs">{DEDICATED_PLAN.baseStorageText}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Network className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-black uppercase">Network Infrastructure</p>
                                        <p className="text-gray-600">{DEDICATED_PLAN.network}</p>
                                        <p className="text-gray-500 text-xs">{DEDICATED_PLAN.ip}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-10 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                Scale Resources <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: RESOURCES SLIDERS */}
                {step === 2 && (
                    <div className="w-full max-w-3xl animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Scale Resources</h1>
                            <p className="text-gray-500 font-mono text-sm">Upgrade memory and storage beyond base specifications.</p>
                        </div>

                        <div className="space-y-10">
                            {/* RAM Slider */}
                            <div className="border-2 border-gray-200 p-8 bg-gray-50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-100"><Database className="w-6 h-6 text-red-600" /></div>
                                        <div>
                                            <h3 className="font-black uppercase text-xl">System Memory (RAM)</h3>
                                            <p className="font-mono text-sm text-gray-500">+₹5,500 per 16GB Block</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-2xl block">{DEDICATED_PLAN.baseRamGb + extraRam} GB</span>
                                        <span className="font-mono text-xs text-gray-500 uppercase block">+₹{getRamCost()} / mo</span>
                                    </div>
                                </div>
                                <input type="range" min="0" max="256" step="16" value={extraRam} onChange={(e) => setExtraRam(Number(e.target.value))} />
                                <div className="flex justify-between mt-2 font-mono text-xs text-gray-400">
                                    <span>Base: 256GB</span>
                                    <span>Max: 512GB</span>
                                </div>
                            </div>

                            {/* Storage Slider */}
                            <div className="border-2 border-gray-200 p-8 bg-gray-50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-red-100"><HardDrive className="w-6 h-6 text-red-600" /></div>
                                        <div>
                                            <h3 className="font-black uppercase text-xl">Storage Drives</h3>
                                            <p className="font-mono text-sm text-gray-500">+₹7,000 per 200GB Block</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-2xl block">{(DEDICATED_PLAN.baseStorageGb + extraStorage) >= 1000 ? ((DEDICATED_PLAN.baseStorageGb + extraStorage)/1000).toFixed(1) + ' TB' : (DEDICATED_PLAN.baseStorageGb + extraStorage) + ' GB'}</span>
                                        <span className="font-mono text-xs text-gray-500 uppercase block">+₹{getStorageCost()} / mo</span>
                                    </div>
                                </div>
                                <input type="range" min="0" max="10400" step="200" value={extraStorage} onChange={(e) => setExtraStorage(Number(e.target.value))} />
                                <div className="flex justify-between mt-2 font-mono text-xs text-gray-400">
                                    <span>Base: 1.6TB</span>
                                    <span>Max: 12TB</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-between pt-6 border-t border-gray-200">
                            <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black">← Back</button>
                            <button onClick={nextStep} className="bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest flex items-center gap-3">
                                Select OS <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: SYSTEM */}
                {step === 3 && (
                    <div className="w-full max-w-4xl animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Operating System</h1>
                            <p className="text-gray-500 font-mono text-sm">Choose OS and add control panels.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                            {OS_OPTIONS.map(os => {
                                const isSelected = system.os === os.id;
                                return (
                                    <label key={os.id} className={`flex flex-col p-4 border-2 cursor-pointer transition-all ${isSelected ? 'border-red-600 bg-red-50/50 shadow-[4px_4px_0px_0px_rgba(220,38,38,0.2)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <input type="radio" name="os" value={os.id} checked={isSelected} onChange={e => setSystem({...system, os: e.target.value})} className="hidden" />
                                        <div className="flex justify-between items-start mb-4">
                                            <Terminal className={`w-6 h-6 ${isSelected ? 'text-red-600' : 'text-gray-400'}`} />
                                            <div className={`w-4 h-4 border-2 flex items-center justify-center ${isSelected ? 'border-red-600' : 'border-gray-300'}`}>
                                                {isSelected && <div className="w-2 h-2 bg-red-600" />}
                                            </div>
                                        </div>
                                        <span className={`font-mono font-bold text-sm ${isSelected ? 'text-red-900' : 'text-gray-700'}`}>{os.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <h3 className="font-black uppercase tracking-tight text-xl mb-4 border-t-2 border-gray-100 pt-8">Software Add-ons</h3>
                        <label className={`flex items-center p-6 border-2 cursor-pointer transition-all ${system.cpanel ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="checkbox" checked={system.cpanel} onChange={e => setSystem({...system, cpanel: e.target.checked})} className="hidden" />
                            <div className={`w-6 h-6 border-2 mr-6 flex items-center justify-center transition-colors ${system.cpanel ? 'border-black bg-black' : 'border-gray-300 bg-white'}`}>
                                {system.cpanel && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                                <span className="font-black text-lg uppercase block">cPanel / WHM Dedicated</span>
                                <span className="font-mono text-sm text-gray-500 block mt-1">Full Bare-Metal license. Automated deployment.</span>
                            </div>
                            <div className="text-right ml-4">
                                <span className="font-mono font-bold text-lg block">+₹3,000</span>
                                <span className="font-mono text-xs text-gray-500 uppercase">/ month</span>
                            </div>
                        </label>
                        <div className="mt-12 flex justify-between">
                            <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black">← Back</button>
                            <button onClick={nextStep} className="bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest flex items-center gap-3">
                                Server Details <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: CONFIG */}
                {step === 4 && (
                    <div className="w-full max-w-2xl animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Server Setup</h1>
                            <p className="text-gray-500 font-mono text-sm">Identity and Root Authentication.</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Server Hostname</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                    <input required type="text" placeholder="dedicated.yourdomain.com" value={config.hostname} onChange={e => setConfig({...config, hostname: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Root Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                    <input required minLength={12} type="password" placeholder="Use strong password" value={config.rootPassword} onChange={e => setConfig({...config, rootPassword: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">SSH Key (Recommended)</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-6 w-5 h-5 text-gray-400 icon-focus" />
                                    <textarea placeholder="ssh-rsa AAAAB3NzaC1..." rows={4} value={config.sshKey} onChange={e => setConfig({...config, sshKey: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono resize-none" />
                                </div>
                            </div>
                            <div className="mt-10 flex justify-between pt-6 border-t border-gray-200">
                                <button type="button" onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black">← Back</button>
                                <button type="submit" className="bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest flex items-center gap-3">
                                    Account <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* STEP 5: ACCOUNT */}
                {step === 5 && (
                    <div className="w-full max-w-xl animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{isLogin ? 'Login' : 'Registration'}</h1>
                            <p className="text-gray-500 font-mono text-sm">Link this server to your account.</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                            {!isLogin && (
                                <div className="animate-slide-left">
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                        <input required={!isLogin} type="text" placeholder="Full Name" value={account.name} onChange={e => setAccount({...account, name: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black transition-all font-mono" />
                                    </div>
                                </div>
                            )}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                <input required type="email" placeholder="Email Address" value={account.email} onChange={e => setAccount({...account, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black transition-all font-mono" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                <input required type="password" placeholder="Password" value={account.password} onChange={e => setAccount({...account, password: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black transition-all font-mono" />
                            </div>
                            <button type="submit" className="w-full bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest flex justify-center gap-3 hover:bg-gray-800">
                                Proceed to Summary <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button onClick={() => setIsLogin(!isLogin)} className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black hover:underline">
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 6: DEPLOY */}
                {step === 6 && (
                    <div className="w-full max-w-4xl animate-slide-left">
                        {!isDeploying ? (
                            <>
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Final Review</h1>
                                    <p className="text-gray-500 font-mono text-sm">Verify Bare Metal configuration.</p>
                                </div>
                                <div className="border-2 border-gray-200 p-8 mb-8 bg-gray-50">
                                    <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-6 border-b border-gray-200 pb-2">Hardware Manifest</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-sm mb-8">
                                        <div><span className="block text-gray-400 text-xs mb-1 uppercase">CPU</span><span className="font-bold">2x Xeon 2680v4</span></div>
                                        <div><span className="block text-gray-400 text-xs mb-1 uppercase">RAM</span><span className="font-bold text-red-600">{DEDICATED_PLAN.baseRamGb + extraRam}GB</span></div>
                                        <div><span className="block text-gray-400 text-xs mb-1 uppercase">Storage</span><span className="font-bold text-red-600">{(DEDICATED_PLAN.baseStorageGb + extraStorage)/1000}TB</span></div>
                                        <div><span className="block text-gray-400 text-xs mb-1 uppercase">OS</span><span className="font-bold">{OS_OPTIONS.find(o => o.id === system.os)?.name}</span></div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-6">
                                        <div className="flex justify-between items-center mb-2 font-mono">
                                            <span>Base Server</span>
                                            <span>₹{DEDICATED_PLAN.basePrice}</span>
                                        </div>
                                        {extraRam > 0 && <div className="flex justify-between items-center mb-2 font-mono text-gray-600"><span>Extra RAM (+{extraRam}GB)</span><span>₹{getRamCost()}</span></div>}
                                        {extraStorage > 0 && <div className="flex justify-between items-center mb-2 font-mono text-gray-600"><span>Extra Storage (+{extraStorage}GB)</span><span>₹{getStorageCost()}</span></div>}
                                        {system.cpanel && <div className="flex justify-between items-center mb-2 font-mono text-red-700"><span>cPanel License</span><span>₹3,000</span></div>}
                                        <div className="flex justify-between items-end mt-6 pt-6 border-t border-gray-200">
                                            <span className="block text-gray-400 text-xs uppercase font-mono">Monthly Total</span>
                                            <div className="text-right">
                                                <span className="font-black text-4xl text-black block">₹{getTotalPrice()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                                    <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black">← Back</button>
                                    <button onClick={handleDeploy} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest flex items-center gap-3">
                                        Provision Hardware <Server className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="bg-[#050505] rounded-none overflow-hidden shadow-2xl border-2 border-black animate-slide-left">
                                <div className="bg-[#111] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                                    <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                                    <div className="flex-1 text-center font-mono text-[10px] text-gray-400 uppercase tracking-widest">IPMI KVM — {config.hostname}</div>
                                </div>
                                <div className="p-6 font-mono text-sm min-h-[350px] text-gray-300">
                                    {deployLogs.map((log, idx) => (
                                        <div key={idx} className="flex gap-4 mb-2 animate-slide-left">
                                            <span className="text-gray-600">[{new Date().toISOString().substring(11, 19)}]</span>
                                            <span className={log.includes("SUCCESS") ? "text-green-400 font-bold" : log.includes("STATUS") ? "text-blue-400" : "text-gray-300"}>{log}</span>
                                        </div>
                                    ))}
                                    {deployLogs.length < 5 && (
                                        <div className="flex gap-4 mb-2">
                                            <span className="text-gray-600">[{new Date().toISOString().substring(11, 19)}]</span>
                                            <span className="w-2 h-4 bg-gray-300 animate-pulse inline-block" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}