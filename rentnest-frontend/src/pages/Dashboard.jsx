import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import AuthModal from '../components/AuthModal';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getCustomIcon = (price, isActive) => {
    let formattedPrice = price;
    if (price >= 1000) {
        formattedPrice = (price / 1000).toFixed(price % 1000 === 0 ? 0 : 1) + 'K';
    }
    
    return L.divIcon({
        html: `<div class="price-marker ${isActive ? 'active-marker' : ''} dark:bg-gray-800 dark:text-white dark:border-brand-primary">₹${formattedPrice}</div>`,
        className: 'custom-div-icon',
        iconSize: [50, 24],
        iconAnchor: [25, 30],
        popupAnchor: [0, -32],
    });
};

const cityCoordinates = {
    'Bengaluru': [12.9716, 77.5946],
    'Mumbai': [19.0760, 72.8777],
    'Pune': [18.5204, 73.8567],
    'Delhi': [28.7041, 77.1025],
    'Hyderabad': [17.3850, 78.4867]
};

const getPropertyCoords = (prop) => {
    const baseCoords = cityCoordinates[prop.city] || [20.5937, 78.9629];
    const offsetLat = (prop.id % 20 - 10) * 0.005;
    const offsetLng = ((prop.id * 3) % 20 - 10) * 0.005;
    return [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng];
};

