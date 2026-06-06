import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'TENANT' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Adjust this endpoint if your backend uses a different path for registration
            const response = await api.post('/auth/register', formData);
            
            // If the backend returns a token immediately on registration
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            } else {
                // If it just creates the user, redirect to login
                navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-sans">
            {/* Simple Navbar */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-[#fd3752] rounded flex items-center justify-center text-white font-bold text-xl">R</div>
                    <h1 className="text-2xl font-bold text-[#464949] tracking-tight">RentNest</h1>
                </div>
            </div>

            {/* Form Container */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white rounded border border-gray-200 shadow-sm w-full max-w-md p-8">
                    <h2 className="text-2xl font-bold text-[#464949] mb-2 text-center">Create an Account</h2>
                    <p className="text-sm text-gray-500 text-center mb-6">Join RentNest to find or list your property.</p>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-[#fd3752] text-red-700 p-3 mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Role Selection */}
                        <div className="flex gap-4 mb-2">
                            <label className={`flex-1 border rounded p-3 text-center cursor-pointer transition-colors ${formData.role === 'TENANT' ? 'border-[#009688] bg-[#e6f4f3] text-[#009688] font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="TENANT" checked={formData.role === 'TENANT'} onChange={handleChange} className="hidden" />
                                I am a Tenant
                            </label>
                            <label className={`flex-1 border rounded p-3 text-center cursor-pointer transition-colors ${formData.role === 'OWNER' ? 'border-[#009688] bg-[#e6f4f3] text-[#009688] font-bold' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="OWNER" checked={formData.role === 'OWNER'} onChange={handleChange} className="hidden" />
                                I am an Owner
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Full Name</label>
                            <input 
                                type="text" name="name" required value={formData.name} onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2.5 focus:border-[#009688] outline-none transition text-sm bg-gray-50 focus:bg-white" 
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Email Address</label>
                            <input 
                                type="email" name="email" required value={formData.email} onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2.5 focus:border-[#009688] outline-none transition text-sm bg-gray-50 focus:bg-white" 
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Password</label>
                            <input 
                                type="password" name="password" required value={formData.password} onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2.5 focus:border-[#009688] outline-none transition text-sm bg-gray-50 focus:bg-white" 
                                placeholder="••••••••"
                            />
                        </div>

                        <button 
                            type="submit" disabled={loading}
                            className={`w-full text-white font-bold py-3 px-4 rounded transition shadow-sm mt-4 uppercase tracking-wide text-sm ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#fd3752] hover:bg-[#e02d43]'}`}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
                        Already have an account? <Link to="/login" className="text-[#009688] font-bold hover:underline">Sign in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
