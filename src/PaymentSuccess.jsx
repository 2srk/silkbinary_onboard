import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState(null);
    const orderId = searchParams.get('orderId');

    useEffect(() => {
        // Fetch order details from backend
        const fetchOrderDetails = async () => {
            try {
                const res = await fetch(`https://api.silkbinary.com/api/order/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrderDetails(data);
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
            } finally {
                setTimeout(() => setLoading(false), 1500);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        } else {
            setTimeout(() => setLoading(false), 1500);
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="font-mono text-gray-600">Verifying payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="max-w-md w-full p-8 border-2 border-gray-200 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>

                <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Payment Successful!</h1>
                <p className="font-mono text-gray-600 mb-6">
                    Order ID: <span className="font-bold bg-gray-100 px-3 py-1">{orderId}</span>
                </p>

                {orderDetails && (
                    <div className="bg-gray-50 p-4 mb-6 text-left">
                        <p className="text-sm font-mono text-gray-600 mb-2">Order Summary:</p>
                        <p className="text-sm">Plan: {orderDetails.plan_name}</p>
                        <p className="text-sm">Amount: {orderDetails.currency === 'INR' ? '₹' : '$'}{orderDetails.amount}</p>
                    </div>
                )}

                <p className="text-sm text-gray-500 mb-8">
                    Your service is now being provisioned. You'll receive an email with login details shortly.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-black text-white px-8 py-4 font-mono text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors w-full"
                    >
                        Return to Home
                    </button>
                    <button
                        onClick={() => navigate('/hosting')}
                        className="border-2 border-gray-200 text-gray-700 px-8 py-4 font-mono text-sm uppercase tracking-widest hover:border-black transition-colors w-full"
                    >
                        Order Another Service
                    </button>
                </div>
            </div>
        </div>
    );
}