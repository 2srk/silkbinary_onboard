// PS.jsx - Payment Status Page
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { CustomStyles } from './App';

const PaymentStatus = () => {
    const [status, setStatus] = useState('checking'); // checking, pending, processing, failed, timeout
    const [orderId, setOrderId] = useState(null);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // Get order ID from localStorage (saved during checkout)

        const pendingOrder = JSON.parse(localStorage.getItem('pendingOrder'));

        console.log('[PaymentStatus] Pending order from localStorage:', pendingOrder);

        if (!pendingOrder || !pendingOrder.orderId) {
            setStatus('error');
            setError('No pending order found. Please start checkout again.');
            return;
        }

        const currentOrderId = pendingOrder.orderId;
        setOrderId(currentOrderId);

        console.log(`[PaymentStatus] Checking status for order: ${currentOrderId}`);

        // Set up polling
        let pollCount = 0;
        const maxPolls = 40; // 40 * 3 seconds = 2 minutes max
        const pollInterval = 3000; // 3 seconds

        const checkStatus = async () => {
            try {
                pollCount++;
                console.log(`[PaymentStatus] Poll #${pollCount} for order: ${currentOrderId}`);

                const res = await fetch(`https://sbinapi.plak.in/api/payment/status/${currentOrderId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });

                if (!res.ok) {
                    throw new Error(`HTTP error ${res.status}`);
                }

                const data = await res.json();
                console.log('[PaymentStatus] Status response:', data);

                setPaymentDetails(data);

                // Handle different statuses
                if (data.status === 'processing' || data.status === 'paid') {
                    // Payment successful
                    setStatus('success');
                    localStorage.removeItem('pendingOrder');
                    clearInterval(interval);

                    setTimeout(() => {
                        navigate(`/payment/success?orderId=${currentOrderId}`);
                    }, 3000);

                } else if (data.status === 'payment_failed' || data.status === 'failed') {
                    // Payment failed
                    setStatus('failed');
                    localStorage.removeItem('pendingOrder');
                    clearInterval(interval);

                } else if (data.status === 'payment_pending' || data.status === 'pending') {
                    // Still pending
                    setStatus('pending');
                }

                } else if (pollCount >= maxPolls) {
                    // Timeout after max polls
                    setStatus('timeout');
                    clearInterval(interval);
                }

            } catch (err) {
                console.error('[PaymentStatus] Status check error:', err);
                setError(err.message);

                // Don't clear interval on error, keep trying
                if (pollCount >= maxPolls) {
                    setStatus('timeout');
                    clearInterval(interval);
                }
            }
        };

        // Start polling
        const interval = setInterval(checkStatus, pollInterval);

        // Initial check
        checkStatus();

        // Cleanup
        return () => {
            clearInterval(interval);
        };
    }, [navigate]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setStatus('checking');
        setError(null);

        // Re-run the effect by forcing a re-render
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    const handleBackToServices = () => {
        localStorage.removeItem('pendingOrder');
        navigate('/hosting');
    };

    // Render based on status
    const renderContent = () => {
        switch (status) {
            case 'checking':
                return (
                    <div className="text-center animate-slide-left">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 mx-auto relative">
                                <div className="absolute inset-0 rounded-full border-4 border-primary-200"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
                                <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-primary-600 animate-pulse" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Verifying Payment</h1>
                        <p className="text-gray-600 font-mono text-sm mb-6 max-w-md mx-auto">
                            Please wait while we confirm your payment with the payment gateway. This may take a few moments.
                        </p>

                        {orderId && (
                            <div className="inline-block border border-gray-200 bg-gray-50 px-4 py-2 mb-4">
                                <span className="text-xs font-mono text-gray-500">Order ID: </span>
                                <span className="text-sm font-mono font-bold">{orderId}</span>
                            </div>
                        )}

                        <div className="flex justify-center gap-2">
                            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                );

            case 'pending':
                return (
                    <div className="text-center animate-slide-left">
                        <div className="mb-8">
                            <Clock className="w-20 h-20 text-yellow-500 mx-auto" />
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Payment Pending</h1>
                        <p className="text-gray-600 font-mono text-sm mb-4 max-w-md mx-auto">
                            Your payment is still being processed. This can take up to a few minutes.
                        </p>

                        {orderId && (
                            <div className="inline-block border border-gray-200 bg-gray-50 px-4 py-2 mb-6">
                                <span className="text-xs font-mono text-gray-500">Order ID: </span>
                                <span className="text-sm font-mono font-bold">{orderId}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3 text-yellow-600 bg-yellow-50 border-l-4 border-yellow-500 p-4 max-w-md mx-auto">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-xs font-mono text-left">
                                Don't close this window. We'll automatically update you when the payment is confirmed.
                            </p>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center animate-slide-left">
                        <div className="mb-8 relative">
                            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <div className="absolute top-0 right-1/2 translate-x-12">
                                <div className="w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                            </div>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Payment Successful!</h1>
                        <p className="text-gray-600 font-mono text-sm mb-6 max-w-md mx-auto">
                            Your payment has been confirmed. We're now setting up your hosting environment.
                        </p>

                        {orderId && (
                            <div className="inline-block border border-green-200 bg-green-50 px-4 py-2 mb-6">
                                <span className="text-xs font-mono text-green-700">Order ID: </span>
                                <span className="text-sm font-mono font-bold text-green-800">{orderId}</span>
                            </div>
                        )}

                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 max-w-md mx-auto mb-6">
                            <p className="text-xs font-mono text-blue-800">
                                You will receive a confirmation email shortly with your login credentials and setup instructions.
                            </p>
                        </div>

                        <p className="text-xs text-gray-400 font-mono mb-4">
                            Redirecting to success page in 3 seconds...
                        </p>

                        <button
                            onClick={() => navigate(`/payment/success?orderId=${orderId}`)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-mono text-sm uppercase tracking-widest transition-colors"
                        >
                            Continue Now
                        </button>
                    </div>
                );

            case 'failed':
                return (
                    <div className="text-center animate-slide-left">
                        <div className="mb-8">
                            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Payment Failed</h1>
                        <p className="text-gray-600 font-mono text-sm mb-4 max-w-md mx-auto">
                            We couldn't process your payment. This could be due to insufficient funds or a technical issue.
                        </p>

                        {orderId && (
                            <div className="inline-block border border-red-200 bg-red-50 px-4 py-2 mb-6">
                                <span className="text-xs font-mono text-red-700">Order ID: </span>
                                <span className="text-sm font-mono font-bold text-red-800">{orderId}</span>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleRetry}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-mono text-sm uppercase tracking-widest transition-colors flex items-center gap-2 justify-center"
                            >
                                <RefreshCw className="w-4 h-4" /> Try Again
                            </button>
                            <button
                                onClick={handleBackToServices}
                                className="border-2 border-gray-300 hover:border-black px-8 py-3 font-mono text-sm uppercase tracking-widest transition-colors"
                            >
                                Back to Services
                            </button>
                        </div>
                    </div>
                );

            case 'timeout':
                return (
                    <div className="text-center animate-slide-left">
                        <div className="mb-8">
                            <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-12 h-12 text-yellow-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Still Processing</h1>
                        <p className="text-gray-600 font-mono text-sm mb-4 max-w-md mx-auto">
                            Your payment is taking longer than expected. Don't worry - this can happen sometimes.
                        </p>

                        <p className="text-sm font-mono text-gray-500 mb-6">
                            We'll send you an email once the payment is confirmed.
                        </p>

                        {orderId && (
                            <div className="inline-block border border-gray-200 bg-gray-50 px-4 py-2 mb-6">
                                <span className="text-xs font-mono text-gray-500">Order ID: </span>
                                <span className="text-sm font-mono font-bold">{orderId}</span>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleRetry}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors"
                            >
                                Check Again
                            </button>
                            <button
                                onClick={handleBackToServices}
                                className="border-2 border-gray-300 hover:border-black px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors"
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                );

            case 'error':
            default:
                return (
                    <div className="text-center animate-slide-left">
                        <div className="mb-8">
                            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-12 h-12 text-red-600" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tight mb-3">Something Went Wrong</h1>
                        <p className="text-gray-600 font-mono text-sm mb-4 max-w-md mx-auto">
                            {error || 'An unexpected error occurred while checking your payment status.'}
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={handleRetry}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={handleBackToServices}
                                className="border-2 border-gray-300 hover:border-black px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors"
                            >
                                Back to Services
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
            <CustomStyles />

            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="max-w-2xl w-full">
                    {/* Status card */}
                    <div className="border-2 border-gray-200 bg-white p-8 md:p-12 shadow-sm">
                        {renderContent()}
                    </div>

                    {/* Security note */}
                    <div className="mt-6 text-center">
                        <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                            🔒 Secure Payment Verification • SSL Encrypted
                        </p>
                        {retryCount > 0 && (
                            <p className="text-[10px] font-mono text-gray-300 mt-1">
                                Retry attempt: {retryCount}
                            </p>
                        )}
                    </div>
                </div>
            </main>

            <footer className="h-1 w-full bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 mt-auto" />
        </div>
    );
};

export default PaymentStatus;