const getAmenityIcon = (name) => {
    const lower = name.toLowerCase();
    if(lower.includes('gym')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    if(lower.includes('pool')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>;
    if(lower.includes('lift')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
    if(lower.includes('park')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    if(lower.includes('security')) return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
    return <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
};

const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6 skeleton fade-in flex flex-col md:flex-row gap-6 h-[240px]">
        <div className="w-full md:w-[300px] h-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 flex flex-col justify-between py-2">
            <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-md w-1/2 mb-6"></div>
                <div className="flex gap-4">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-16"></div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
            </div>
        </div>
    </div>
);

const PropertyCard = ({ prop, viewMode, isFavorited, onToggleFavorite, navigate, setHoveredPropertyId }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const hasImages = prop.images && prop.images.length > 0;
    const currentImage = hasImages ? prop.images[currentImgIndex].imageUrl : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=600';

    const nextImage = (e) => { e.stopPropagation(); setCurrentImgIndex((prev) => (prev === prop.images.length - 1 ? 0 : prev + 1)); };
    const prevImage = (e) => { e.stopPropagation(); setCurrentImgIndex((prev) => (prev === 0 ? prop.images.length - 1 : prev - 1)); };
    
    const isAvailableNow = () => !prop.availableFrom || new Date(prop.availableFrom) <= new Date();
    const isZeroBrokerage = true; 
    const isHotDeal = (prop.type === 'ROOM' || prop.type === 'PG') ? prop.rentAmount < 8000 : (prop.type === 'SHOP' || prop.type === 'COMMERCIAL' ? prop.rentAmount < 30000 : prop.rentAmount < 25000);

    const baseCardClass = "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover-lift overflow-hidden cursor-pointer transition-all duration-300";

    const renderBadges = (position) => (
        <div className={`absolute ${position} z-10 flex flex-col gap-2`}>
            {isZeroBrokerage && (
                <div className="bg-[#009688] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wide flex items-center gap-1 w-fit">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Zero Brokerage
                </div>
            )}
            {isHotDeal && (
                <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wide flex items-center gap-1 w-fit animate-pulse">
                    🔥 Hot Deal
                </div>
            )}
            {prop.verified && (
                <div className="bg-blue-600/95 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-wide flex items-center gap-1 w-fit">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Verified
                </div>
            )}
        </div>
    );

    const handleMouseEnter = () => setHoveredPropertyId && setHoveredPropertyId(prop.id);
    const handleMouseLeave = () => setHoveredPropertyId && setHoveredPropertyId(null);
    const handleClick = () => navigate(`/property/${prop.id}`);

    if (viewMode === 'map') {
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand-primary rounded-xl flex overflow-hidden mb-3 cursor-pointer transition-all duration-300" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
                <div className="w-1/3 h-24 relative overflow-hidden">
                    <img src={currentImage} className="w-full h-full object-cover" alt="Property" />
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xs truncate">{prop.rooms} BHK {prop.type}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{prop.locality}</p>
                    <div className="flex justify-between items-center mt-2">
                        <p className="font-bold text-brand-primary text-sm font-outfit">₹{prop.rentAmount}</p>
                        {isZeroBrokerage && <span className="text-[8px] bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-1.5 py-0.5 rounded font-bold uppercase border border-teal-100 dark:border-teal-800">Zero Brokerage</span>}
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`${baseCardClass} flex flex-col group relative`}>
                <div className="relative h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img src={currentImage} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {renderBadges("top-3 left-3")}
                    
                    {hasImages && prop.images.length > 1 && (
                        <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={prevImage} className="bg-black/50 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">&lt;</button>
                            <button onClick={nextImage} className="bg-black/50 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">&gt;</button>
                        </div>
                    )}
                    <button onClick={(e) => onToggleFavorite(e, prop.id)} className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full shadow hover:bg-white dark:hover:bg-gray-800 z-10 transition-transform hover:scale-110">
                        <svg className={`w-4 h-4 ${isFavorited ? 'text-brand-accent fill-current' : 'text-gray-400 dark:text-gray-500'}`} fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 truncate pr-2 font-outfit">{prop.rooms} BHK {prop.type}</h2>
                        <div className="text-right flex-shrink-0">
                            <span className="text-brand-primary font-bold text-lg leading-none font-outfit">₹{prop.rentAmount}</span>
                            {prop.negotiable && <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase mt-0.5">Negotiable</p>}
                        </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 truncate flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {prop.locality}, {prop.city}
                    </p>
                    
                    {prop.amenities && prop.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {prop.amenities.slice(0, 3).map((am, i) => (
                                <span key={i} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-200 dark:border-gray-600">
                                    {getAmenityIcon(am)} {am}
                                </span>
                            ))}
                            {prop.amenities.length > 3 && <span className="text-[10px] text-gray-500 px-1 py-0.5">+{prop.amenities.length - 3} more</span>}
                        </div>
                    )}
                    
                    <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{prop.furnishingStatus.replace('_', ' ')}</span>
                        <button className="text-brand-accent text-sm font-bold font-outfit hover:underline">View Details →</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${baseCardClass} flex flex-col md:flex-row mb-6 slide-up group`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick}>
            <div className="relative w-full md:w-[320px] h-[200px] md:h-full flex-shrink-0 overflow-hidden">
                <img src={currentImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Property" />
                
                {renderBadges("top-3 left-3")}

                {hasImages && prop.images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={prevImage} className="bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">&lt;</button>
                        <button onClick={nextImage} className="bg-black/40 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all">&gt;</button>
                    </div>
                )}
                <button onClick={(e) => onToggleFavorite(e, prop.id)} className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-800 z-10 transition-transform hover:scale-110">
                    <svg className={`w-5 h-5 ${isFavorited ? 'text-brand-accent fill-current' : 'text-gray-400 dark:text-gray-500'}`} fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-brand-primary transition-colors font-outfit">
                                {prop.rooms} BHK {prop.type}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                                <svg className="w-4 h-4 text-brand-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {prop.locality}, {prop.city}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-extrabold text-brand-primary font-outfit leading-none">₹{prop.rentAmount}</p>
                            {prop.negotiable && <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mt-1 tracking-wider bg-gray-100 dark:bg-gray-700 inline-block px-1.5 py-0.5 rounded">Negotiable</p>}
                            {!prop.negotiable && <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold mt-1">Per Month</p>}
                        </div>
                    </div>

                    {prop.amenities && prop.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {prop.amenities.slice(0, 5).map((am, i) => (
                                <span key={i} className="text-[11px] font-medium bg-[#f0f9f8] dark:bg-teal-900/20 text-[#007b6f] dark:text-teal-400 px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-[#c2ece8] dark:border-teal-800/50">
                                    {getAmenityIcon(am)} {am}
                                </span>
                            ))}
                            {prop.amenities.length > 5 && <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 px-1 py-1">+{prop.amenities.length - 5} more</span>}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100/60 dark:border-gray-700">
                    <div className="text-center border-r border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 font-outfit">{prop.squareFootage} sqft</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Builtup Area</p>
                    </div>
                    <div className="text-center border-r border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 font-outfit truncate px-1">{prop.furnishingStatus.replace('_', ' ')}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Furnishing</p>
                    </div>
                    <div className="text-center border-r border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 font-outfit">₹{prop.depositAmount?.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Deposit</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 font-outfit">{isAvailableNow() ? 'Immediate' : new Date(prop.availableFrom).toLocaleDateString()}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Availability</p>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500">Posted on {new Date(prop.createdAt || Date.now()).toLocaleDateString()}</p>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/property/${prop.id}`); }} className="btn-primary flex items-center gap-2 font-outfit text-sm py-2 px-5">
                        Contact Owner
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const isLoggedIn = !!localStorage.getItem('token');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [activeTab, setActiveTab] = useState('search');
    const [activeFilterTab, setActiveFilterTab] = useState('standard');
    const [viewMode, setViewMode] = useState('list');
    
    const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

    const [favoriteProperties, setFavoriteProperties] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());

    const [filters, setFilters] = useState({ city: '', minRent: '', maxRent: '' });
    const [uiFilters, setUiFilters] = useState({
        bhk: [],
        availability: '',
        tenants: [],
        propertyTypes: [],
        verifiedOnly: false,
        furnishing: '',
        sortBy: 'newest'
    });

    const fetchProperties = async (currentFilters, targetPage = 0) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (currentFilters.city) params.append('city', currentFilters.city);
            if (currentFilters.minRent) params.append('minRent', currentFilters.minRent);
            if (currentFilters.maxRent) params.append('maxRent', currentFilters.maxRent);
            if (uiFilters.furnishing) params.append('furnishing', uiFilters.furnishing);
            if (uiFilters.sortBy) params.append('sortBy', uiFilters.sortBy);
            
            params.append('page', targetPage);
            params.append('size', 50); 

            const response = await api.get(`/properties?${params.toString()}`);
            setProperties(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setPage(response.data.pageNo || 0);
        } catch (err) {
            setError('Failed to fetch properties.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const response = await api.get('/properties/favorites');
            setFavoriteProperties(response.data);
            setFavoriteIds(new Set(response.data.map(prop => prop.id)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'search') {
            fetchProperties(filters, 0);
            if (isLoggedIn) {
                api.get('/properties/favorites').then(res => setFavoriteIds(new Set(res.data.map(p => p.id)))).catch(()=>console.log("Logged out"));
            }
        } else {
            fetchFavorites();
        }
    }, [activeTab, isLoggedIn, uiFilters.furnishing, uiFilters.sortBy]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleApplyFilters = (e) => { e.preventDefault(); setActiveTab('search'); fetchProperties(filters, 0); };
    const handleClearFilters = () => {
        setFilters({ city: '', minRent: '', maxRent: '' });
        setUiFilters({ bhk: [], availability: '', tenants: [], propertyTypes: [], verifiedOnly: false, furnishing: '', sortBy: 'newest' });
        fetchProperties({ city: '', minRent: '', maxRent: '' }, 0);
    };
    const toggleArrayFilter = (field, value) => {
        setUiFilters(prev => {
            const current = prev[field];
            return { ...prev, [field]: current.includes(value) ? current.filter(v => v !== value) : [...current, value] };
        });
    };

    const handleToggleFavorite = async (e, propertyId) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }
        try {
            const response = await api.post(`/properties/${propertyId}/favorite`);
            const isNowFavorited = response.data;
            setFavoriteIds(prev => {
                const newSet = new Set(prev);
                if (isNowFavorited) newSet.add(propertyId);
                else newSet.delete(propertyId);
                return newSet;
            });
            if (activeTab === 'shortlist' && !isNowFavorited) {
                setFavoriteProperties(prev => prev.filter(p => p.id !== propertyId));
            }
        } catch (err) {
            alert('Failed to update favorite status.');
        }
    };

    let displayProperties = activeTab === 'search' ? [...properties] : [...favoriteProperties];
    if (uiFilters.bhk.length > 0) displayProperties = displayProperties.filter(p => uiFilters.bhk.includes(p.rooms) || (uiFilters.bhk.includes(4) && p.rooms >= 4));
    if (uiFilters.availability) {
        const today = new Date();
        displayProperties = displayProperties.filter(p => {
            const availDate = new Date(p.availableFrom || today);
            const diffDays = Math.ceil((availDate - today) / (1000 * 60 * 60 * 24));
            if (uiFilters.availability === 'Immediate') return diffDays <= 0;
            if (uiFilters.availability === 'Within 15 Days') return diffDays <= 15;
            if (uiFilters.availability === 'Within 30 Days') return diffDays <= 30;
            if (uiFilters.availability === 'After 30 Days') return diffDays > 30;
            return true;
        });
    }
    if (uiFilters.verifiedOnly) displayProperties = displayProperties.filter(p => p.verified || p.isVerified);
    if (uiFilters.propertyTypes.length > 0) displayProperties = displayProperties.filter(p => uiFilters.propertyTypes.includes(p.type));
    
    const mapCenter = useMemo(() => {
        if(displayProperties.length > 0) return getPropertyCoords(displayProperties[0]);
        return [20.5937, 78.9629];
    }, [displayProperties.length > 0 ? displayProperties[0].city : 'None']);

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] transition-colors duration-300 flex flex-col font-inter">
            {/* Premium Glass Nav */}
            <div className="sticky top-0 z-50 glass backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 px-8 py-3 flex justify-between items-center transition-all duration-300 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition" onClick={() => navigate('/dashboard')}>
                    <div className="w-9 h-9 bg-gradient-to-br from-[#fd3752] to-[#e02d43] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg font-outfit">R</div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight font-outfit">RentNest</h1>
                </div>
                <div className="flex items-center space-x-6">
                    <button className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition">Pay Rent</button>
                    <button className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition">Rental Agreement</button>
                    
                    {/* Dark Mode Toggle */}
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                        {darkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>

                    <button onClick={() => isLoggedIn ? navigate('/create-property') : setIsAuthModalOpen(true)} className="btn-outline font-outfit text-sm py-1.5 px-4 hidden md:block dark:border-gray-600 dark:text-gray-300 dark:hover:border-brand-primary">Post Free Property Ad</button>
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="btn-secondary font-outfit text-sm py-1.5 px-4">Logout</button>
                    ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="btn-primary font-outfit text-sm py-1.5 px-5">Sign In</button>
                    )}
                </div>
            </div>

            {/* Premium Marketing Banner - Fixed Contrast */}
            <div className="bg-gray-900 text-white p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary rounded-full blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center relative z-10 px-4">
                    <div>
                        <h2 className="text-2xl font-bold font-outfit mb-1 flex items-center gap-2">
                            Find Your Dream Home with <span className="text-brand-primary bg-white px-2 py-0.5 rounded shadow-sm text-xl uppercase transform -rotate-2 ml-1">Zero Brokerage</span>
                        </h2>
                        <p className="text-gray-300 text-sm">Directly connect with over 40+ verified owners across India. No middlemen.</p>
                    </div>
                    
                    <div className="w-full md:w-auto mt-4 md:mt-0 min-w-[400px]">
                        <div className="flex bg-white/10 backdrop-blur-md rounded-full border border-white/20 p-1.5 items-center shadow-lg focus-within:bg-white/20 transition-all">
                            <div className="flex-1 flex items-center px-4">
                                <svg className="w-5 h-5 text-gray-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="Search by city (e.g. Bengaluru, Mumbai)" className="bg-transparent outline-none text-sm w-full text-white placeholder-gray-400 font-medium" />
                            </div>
                            <button onClick={handleApplyFilters} className="bg-brand-primary text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-teal-700 transition shadow-md font-outfit">Search</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Airbnb-style Category Navigation */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-[61px] z-40 px-4 md:px-8 py-3 flex items-center gap-6 overflow-x-auto hide-scrollbar">
                {[
                    { id: 'all', label: 'All Homes', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                    { id: 'APARTMENT', label: 'Apartments', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                    { id: 'ROOM', label: 'Rooms & PGs', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
                    { id: 'SHOP', label: 'Shops & Commercial', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
                    { id: 'VILLA', label: 'Villas', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1' }
                ].map((category) => (
                    <div 
                        key={category.id} 
                        onClick={() => {
                            if (category.id === 'all') {
                                setUiFilters({ ...uiFilters, propertyTypes: [] });
                            } else if (category.id === 'ROOM') {
                                setUiFilters({ ...uiFilters, propertyTypes: ['ROOM', 'PG'] });
                            } else if (category.id === 'SHOP') {
                                setUiFilters({ ...uiFilters, propertyTypes: ['SHOP', 'COMMERCIAL'] });
                            } else {
                                setUiFilters({ ...uiFilters, propertyTypes: [category.id] });
                            }
                        }}
                        className={`flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 min-w-[70px] group opacity-70 hover:opacity-100 ${
                            (category.id === 'all' && uiFilters.propertyTypes.length === 0) ||
                            (category.id === 'ROOM' && uiFilters.propertyTypes.includes('ROOM')) ||
                            (category.id === 'SHOP' && uiFilters.propertyTypes.includes('SHOP')) ||
                            (uiFilters.propertyTypes.includes(category.id))
                                ? 'opacity-100 border-b-2 border-brand-primary text-gray-900 dark:text-white' 
                                : 'border-b-2 border-transparent text-gray-500 dark:text-gray-400'
                        }`}
                    >
                        <svg className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${
                             (category.id === 'all' && uiFilters.propertyTypes.length === 0) || uiFilters.propertyTypes.includes(category.id) || (category.id === 'ROOM' && uiFilters.propertyTypes.includes('ROOM')) || (category.id === 'SHOP' && uiFilters.propertyTypes.includes('SHOP')) ? 'text-brand-primary' : 'text-gray-500 dark:text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={category.icon} />
                        </svg>
                        <span className="text-[11px] font-bold pb-2 whitespace-nowrap">{category.label}</span>
                    </div>
                ))}
            </div>

            {/* Quick Filters Strip */}
            <div className="bg-[#f8fafc] dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm sticky top-[138px] z-30 hidden md:flex items-center px-8 py-2 overflow-x-auto gap-3">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2">Quick Filters:</span>
                <button onClick={() => setUiFilters({...uiFilters, verifiedOnly: !uiFilters.verifiedOnly})} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${uiFilters.verifiedOnly ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Verified Owners Only</button>
                <button onClick={() => setUiFilters({...uiFilters, furnishing: 'FULLY_FURNISHED'})} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${uiFilters.furnishing === 'FULLY_FURNISHED' ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 font-bold' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Fully Furnished</button>
                <button onClick={() => setUiFilters({...uiFilters, availability: 'Immediate'})} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${uiFilters.availability === 'Immediate' ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 font-bold' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>Move-in Now</button>
                <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-600 mx-2"></div>
                <button onClick={handleClearFilters} className="text-xs text-brand-accent hover:underline font-semibold flex items-center"><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>Clear All</button>
            </div>

            <div className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 md:flex gap-8">
                {/* Refined Sidebar */}
                <div className="w-full md:w-[300px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-fit sticky top-[200px] mb-6 md:mb-0 flex-shrink-0 shadow-sm overflow-hidden slide-up">
                    <div className="flex border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button onClick={() => setActiveFilterTab('standard')} className={`flex-1 py-3 text-sm font-bold transition-colors font-outfit ${activeFilterTab === 'standard' ? 'text-brand-primary border-b-2 border-brand-primary bg-white dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>Filters</button>
                        <button onClick={() => setActiveFilterTab('premium')} className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 font-outfit ${activeFilterTab === 'premium' ? 'text-brand-primary border-b-2 border-brand-primary bg-white dark:bg-gray-800' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>More</button>
                    </div>

                    <div className="p-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                        {activeFilterTab === 'standard' && (
                            <div className="space-y-6 fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 font-outfit uppercase tracking-wide">BHK Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[{ label: '1 RK', val: 0 }, { label: '1 BHK', val: 1 }, { label: '2 BHK', val: 2 }, { label: '3 BHK', val: 3 }, { label: '4 BHK', val: 4 }, { label: '4+ BHK', val: 5 }].map(type => (
                                            <button key={type.label} onClick={() => toggleArrayFilter('bhk', type.val)} className={`border text-xs py-2 rounded-lg font-medium transition ${uiFilters.bhk.includes(type.val) ? 'border-brand-primary text-brand-primary bg-teal-50 dark:bg-teal-900/30 dark:border-brand-primary shadow-sm' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 hover:border-brand-primary dark:hover:border-brand-primary'}`}>{type.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 font-outfit uppercase tracking-wide">Rent Range (₹)</label>
                                    <div className="flex gap-2">
                                        <input type="number" name="minRent" placeholder="Min" value={filters.minRent} onChange={handleFilterChange} className="input-field py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                        <span className="text-gray-400 self-center font-bold">-</span>
                                        <input type="number" name="maxRent" placeholder="Max" value={filters.maxRent} onChange={handleFilterChange} className="input-field py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 font-outfit uppercase tracking-wide">Availability</label>
                                    <div className="space-y-2.5">
                                        {['Immediate', 'Within 15 Days', 'Within 30 Days', 'After 30 Days'].map(time => (
                                            <label key={time} className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer group">
                                                <input type="radio" name="availability" checked={uiFilters.availability === time} onChange={() => setUiFilters({...uiFilters, availability: time})} className="mr-3 w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                                                <span className="group-hover:text-brand-primary transition-colors">{time}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeFilterTab === 'premium' && (
                            <div className="space-y-6 fade-in">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 font-outfit uppercase tracking-wide">Sort By</label>
                                    <select value={uiFilters.sortBy} onChange={(e) => setUiFilters({...uiFilters, sortBy: e.target.value})} className="input-field cursor-pointer text-sm py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                        <option value="newest">Newest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 font-outfit uppercase tracking-wide">Furnishing Status</label>
                                    <div className="space-y-2.5">
                                        {['', 'FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'].map(status => (
                                            <label key={status} className="flex items-center text-sm text-gray-700 dark:text-gray-300 cursor-pointer group">
                                                <input type="radio" name="furnishing" checked={uiFilters.furnishing === status} onChange={() => setUiFilters({...uiFilters, furnishing: status})} className="mr-3 w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700" />
                                                <span className="group-hover:text-brand-primary transition-colors">{status === '' ? 'Any' : status.replace('_', ' ')}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="bg-gray-900 rounded-xl p-4 text-white text-center shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-brand-primary rounded-full blur-[20px] opacity-40"></div>
                                        <h4 className="font-outfit font-bold text-sm mb-1">Get Rent Alerts</h4>
                                        <p className="text-[10px] text-gray-300 mb-3">Be the first to know about new zero brokerage properties.</p>
                                        <button className="w-full bg-brand-primary hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow">Create Alert</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-5 gap-8 px-2 slide-up">
                        <button onClick={() => setActiveTab('search')} className={`pb-3 text-base font-bold transition-all font-outfit ${activeTab === 'search' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Search Results</button>
                        <button onClick={() => { if (!isLoggedIn) { setIsAuthModalOpen(true); return; } setActiveTab('shortlist'); }} className={`pb-3 text-base font-bold transition-all flex items-center font-outfit ${activeTab === 'shortlist' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                            Shortlisted
                            {favoriteIds.size > 0 && <span className="ml-2 bg-brand-accent text-white text-xs px-2 py-0.5 rounded-full shadow-sm">{favoriteIds.size}</span>}
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-5 slide-up">
                        <h2 className="text-base font-bold text-gray-700 dark:text-gray-200 font-outfit">{displayProperties.length} Properties Found</h2>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex shadow-sm p-1">
                            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white shadow-inner' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>List</button>
                            <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white shadow-inner' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Grid</button>
                            <button onClick={() => setViewMode('map')} className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${viewMode === 'map' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> Map</button>
                        </div>
                    </div>

                    <div className={`flex-grow ${viewMode === 'map' ? 'flex h-[75vh] gap-5' : ''}`}>
                        <div className={`${viewMode === 'map' ? 'w-[48%] overflow-y-auto pr-2 custom-scrollbar' : 'w-full'}`}>
                            {loading ? (
                                <div className="space-y-6">
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </div>
                            ) : displayProperties.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 p-12 text-center border border-gray-100 dark:border-gray-700 rounded-3xl shadow-sm fade-in">
                                    <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-5 text-brand-primary dark:text-teal-400">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 font-outfit">No properties found</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">We couldn't find any matches in this area. Try adjusting filters.</p>
                                    <button onClick={handleClearFilters} className="mt-5 btn-outline font-outfit text-sm py-1.5 px-6 dark:border-gray-600 dark:text-gray-300 dark:hover:border-brand-primary">Reset All Filters</button>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5" : "space-y-5"}>
                                    {displayProperties.map((prop) => (
                                        <PropertyCard 
                                            key={prop.id} 
                                            prop={prop} 
                                            viewMode={viewMode} 
                                            isFavorited={favoriteIds.has(prop.id)} 
                                            onToggleFavorite={handleToggleFavorite} 
                                            navigate={navigate}
                                            setHoveredPropertyId={setHoveredPropertyId}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {viewMode === 'map' && !loading && displayProperties.length > 0 && (
                            <div className="w-[52%] h-full bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden sticky top-[130px] border border-gray-200 dark:border-gray-700 shadow-md relative z-0 fade-in">
                                <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
                                    {displayProperties.map(prop => (
                                        <Marker 
                                            position={getPropertyCoords(prop)} 
                                            icon={getCustomIcon(prop.rentAmount, hoveredPropertyId === prop.id)} 
                                            key={prop.id}
                                            eventHandlers={{
                                                mouseover: () => setHoveredPropertyId(prop.id),
                                                mouseout: () => setHoveredPropertyId(null),
                                            }}
                                        >
                                            <Popup className="premium-popup">
                                                <div className="text-center font-inter p-0">
                                                    <img src={prop.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} className="w-full h-24 object-cover rounded-t-lg mb-2" alt="Preview"/>
                                                    <div className="px-2 pb-2">
                                                        <strong className="text-brand-primary block text-xs font-outfit mb-0.5">{prop.rooms} BHK {prop.type}</strong>
                                                        <span className="text-gray-800 font-bold block text-sm mb-2">₹{prop.rentAmount}</span>
                                                        <button onClick={() => navigate(`/property/${prop.id}`)} className="bg-brand-accent text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#e02d43] transition-colors w-full font-outfit uppercase tracking-wide">View Details</button>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
        </div>
    );
};

export default Dashboard;