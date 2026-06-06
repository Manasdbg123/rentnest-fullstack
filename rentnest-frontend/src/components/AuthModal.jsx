import React, { useState } from 'react';
import api from '../api/axiosConfig';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'TENANT' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isLoginView ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, formData);

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                onClose();
                window.location.reload();
            }
        } catch (err) {
            console.error("Authentication Error Details:", err);

            // This perfectly intercepts the new ExceptionHandler message from Spring Boot!
            const msg = err.response?.data?.message || 'Authentication failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden relative">

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold">&times;</button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-[#464949] mb-2 text-center">
                        {isLoginView ? 'Welcome Back' : 'Create an Account'}
                    </h2>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        {isLoginView ? 'Sign in to RentNest to continue.' : 'Join RentNest to find or list your property.'}
                    </p>

                    {error && <div className="bg-red-50 text-[#fd3752] p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLoginView && (
                            <>
                                <div className="flex gap-4 mb-2">
                                    <label className={`flex-1 border rounded p-2 text-center text-sm cursor-pointer ${formData.role === 'TENANT' ? 'border-[#009688] bg-[#e6f4f3] text-[#009688] font-bold' : 'text-gray-500'}`}>
                                        <input type="radio" name="role" value="TENANT" checked={formData.role === 'TENANT'} onChange={handleChange} className="hidden" />
                                        I am a Tenant
                                    </label>
                                    <label className={`flex-1 border rounded p-2 text-center text-sm cursor-pointer ${formData.role === 'OWNER' ? 'border-[#009688] bg-[#e6f4f3] text-[#009688] font-bold' : 'text-gray-500'}`}>
                                        <input type="radio" name="role" value="OWNER" checked={formData.role === 'OWNER'} onChange={handleChange} className="hidden" />
                                        I am an Owner
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                                    <input type="text" name="name" required={!isLoginView} value={formData.name} onChange={handleChange} className="w-full border rounded p-2.5 focus:border-[#009688] outline-none bg-gray-50 text-sm" placeholder="John Doe" />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full border rounded p-2.5 focus:border-[#009688] outline-none bg-gray-50 text-sm" placeholder="name@example.com" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full border rounded p-2.5 focus:border-[#009688] outline-none bg-gray-50 text-sm" placeholder="••••••••" />
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#fd3752] hover:bg-[#e02d43] text-white font-bold py-3 rounded uppercase text-sm tracking-wide mt-2 shadow-sm transition-colors">
                            {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
                        {isLoginView ? "Don't have an account? " : "Already have an account? "}
                        <button type="button" onClick={() => setIsLoginView(!isLoginView)} className="text-[#009688] font-bold hover:underline">
                            {isLoginView ? 'Sign up here' : 'Sign in here'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;