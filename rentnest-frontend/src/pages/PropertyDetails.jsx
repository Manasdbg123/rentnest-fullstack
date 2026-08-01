import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getCustomIcon = () => {
    return L.divIcon({
        html: `<div class="bg-brand-accent text-white p-2 rounded-full shadow-lg border-2 border-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });
};

const cityCoordinates = {
    'Bengaluru': [12.9716, 77.5946],
    'Mumbai': [19.0760, 72.8777],
    'Pune': [18.5204, 73.8567],
    'Delhi': [28.7041, 77.1025],
    'Hyderabad': [17.3850, 78.4867]
};

const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if(lower.includes('gym')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    if(lower.includes('pool')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
    if(lower.includes('lift')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
    if(lower.includes('park')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    if(lower.includes('security')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" /></svg>;
};

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [showContact, setShowContact] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await api.get(`/properties/${id}`);
                setProperty(response.data);
            } catch (err) {
                setError('Failed to load property details.');
            } finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{error || 'Property not found'}</h1>
                <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Dashboard</button>
            </div>
        );
    }

    const images = property.images?.length > 0 ? property.images.map(img => img.imageUrl) : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'];
    
    // Fill array up to 5 images for the grid
    const gridImages = [...images];
    while(gridImages.length < 5) {
        gridImages.push('https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800');
    }

    const mapCenter = cityCoordinates[property.city] || [20.5937, 78.9629];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0f172a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Premium Navigation */}
            <div className="sticky top-0 z-50 glass backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 px-4 md:px-8 py-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/dashboard')}>
                    <div className="w-9 h-9 bg-gradient-to-br from-[#fd3752] to-[#e02d43] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg font-outfit">R</div>
                    <h1 className="text-2xl font-extrabold hidden sm:block tracking-tight font-outfit">RentNest</h1>
                </div>
                <div className="flex items-center space-x-4 md:space-x-6">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        {darkMode ? (
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>
                    <button onClick={() => navigate('/dashboard')} className="text-sm font-semibold hover:text-brand-primary transition">Back to Search</button>
                </div>
            </div>

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 slide-up">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit mb-2">{property.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                            <span className="underline cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">{property.locality}, {property.city}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                Verified Property
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Share
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            Save
                        </button>
                    </div>
                </div>

                {/* Airbnb-style 5 Image Grid */}
                <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] flex gap-2 rounded-2xl overflow-hidden mb-10 group relative">
                    {/* Left Large Hero Image */}
                    <div className="w-full md:w-1/2 h-full overflow-hidden relative">
                        <img src={gridImages[0]} alt="Hero" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 cursor-pointer" />
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur text-brand-primary font-bold px-3 py-1.5 rounded shadow-lg text-sm uppercase tracking-wide border border-white/20">Zero Brokerage</div>
                    </div>
                    {/* Right 4-Image Grid (Hidden on small screens) */}
                    <div className="hidden md:flex w-1/2 flex-col gap-2 h-full">
                        <div className="flex gap-2 h-1/2">
                            <div className="w-1/2 h-full overflow-hidden"><img src={gridImages[1]} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer" /></div>
                            <div className="w-1/2 h-full overflow-hidden"><img src={gridImages[2]} alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer" /></div>
                        </div>
                        <div className="flex gap-2 h-1/2">
                            <div className="w-1/2 h-full overflow-hidden"><img src={gridImages[3]} alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer" /></div>
                            <div className="w-1/2 h-full overflow-hidden relative">
                                <img src={gridImages[4]} alt="Gallery 4" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110 cursor-pointer" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition">
                                    <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                        Show all photos
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 relative">
                    
                    {/* Left Content Area */}
                    <div className="w-full lg:w-2/3">
                        
                        <div className="flex justify-between items-center pb-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-2xl font-bold font-outfit mb-1">Entire {property.type.toLowerCase()} hosted by Owner</h2>
                                <p className="text-gray-600 dark:text-gray-400">{property.rooms} bedrooms • {property.squareFootage} sqft • {property.furnishingStatus.replace('_', ' ')}</p>
                            </div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-brand-primary flex items-center justify-center text-white text-xl font-bold shadow-md">
                                {property.owner?.name?.charAt(0) || 'O'}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="py-8 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold font-outfit mb-4">About this property</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{property.description}</p>
                        </div>

                        {/* Amenities Grid */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div className="py-8 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl font-bold font-outfit mb-6">What this place offers</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                    {property.amenities.map((am, i) => (
                                        <div key={i} className="flex items-center gap-4 text-gray-700 dark:text-gray-300">
                                            <div className="text-brand-primary dark:text-teal-400">
                                                {getAmenityIcon(am)}
                                            </div>
                                            <span className="font-medium">{am}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Map */}
                        <div className="py-8">
                            <h3 className="text-xl font-bold font-outfit mb-2">Where you'll be</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{property.locality}, {property.city}</p>
                            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner z-0 relative">
                                <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                    <Marker position={mapCenter} icon={getCustomIcon()}>
                                        <Popup>Exact location provided after booking.</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    {/* Right Sticky Sidebar Area */}
                    <div className="w-full lg:w-1/3 relative hidden lg:block">
                        <div className="sticky top-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 transition-all">
                            <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <p className="text-3xl font-extrabold text-brand-primary font-outfit">₹{property.rentAmount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">Per Month</p>
                                </div>
                                {property.negotiable && (
                                    <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded uppercase">Negotiable</span>
                                )}
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Security Deposit</span>
                                    <span className="font-bold">₹{property.depositAmount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Brokerage</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">₹0 (Zero)</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Availability</span>
                                    <span className="font-bold">{!property.availableFrom || new Date(property.availableFrom) <= new Date() ? 'Immediate' : new Date(property.availableFrom).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {showContact ? (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600 fade-in">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-2">Owner's Contact</p>
                                    <p className="text-xl font-bold font-outfit tracking-wide">{property.contactNumber || '+91 98765 43210'}</p>
                                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{property.owner?.name || 'Owner'}</p>
                                </div>
                            ) : (
                                <button onClick={() => setShowContact(true)} className="w-full bg-brand-primary hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 font-outfit text-lg">
                                    Get Owner Details
                                </button>
                            )}

                            <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                                You won't be charged yet. Zero brokerage guaranteed.
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Floating Action Bar */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 lg:hidden flex justify-between items-center z-50">
                        <div>
                            <p className="text-xl font-extrabold text-brand-primary font-outfit">₹{property.rentAmount}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Per Month</p>
                        </div>
                        <button onClick={() => setShowContact(true)} className="bg-brand-primary text-white font-bold py-2.5 px-6 rounded-lg shadow-md font-outfit">
                            Contact Owner
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default PropertyDetails;