import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// =========================================
// NEW AUTH IMPORT
// =========================================
import AuthModal from '../components/AuthModal';

// =========================================
// LEAFLET MAP IMPORTS
// =========================================
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

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

// =========================================
// SKELETON LOADER
// =========================================
const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 shadow-sm flex flex-col mb-4 animate-pulse">
        <div className="p-4 border-b border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
        </div>
        <div className="flex border-b border-gray-100">
            <div className="flex-1 p-3 border-r border-gray-100 flex flex-col items-center">
                <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-10"></div>
            </div>
            <div className="flex-1 p-3 border-r border-gray-100 flex flex-col items-center">
                <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-10"></div>
            </div>
            <div className="flex-1 p-3 flex flex-col items-center">
                <div className="h-5 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-10"></div>
            </div>
        </div>
        <div className="flex p-4 h-[212px]">
            <div className="w-[280px] bg-gray-200 rounded-sm flex-shrink-0"></div>
            <div className="flex-1 ml-6 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                    <div className="h-10 bg-gray-100 rounded"></div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <div className="h-10 w-32 bg-gray-300 rounded"></div>
                    <div className="h-10 w-10 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    </div>
);

// =========================================
// PROPERTY CARD
// =========================================
const PropertyCard = ({ prop, viewMode, isFavorited, onToggleFavorite, navigate }) => {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    const hasImages = prop.images && prop.images.length > 0;
    const currentImage = hasImages ? prop.images[currentImgIndex].imageUrl : null;

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === prop.images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === 0 ? prop.images.length - 1 : prev - 1));
    };

    const isAvailableNow = () => {
        if (!prop.availableFrom) return true;
        return new Date(prop.availableFrom) <= new Date();
    };

    if (viewMode === 'map') {
        return (
            <div className="bg-white border border-gray-200 shadow-sm rounded flex overflow-hidden mb-3 hover:shadow-md cursor-pointer transition" onClick={() => navigate(`/property/${prop.id}`)}>
                <div className="w-1/3 h-32 bg-gray-100 relative">
                    {currentImage ? (
                        <img src={currentImage} className="w-full h-full object-cover" alt="Property" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                </div>
                <div className="w-2/3 p-3 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-[#464949] text-sm truncate">{prop.rooms} BHK {prop.type}</h3>
                        <p className="text-xs text-gray-500 truncate">{prop.locality}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <p className="font-bold text-[#464949]">₹{prop.rentAmount}</p>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{prop.furnishingStatus.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'grid') {
        return (
            <div onClick={() => navigate(`/property/${prop.id}`)} className="cursor-pointer bg-white rounded border border-gray-200 hover:shadow-lg transition-shadow flex flex-col group relative">
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {currentImage ? (
                        <img src={currentImage} alt={prop.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}

                    {hasImages && prop.images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/50 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">&lt;</button>
                            <button onClick={nextImage} className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/50 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">&gt;</button>
                        </>
                    )}

                    <button onClick={(e) => onToggleFavorite(e, prop.id)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white z-10 group/heart">
                        <svg className={`w-4 h-4 transition-transform group-hover/heart:scale-110 ${isFavorited ? 'text-[#fd3752] fill-current' : 'text-gray-400'}`} fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                        <h2 className="text-base font-bold text-[#464949] truncate pr-2 flex items-center gap-1">
                            {prop.rooms} BHK {prop.type}
                            {prop.verified && (
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                </svg>
                            )}
                        </h2>
                        <span className="text-[#464949] font-bold text-lg whitespace-nowrap">₹ {prop.rentAmount}</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-3 truncate">{prop.locality}, {prop.city}</p>
                    <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">{prop.furnishingStatus.replace('_', ' ')}</span>
                        <button className="text-[#fd3752] text-xs font-bold uppercase hover:underline">Contact</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col mb-4">
            <div className="p-4 border-b border-gray-100 flex justify-between items-start hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(`/property/${prop.id}`)}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-[16px] font-bold text-[#464949] hover:text-[#fd3752] transition-colors flex items-center">
                            {prop.rooms} BHK {prop.type} For Rent In {prop.locality}
                            <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </h2>
                        {prop.verified && (
                            <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                                Verified
                            </span>
                        )}
                    </div>
                    <p className="text-[13px] text-[#878787] mt-0.5 truncate">{prop.locality}, {prop.city}</p>
                </div>
            </div>

            <div className="flex border-b border-gray-100">
                <div className="flex-1 p-3 text-center border-r border-gray-100">
                    <p className="text-[18px] font-bold text-[#464949]">₹ {prop.rentAmount}</p>
                    <p className="text-[11px] text-[#878787] mt-0.5 uppercase tracking-wide">Rent</p>
                </div>
                <div className="flex-1 p-3 text-center border-r border-gray-100">
                    <p className="text-[18px] font-bold text-[#464949]">₹ {prop.depositAmount?.toLocaleString()}</p>
                    <p className="text-[11px] text-[#878787] mt-0.5 uppercase tracking-wide">Deposit</p>
                </div>
                <div className="flex-1 p-3 text-center">
                    <p className="text-[18px] font-bold text-[#464949]">{prop.squareFootage} sqft</p>
                    <p className="text-[11px] text-[#878787] mt-0.5 uppercase tracking-wide">Builtup</p>
                </div>
            </div>

            <div className="flex p-4">
                <div onClick={() => navigate(`/property/${prop.id}`)} className="relative w-[280px] h-[180px] flex-shrink-0 cursor-pointer bg-gray-100 overflow-hidden">
                    {currentImage ? (
                        <img src={currentImage} className="w-full h-full object-cover transition-opacity duration-300" alt="Property" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    {hasImages && prop.images.length > 1 && (
                        <>
                            <button onClick={prevImage} className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/50 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">&lt;</button>
                            <button onClick={nextImage} className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/50 hover:bg-black/80 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">&gt;</button>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded z-10">{currentImgIndex + 1}/{prop.images.length}</div>
                        </>
                    )}
                </div>

                <div className="flex-1 ml-6 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 border border-gray-100 rounded-sm">
                        <div className="flex items-center p-3 border-b border-r border-gray-100">
                            <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            <div>
                                <p className="text-[13px] font-semibold text-[#464949]">{prop.furnishingStatus.replace('_', ' ')}</p>
                                <p className="text-[11px] text-[#878787]">Furnishing</p>
                            </div>
                        </div>
                        <div className="flex items-center p-3 border-b border-gray-100">
                            <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <div>
                                <p className="text-[13px] font-semibold text-[#464949]">{prop.rooms} BHK</p>
                                <p className="text-[11px] text-[#878787]">Apartment Type</p>
                            </div>
                        </div>
                        <div className="flex items-center p-3 border-r border-gray-100">
                            <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            <div>
                                <p className="text-[13px] font-semibold text-[#464949]">{prop.tenantPreference || 'Any'}</p>
                                <p className="text-[11px] text-[#878787]">Preferred Tenants</p>
                            </div>
                        </div>
                        <div className="flex items-center p-3">
                            <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                            <div>
                                <p className="text-[13px] font-semibold text-[#464949]">{isAvailableNow() ? 'Ready to Move' : new Date(prop.availableFrom).toLocaleDateString()}</p>
                                <p className="text-[11px] text-[#878787]">Available From</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-4">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/property/${prop.id}`); }} className="bg-[#fd3752] hover:bg-[#e02d43] text-white px-8 py-2.5 rounded-sm font-semibold shadow-sm transition-colors text-sm w-full md:w-auto text-center uppercase tracking-wide">
                            Contact Owner
                        </button>
                        <button onClick={(e) => onToggleFavorite(e, prop.id)} className={`p-2 border border-gray-300 rounded-sm hover:bg-gray-50 flex flex-col items-center justify-center group/heart ${isFavorited ? 'bg-red-50' : ''}`}>
                            <svg className={`w-5 h-5 transition-transform group-hover/heart:scale-110 ${isFavorited ? 'text-[#fd3752] fill-current' : 'text-gray-400'}`} fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center overflow-x-auto">
                <span className="text-[12px] text-gray-500 mr-3 flex-shrink-0">Nearby:</span>
                <div className="flex gap-2">
                    <span className="bg-white border border-gray-200 text-gray-600 text-[11px] px-2 py-1 rounded whitespace-nowrap">Local Bus Stop</span>
                    <span className="bg-white border border-gray-200 text-gray-600 text-[11px] px-2 py-1 rounded whitespace-nowrap">Central Market</span>
                    <span className="bg-white border border-gray-200 text-gray-600 text-[11px] px-2 py-1 rounded whitespace-nowrap">Metro Station</span>
                </div>
            </div>
        </div>
    );
};

// =========================================
// MAIN DASHBOARD
// =========================================
const Dashboard = () => {
    // -----------------------------------------
    // AUTHENTICATION LOGIC ADDED HERE!
    // -----------------------------------------
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const isLoggedIn = !!localStorage.getItem('token');

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [activeTab, setActiveTab] = useState('search');
    const [activeFilterTab, setActiveFilterTab] = useState('standard');
    const [viewMode, setViewMode] = useState('list');

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
            if (uiFilters.propertyTypes.length > 0) params.append('type', uiFilters.propertyTypes[0]);
            if (uiFilters.tenants.length > 0) params.append('tenant', uiFilters.tenants[0]);

            params.append('page', targetPage);
            params.append('size', 30);

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
        }
    }, [uiFilters.furnishing, uiFilters.sortBy, uiFilters.propertyTypes, uiFilters.tenants]);

    useEffect(() => {
        if (activeTab === 'search') {
            fetchProperties(filters, 0);
            if (isLoggedIn) {
                api.get('/properties/favorites').then(res => setFavoriteIds(new Set(res.data.map(p => p.id)))).catch(()=>console.log("Logged out"));
            }
        } else {
            fetchFavorites();
        }
    }, [activeTab, isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload(); // Refresh the page to show Logged Out state
    };

    const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const handleApplyFilters = (e) => {
        e.preventDefault();
        setActiveTab('search');
        fetchProperties(filters, 0);
    };

    const handleClearFilters = () => {
        setFilters({ city: '', minRent: '', maxRent: '' });
        setUiFilters({ bhk: [], availability: '', tenants: [], propertyTypes: [], verifiedOnly: false, furnishing: '', sortBy: 'newest' });
        fetchProperties({ city: '', minRent: '', maxRent: '' }, 0);
    };

    const toggleArrayFilter = (field, value) => {
        setUiFilters(prev => {
            const currentArray = prev[field];
            return {
                ...prev,
                [field]: currentArray.includes(value) ? currentArray.filter(v => v !== value) : [...currentArray, value]
            };
        });
    };

    const handleToggleFavorite = async (e, propertyId) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            setIsAuthModalOpen(true); // Ask them to log in before favoriting!
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

    if (uiFilters.bhk.length > 0) {
        displayProperties = displayProperties.filter(p => uiFilters.bhk.includes(p.rooms) || (uiFilters.bhk.includes(4) && p.rooms >= 4));
    }

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

    if (uiFilters.verifiedOnly) {
        displayProperties = displayProperties.filter(p => p.verified || p.isVerified);
    }

    const mapCenter = displayProperties.length > 0 ? getPropertyCoords(displayProperties[0]) : [20.5937, 78.9629];

    return (
        <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-sans">

            {/* TOP NAVBAR REWRITTEN TO SUPPORT MODAL */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-3 flex justify-between items-center z-50 sticky top-0">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-[#fd3752] rounded flex items-center justify-center text-white font-bold text-xl">R</div>
                    <h1 className="text-xl font-bold text-[#464949] tracking-tight">RentNest</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="text-sm font-medium text-gray-600 hover:text-black">Pay Rent</button>

                    {/* Post Ad Button - Sends them to login if not authenticated */}
                    <button onClick={() => isLoggedIn ? navigate('/create-property') : setIsAuthModalOpen(true)} className="bg-white border border-[#009688] text-[#009688] hover:bg-teal-50 px-4 py-1.5 rounded font-medium transition text-sm">Post Free Property Ad</button>

                    {/* Dynamic Login/Logout Button */}
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="bg-[#464949] hover:bg-black text-white px-4 py-1.5 rounded font-medium transition text-sm">Logout</button>
                    ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#fd3752] hover:bg-[#e02d43] text-white px-4 py-1.5 rounded font-medium transition text-sm">Sign In / Register</button>
                    )}
                </div>
            </div>

            <div className="bg-[#f8f9fa] border-b border-gray-200 px-8 py-3 flex items-center gap-4 z-40">
                <div className="flex bg-white rounded-sm border border-gray-300 px-3 py-1.5 items-center w-full max-w-2xl shadow-sm">
                    <span className="text-xs font-bold text-gray-500 mr-2 uppercase">City</span>
                    <input type="text" name="city" value={filters.city} onChange={handleFilterChange} placeholder="Search Mumbai, Bengaluru..." className="bg-transparent outline-none text-sm w-full" />
                </div>
                <button onClick={handleApplyFilters} className="bg-[#fd3752] text-white px-8 py-2 rounded-sm font-bold text-sm hover:bg-[#e02d43] transition shadow-sm">Search</button>
            </div>

            <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:flex gap-6 mt-2">

                {/* LEFT SIDEBAR FILTERS */}
                <div className="w-full md:w-[320px] bg-white rounded-sm border border-gray-200 h-fit sticky top-[120px] mb-6 md:mb-0 flex-shrink-0 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button onClick={() => setActiveFilterTab('standard')} className={`flex-1 py-3 text-[14px] font-bold transition-colors ${activeFilterTab === 'standard' ? 'text-[#009688] border-b-2 border-[#009688]' : 'text-gray-500 hover:text-gray-800'}`}>Filters</button>
                        <button onClick={() => setActiveFilterTab('premium')} className={`flex-1 py-3 text-[14px] font-bold transition-colors flex items-center justify-center gap-1 ${activeFilterTab === 'premium' ? 'text-[#009688] border-b-2 border-[#009688]' : 'text-gray-500 hover:text-gray-800'}`}>Premium Filters <span className="text-[9px] bg-[#fd3752] text-white px-1 rounded shadow-sm">New</span></button>
                    </div>

                    <div className="p-5 overflow-y-auto max-h-[70vh]">
                        <div className="flex justify-end mb-4">
                            <button type="button" onClick={handleClearFilters} className="text-xs text-[#fd3752] font-medium hover:underline flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Reset
                            </button>
                        </div>

                        {activeFilterTab === 'standard' && (
                            <>
                                <div className="mb-6">
                                    <label className="block text-[13px] font-semibold text-[#464949] mb-3">BHK Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[{ label: '1 RK', val: 0 }, { label: '1 BHK', val: 1 }, { label: '2 BHK', val: 2 }, { label: '3 BHK', val: 3 }, { label: '4 BHK', val: 4 }, { label: '4+ BHK', val: 4 }].map(type => (
                                            <button key={type.label} onClick={() => toggleArrayFilter('bhk', type.val)} className={`border text-[12px] py-2 rounded-sm transition ${uiFilters.bhk.includes(type.val) ? 'border-[#009688] text-[#009688] bg-[#e6f4f3] font-bold shadow-inner' : 'border-gray-200 text-gray-600 bg-gray-50 hover:border-[#009688]'}`}>{type.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-[13px] font-semibold text-[#464949] mb-3">Rent Range</label>
                                    <div className="flex gap-2">
                                        <input type="number" name="minRent" placeholder="Min ₹" value={filters.minRent} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:border-[#009688] outline-none" />
                                        <span className="text-gray-400 self-center">-</span>
                                        <input type="number" name="maxRent" placeholder="Max ₹" value={filters.maxRent} onChange={handleFilterChange} className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:border-[#009688] outline-none" />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-[13px] font-semibold text-[#464949] mb-3">Availability</label>
                                    <div className="grid grid-cols-2 gap-y-3">
                                        {['Immediate', 'Within 15 Days', 'Within 30 Days', 'After 30 Days'].map(time => (
                                            <label key={time} className="flex items-center text-[13px] text-gray-700 cursor-pointer">
                                                <input type="radio" name="availability" checked={uiFilters.availability === time} onChange={() => setUiFilters({...uiFilters, availability: time})} className="mr-2 w-4 h-4 text-[#009688] focus:ring-[#009688] border-gray-300" />
                                                {time}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-[13px] font-semibold text-[#464949] mb-3">Preferred Tenants</label>
                                    <div className="grid grid-cols-2 gap-y-3">
                                        {[{ label: 'Family', val: 'FAMILY' }, { label: 'Company', val: 'COMPANY' }, { label: 'Bachelor Male', val: 'BACHELOR' }, { label: 'Bachelor Female', val: 'BACHELOR' }].map(tenant => (
                                            <label key={tenant.label} className="flex items-center text-[13px] text-gray-700 cursor-pointer">
                                                <input type="checkbox" checked={uiFilters.tenants.includes(tenant.val)} onChange={() => toggleArrayFilter('tenants', tenant.val)} className="mr-2 rounded-sm border-gray-300 text-[#009688] focus:ring-[#009688] w-4 h-4" />
                                                {tenant.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-[13px] font-semibold text-[#464949] mb-3">Property Type</label>
                                    <div className="space-y-3">
                                        {[{ label: 'Apartment', val: 'APARTMENT' }, { label: 'Independent House/Villa', val: 'HOUSE' }, { label: 'Studio', val: 'STUDIO' }].map(type => (
                                            <label key={type.label} className="flex items-center text-[13px] text-gray-700 cursor-pointer">
                                                <input type="checkbox" checked={uiFilters.propertyTypes.includes(type.val)} onChange={() => toggleArrayFilter('propertyTypes', type.val)} className="mr-2 rounded-sm border-gray-300 text-[#009688] focus:ring-[#009688] w-4 h-4" />
                                                {type.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeFilterTab === 'premium' && (
                            <>
                                <div className="mb-6">
                                    <label className="block text-[13px] font-semibold text-[#464949] mb-3">Sort By</label>
                                    <select value={uiFilters.sortBy} onChange={(e) => setUiFilters({...uiFilters, sortBy: e.target.value})} className="w-full border border-gray-300 rounded-sm p-2 text-[13px] focus:border-[#009688] outline-none bg-white">
                                        <option value="newest">Newest First</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                </div>
                                <div className="mb-6 border-t border-gray-100 pt-4">
                                    <label className="flex items-center text-[13px] font-semibold text-[#464949] cursor-pointer bg-blue-50 p-3 rounded border border-blue-100">
                                        <input type="checkbox" checked={uiFilters.verifiedOnly} onChange={(e) => setUiFilters({...uiFilters, verifiedOnly: e.target.checked})} className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 rounded-sm" />
                                        Show Verified Properties Only
                                    </label>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-[13px] font-semibold text-[#464949] mb-3">Furnishing Status</label>
                                    <div className="space-y-3">
                                        {['', 'FULLY_FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'].map(status => (
                                            <label key={status} className="flex items-center text-[13px] text-gray-700 cursor-pointer">
                                                <input type="radio" name="furnishing" checked={uiFilters.furnishing === status} onChange={() => setUiFilters({...uiFilters, furnishing: status})} className="mr-2 w-4 h-4 text-[#009688] focus:ring-[#009688] border-gray-300" />
                                                {status === '' ? 'Any' : status.replace('_', ' ')}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* RIGHT AREA: THE PROPERTIES */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex border-b border-gray-200 mb-4 gap-6 px-2">
                        <button onClick={() => setActiveTab('search')} className={`pb-2 px-1 text-[16px] font-bold transition-colors ${activeTab === 'search' ? 'text-[#fd3752] border-b-2 border-[#fd3752]' : 'text-[#878787] hover:text-[#464949]'}`}>Property Search</button>
                        <button onClick={() => {
                            if (!isLoggedIn) {
                                setIsAuthModalOpen(true);
                                return;
                            }
                            setActiveTab('shortlist');
                        }} className={`pb-2 px-1 text-[16px] font-bold transition-colors flex items-center ${activeTab === 'shortlist' ? 'text-[#fd3752] border-b-2 border-[#fd3752]' : 'text-[#878787] hover:text-[#464949]'}`}>
                            My Shortlist
                            {favoriteIds.size > 0 && <span className="ml-2 bg-[#fd3752] text-white text-[10px] px-1.5 py-0.5 rounded-full">{favoriteIds.size}</span>}
                        </button>
                    </div>

                    <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-3">
                        <h2 className="text-sm font-semibold text-gray-600">{displayProperties.length} Properties Found</h2>

                        <div className="bg-white border border-gray-200 rounded-sm flex shadow-sm">
                            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 text-xs font-bold transition ${viewMode === 'list' ? 'bg-gray-100 text-[#464949] shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}>List</button>
                            <button onClick={() => setViewMode('grid')} className={`px-4 py-1.5 text-xs font-bold transition border-l border-r border-gray-200 ${viewMode === 'grid' ? 'bg-gray-100 text-[#464949] shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}>Grid</button>
                            <button onClick={() => setViewMode('map')} className={`px-4 py-1.5 text-xs font-bold flex items-center gap-1 transition ${viewMode === 'map' ? 'bg-[#009688] text-white' : 'text-gray-500 hover:bg-gray-50'}`}><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> Map</button>
                        </div>
                    </div>

                    <div className={`flex-grow ${viewMode === 'map' ? 'flex h-[75vh] gap-4' : ''}`}>
                        <div className={`${viewMode === 'map' ? 'w-[45%] overflow-y-auto pr-2' : 'w-full'}`}>
                            {loading ? (
                                <div className="space-y-4">
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </div>
                            ) : displayProperties.length === 0 ? (
                                <div className="bg-white p-12 text-center border border-gray-200 rounded">
                                    <h3 className="font-bold text-gray-900 mb-2">No matching properties</h3>
                                    <p className="text-sm text-gray-500">Try adjusting your filters on the left.</p>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
                                    {displayProperties.map((prop) => (
                                        <PropertyCard key={prop.id} prop={prop} viewMode={viewMode} isFavorited={favoriteIds.has(prop.id)} onToggleFavorite={handleToggleFavorite} navigate={navigate} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {viewMode === 'map' && !loading && displayProperties.length > 0 && (
                            <div className="w-[55%] h-full bg-gray-200 rounded overflow-hidden sticky top-[120px] border border-gray-200 shadow-sm relative z-0">
                                <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {displayProperties.map(prop => (
                                        <Marker position={getPropertyCoords(prop)} icon={customIcon} key={prop.id}>
                                            <Popup>
                                                <div className="text-center font-sans">
                                                    <strong className="text-[#009688] block text-[13px]">{prop.rooms} BHK {prop.type}</strong>
                                                    <span className="text-gray-600 font-bold block mt-1">₹{prop.rentAmount}/mo</span>
                                                    <button onClick={() => navigate(`/property/${prop.id}`)} className="mt-2 bg-[#fd3752] text-white text-[10px] font-bold px-3 py-1 rounded">View Details</button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        )}
                    </div>

                    {activeTab === 'search' && !loading && totalPages > 1 && (
                        <div className="mt-8 flex justify-center items-center space-x-2 pb-10">
                            <button onClick={() => fetchProperties(filters, page - 1)} disabled={page === 0} className={`px-4 py-2 border rounded-sm text-sm font-bold shadow-sm ${page === 0 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-[#464949] hover:bg-gray-50'}`}>Prev</button>
                            <span className="text-sm font-medium text-gray-600 px-4">Page {page + 1} of {totalPages}</span>
                            <button onClick={() => fetchProperties(filters, page + 1)} disabled={page === totalPages - 1} className={`px-4 py-2 border rounded-sm text-sm font-bold shadow-sm ${page === totalPages - 1 ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-[#464949] hover:bg-gray-50'}`}>Next</button>
                        </div>
                    )}
                </div>
            </div>

            {/* THE POPUP ITSELF */}
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};

export default Dashboard;