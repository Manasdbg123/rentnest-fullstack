import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const MyProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyProperties = async () => {
            try {
                const response = await api.get('/properties/my-properties');
                setProperties(response.data);
            } catch (err) {
                setError('Failed to fetch your properties.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyProperties();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getCoverImage = (images) => {
        if (!images || images.length === 0) return null;
        const primaryImage = images.find(img => img.primary || img.isPrimary);
        return primaryImage ? primaryImage.imageUrl : images[0].imageUrl;
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] font-sans flex flex-col">
            <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-[#fd3752] rounded flex items-center justify-center text-white font-bold text-xl">R</div>
                    <h1 className="text-2xl font-bold text-[#464949] tracking-tight">RentNest</h1>
                </div>
                <div className="space-x-4">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-900 font-bold text-sm mr-4">Back to Search</button>
                    <button onClick={() => navigate('/create-property')} className="bg-white border border-[#fd3752] text-[#fd3752] hover:bg-red-50 px-5 py-2 rounded font-medium transition">Post Free Property Ad</button>
                    <button onClick={handleLogout} className="bg-[#464949] hover:bg-black text-white px-5 py-2 rounded font-medium transition">Logout</button>
                </div>
            </div>

            <div className="flex-1 max-w-[1000px] w-full mx-auto p-4 md:p-8">
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-[#464949]">My Posted Properties</h2>
                    <p className="text-gray-500 mt-1">Manage the listings you have created on RentNest.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

                {loading ? (
                    <div className="flex justify-center items-center h-64 text-gray-500 font-bold">Loading your properties...</div>
                ) : properties.length === 0 ? (
                    <div className="bg-white p-12 rounded shadow-sm border border-gray-200 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">You haven't posted any properties yet.</h3>
                        <p className="text-gray-500 mb-6">Start earning by listing your space for rent today.</p>
                        <button onClick={() => navigate('/create-property')} className="bg-[#fd3752] hover:bg-[#e02d43] text-white px-6 py-2.5 rounded font-bold shadow transition">
                            Post Free Ad Now
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {properties.map((prop) => (
                            <div key={prop.id} onClick={() => navigate(`/property/${prop.id}`)} className="cursor-pointer bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow flex overflow-hidden h-32 group">

                                <div className="w-40 bg-gray-100 flex-shrink-0 relative">
                                    {getCoverImage(prop.images) ? (
                                        <img src={getCoverImage(prop.images)} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                    )}
                                </div>

                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-[#464949] text-lg group-hover:text-[#fd3752] transition-colors">{prop.rooms} BHK {prop.type}</h3>
                                            <p className="text-sm text-gray-500 truncate">{prop.locality}, {prop.city}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[#464949] text-lg">₹{prop.rentAmount}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-2 py-1 rounded uppercase">
                                            {prop.status}
                                        </span>
                                        <span className="text-xs text-gray-400 font-bold uppercase">ID: {prop.id}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProperties;