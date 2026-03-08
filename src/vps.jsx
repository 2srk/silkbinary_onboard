import React, { useState } from 'react';
import {
    Layout, ArrowRight, CheckCircle2, Check, User, Phone, Mail,
    Lock, Terminal, Server, MapPin, Cpu, HardDrive, Network, Shield, Key, Globe
} from 'lucide-react';

const CustomStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        .animate-slide-left { animation: slideLeft 0.4s ease-out forwards; }
        @keyframes slideLeft {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        input:focus ~ .icon-focus { color: #000; }
    `}} />
);

const VPS_PLAN = {
    name: "Enterprise NVMe VPS",
    basePrice: 6500, // Assumed base price for calculation
    cpu: "AMD EPYC 9554 (8 vCPU)",
    turbo: "3.75 GHz Turbo Frequency",
    storage: "400 GB NVMe SSD (RAID 5)",
    ram: "32 GB DDR5",
    ip: "1 Free Dedicated IP",
    access: "Full Root Access",
    location: "India",
    bandwidth: "48 TB",
    support: "24/7/365 Dedicated Support",
    migration: "Free Migration"
};

const OS_OPTIONS = [
    { id: 'ubuntu24', name: 'Ubuntu 24.04 LTS', family: 'linux' },
    { id: 'ubuntu22', name: 'Ubuntu 22.04 LTS', family: 'linux' },
    { id: 'debian12', name: 'Debian 12', family: 'linux' },
    { id: 'almalinux9', name: 'AlmaLinux 9', family: 'linux' },
    { id: 'rocky9', name: 'Rocky Linux 9', family: 'linux' },
    { id: 'windows2022', name: 'Windows Server 2022', family: 'windows' },
];

const StepIndicator = ({ currentStep, steps }) => (
    <div className="flex items-center w-full max-w-4xl mx-auto mb-12">
        {steps.map((step, idx) => {
            const isActive = currentStep === idx + 1;
            const isPast = currentStep > idx + 1;
            return (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center relative z-10">
                        <div className={`w-8 h-8 flex items-center justify-center font-mono text-sm border-2 transition-colors ${
                            isActive ? 'border-blue-600 bg-blue-600 text-white font-bold' :
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
    const steps = ["Specs", "System", "Config", "Account", "Deploy"];
    const [step, setStep] = useState(1);

    const [config, setConfig] = useState({
        hostname: '',
        rootPassword: '',
        sshKey: ''
    });

    const [system, setSystem] = useState({
        os: 'ubuntu24',
        cpanel: false
    });

    const [account, setAccount] = useState({ name: '', email: '', phone: '', password: '' });
    const [isLogin, setIsLogin] = useState(false);

    const [isDeploying, setIsDeploying] = useState(false);
    const [deployLogs, setDeployLogs] = useState([]);

    const getTotalPrice = () => {
        let total = VPS_PLAN.basePrice;
        if (system.cpanel) total += 3000;
        return total;
    };

    const nextStep = () => window.scrollTo(0,0) || setStep(prev => prev + 1);
    const prevStep = () => window.scrollTo(0,0) || setStep(prev => prev - 1);

    const handleDeploy = () => {
        setIsDeploying(true);
        setDeployLogs(["Initializing hypervisor connection...", "Allocating AMD EPYC 9554 resources..."]);

        setTimeout(() => {
            setDeployLogs(prev => [...prev, `Provisioning 400GB NVMe storage in RAID 5...`, "Assigning Dedicated IP..."]);
            setTimeout(() => {
                setDeployLogs(prev => [...prev, `Installing ${OS_OPTIONS.find(o => o.id === system.os).name}...`, "Configuring root access credentials..."]);
                if (system.cpanel) {
                    setTimeout(() => {
                        setDeployLogs(prev => [...prev, "Running cPanel/WHM installation script..."]);
                    }, 800);
                }
                setTimeout(() => {
                    setDeployLogs(prev => [
                        ...prev,
                        "SUCCESS: Server provisioned successfully.",
                        "STATUS: Online and accessible.",
                        "Redirecting to Client Area..."
                    ]);
                }, system.cpanel ? 2500 : 1500);
            }, 1000);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col relative">
            <CustomStyles />
            <main className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto px-6 py-12">
                <StepIndicator currentStep={step} steps={steps} />

                {/* STEP 1: SPECIFICATIONS */}
                {step === 1 && (
                    <div className="w-full animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">High-Performance VPS</h1>
                            <p className="text-gray-500 font-mono text-sm">Review your base instance specifications.</p>
                        </div>

                        <div className="border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-3xl mx-auto mb-10">
                            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">{VPS_PLAN.name}</h2>
                                    <p className="font-mono text-gray-500 text-sm mt-1 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Hosted in {VPS_PLAN.location}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black">₹{VPS_PLAN.basePrice}</span>
                                    <span className="font-mono text-gray-500 text-sm block">/ month</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm">
                                <div className="flex items-start gap-4">
                                    <Cpu className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-black uppercase">Compute</p>
                                        <p className="text-gray-600">{VPS_PLAN.cpu}</p>
                                        <p className="text-gray-500 text-xs">{VPS_PLAN.turbo}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <HardDrive className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-black uppercase">Memory & Storage</p>
                                        <p className="text-gray-600">{VPS_PLAN.ram}</p>
                                        <p className="text-gray-500 text-xs">{VPS_PLAN.storage}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Network className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-black uppercase">Network</p>
                                        <p className="text-gray-600">{VPS_PLAN.bandwidth} Bandwidth</p>
                                        <p className="text-gray-500 text-xs">{VPS_PLAN.ip}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-black uppercase">Features</p>
                                        <p className="text-gray-600">{VPS_PLAN.access}</p>
                                        <p className="text-gray-500 text-xs">{VPS_PLAN.support}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button onClick={nextStep} className="bg-black hover:bg-gray-800 text-white px-10 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                Configure System <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: OPERATING SYSTEM */}
                {step === 2 && (
                    <div className="w-full max-w-4xl animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Operating System</h1>
                            <p className="text-gray-500 font-mono text-sm">Select your OS and control panel addons.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                            {OS_OPTIONS.map(os => {
                                const isSelected = system.os === os.id;
                                return (
                                    <label key={os.id} className={`flex flex-col p-4 border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50/50 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.2)]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                        <input type="radio" name="os" value={os.id} checked={isSelected} onChange={e => setSystem({...system, os: e.target.value})} className="hidden" />
                                        <div className="flex justify-between items-start mb-4">
                                            <Terminal className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <div className={`w-4 h-4 border-2 flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
                                                {isSelected && <div className="w-2 h-2 bg-blue-600" />}
                                            </div>
                                        </div>
                                        <span className={`font-mono font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{os.name}</span>
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
                                <span className="font-black text-lg uppercase block">cPanel / WHM License</span>
                                <span className="font-mono text-sm text-gray-500 block mt-1">Industry standard hosting control panel. Fully managed installation.</span>
                            </div>
                            <div className="text-right ml-4">
                                <span className="font-mono font-bold text-lg block">+₹3,000</span>
                                <span className="font-mono text-xs text-gray-500 uppercase">/ month</span>
                            </div>
                        </label>

                        <div className="mt-12 flex justify-between">
                            <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors">← Back</button>
                            <button onClick={nextStep} className="bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                Server Details <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: SERVER CONFIG */}
                {step === 3 && (
                    <div className="w-full max-w-2xl animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Server Details</h1>
                            <p className="text-gray-500 font-mono text-sm">Configure your network identity and access credentials.</p>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Hostname (FQDN)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus transition-colors" />
                                    <input required type="text" placeholder="server1.yourdomain.com"
                                           value={config.hostname} onChange={e => setConfig({...config, hostname: e.target.value})}
                                           className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Root Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus transition-colors" />
                                    <input required minLength={8} type="password" placeholder="Ensure it is highly secure"
                                           value={config.rootPassword} onChange={e => setConfig({...config, rootPassword: e.target.value})}
                                           className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">SSH Key (Optional)</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-6 w-5 h-5 text-gray-400 icon-focus transition-colors" />
                                    <textarea placeholder="ssh-rsa AAAAB3NzaC1..." rows={4}
                                              value={config.sshKey} onChange={e => setConfig({...config, sshKey: e.target.value})}
                                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-10 flex justify-between pt-6 border-t border-gray-200">
                                <button type="button" onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors">← Back</button>
                                <button type="submit" className="bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-3">
                                    Account Setup <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* STEP 4: ACCOUNT */}
                {step === 4 && (
                    <div className="w-full max-w-xl animate-slide-left">
                        <div className="mb-10 text-center">
                            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">{isLogin ? 'Client Login' : 'Create Account'}</h1>
                            <p className="text-gray-500 font-mono text-sm">Account required to manage your infrastructure.</p>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                            {!isLogin && (
                                <div className="animate-slide-left">
                                    <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                        <input required={!isLogin} type="text" placeholder="John Doe" value={account.name} onChange={e => setAccount({...account, name: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                    <input required type="email" placeholder="admin@domain.com" value={account.email} onChange={e => setAccount({...account, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 icon-focus" />
                                    <input required type="password" placeholder="••••••••" value={account.password} onChange={e => setAccount({...account, password: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:border-black focus:bg-white transition-all font-mono" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest flex justify-center gap-3 hover:bg-gray-800 transition-colors">
                                    Review & Checkout <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center">
                            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-xs font-mono uppercase tracking-widest text-gray-500 hover:text-black hover:underline transition-all">
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                            </button>
                        </div>
                        <div className="mt-8 flex justify-start">
                            <button onClick={prevStep} className="px-6 py-3 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black transition-colors">← Back</button>
                        </div>
                    </div>
                )}

                {/* STEP 5: REVIEW & DEPLOY */}
                {step === 5 && (
                    <div className="w-full max-w-4xl animate-slide-left">
                        {!isDeploying ? (
                            <>
                                <div className="mb-10 text-center">
                                    <h1 className="text-4xl font-black uppercase tracking-tight mb-2">Final Review</h1>
                                    <p className="text-gray-500 font-mono text-sm">Verify configuration before deployment.</p>
                                </div>
                                <div className="border-2 border-gray-200 p-8 mb-8 bg-gray-50">
                                    <h3 className="font-bold uppercase tracking-widest text-sm text-gray-400 mb-6 border-b border-gray-200 pb-2">Order Manifest</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-sm mb-8">
                                        <div>
                                            <span className="block text-gray-400 text-xs mb-1 uppercase">Instance</span>
                                            <span className="font-bold">{VPS_PLAN.name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs mb-1 uppercase">Hostname</span>
                                            <span className="font-bold">{config.hostname}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs mb-1 uppercase">Operating System</span>
                                            <span className="font-bold">{OS_OPTIONS.find(o => o.id === system.os)?.name}</span>
                                        </div>
                                        <div>
                                            <span className="block text-gray-400 text-xs mb-1 uppercase">Account Email</span>
                                            <span className="font-bold break-all">{account.email}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 pt-6">
                                        <div className="flex justify-between items-center mb-2 font-mono">
                                            <span>Base Instance ({VPS_PLAN.cpu})</span>
                                            <span>₹{VPS_PLAN.basePrice}</span>
                                        </div>
                                        {system.cpanel && (
                                            <div className="flex justify-between items-center mb-2 font-mono text-blue-700">
                                                <span>cPanel / WHM License</span>
                                                <span>₹3,000</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end mt-6 pt-6 border-t border-gray-200">
                                            <span className="block text-gray-400 text-xs uppercase font-mono">Total Due Today</span>
                                            <div className="text-right">
                                                <span className="font-black text-4xl text-black block">₹{getTotalPrice()}</span>
                                                <span className="font-mono text-gray-500 text-xs uppercase">/ month</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                                    <button onClick={prevStep} className="px-6 py-4 font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-black">← Back</button>
                                    <button onClick={handleDeploy} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-mono text-sm uppercase tracking-widest flex items-center gap-3">
                                        Deploy Server <Server className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="bg-[#0a0a0a] rounded-none overflow-hidden shadow-2xl border-2 border-black animate-slide-left">
                                <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 border-b border-gray-800">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="flex-1 text-center font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                                        Deploying {config.hostname}
                                    </div>
                                </div>
                                <div className="p-6 font-mono text-sm min-h-[350px] text-green-400 bg-[#0a0a0a]">
                                    {deployLogs.map((log, idx) => (
                                        <div key={idx} className="flex gap-4 mb-2 animate-slide-left">
                                            <span className="text-gray-600 whitespace-nowrap">[{new Date().toISOString().substring(11, 19)}]</span>
                                            <span className={log.includes("SUCCESS") ? "text-blue-400 font-bold" : log.includes("STATUS") ? "text-yellow-400" : ""}>{log}</span>
                                        </div>
                                    ))}
                                    {deployLogs.length < 5 && (
                                        <div className="flex gap-4 mb-2">
                                            <span className="text-gray-600 whitespace-nowrap">[{new Date().toISOString().substring(11, 19)}]</span>
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-4 bg-green-400 animate-pulse inline-block" />
                                            </span>
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