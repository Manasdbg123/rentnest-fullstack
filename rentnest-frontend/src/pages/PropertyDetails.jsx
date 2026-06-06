import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

// MAP IMPORTS
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

// Mocking coordinates for the embedded map
const cityCoordinates = {
    'Bengaluru': [12.9716, 77.5946], 'Mumbai': [19.0760, 72.8777],
    'Pune': [18.5204, 73.8567], 'Delhi': [28.7041, 77.1025], 'Hyderabad': [17.3850, 78.4867]
};

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [activeImage, setActiveImage] = useState(null);
    const [isFavorited, setIsFavorited] = useState(false);

    // Calculator State
    const [calcMovers, setCalcMovers] = useState(3000);
    const [calcSetup, setCalcSetup] = useState(5000);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const propRes = await api.get(`/properties/${id}`);
                setProperty(propRes.data);
                if (propRes.data.images && propRes.data.images.length > 0) {
                    const primary = propRes.data.images.find(img => img.primary || img.isPrimary);
                    setActiveImage(primary ? primary.imageUrl : propRes.data.images[0].imageUrl);
                }
                const favRes = await api.get('/properties/favorites');
                setIsFavorited(favRes.data.some(fav => fav.id === parseInt(id)));
            } catch (err) {
                setError('Failed to load property details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleToggleFavorite = async () => {
        try {
            const response = await api.post(`/properties/${id}/favorite`);
            setIsFavorited(response.data);
        } catch (err) {
            alert('Failed to update favorite status.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-sans p-8">
                <div className="max-w-[1200px] mx-auto w-full animate-pulse">
                    <div className="h-8 bg-gray-200 w-1/3 mb-4 rounded"></div>
                    <div className="h-[400px] bg-gray-300 w-full rounded mb-8"></div>
                    <div className="flex gap-8">
                        <div className="w-2/3 h-64 bg-gray-200 rounded"></div>
                        <div className="w-1/3 h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !property) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error || 'Not found'}</div>;

    const whatsappMessage = encodeURIComponent(`Hi ${property.owner.name}, I am interested in your ${property.rooms} BHK property in ${property.locality} listed on RentNest. Is it still available?`);

    // Coordinates for the embedded map
    const baseCoords = cityCoordinates[property.city] || [20.5937, 78.9629];
    const offsetLat = (property.id % 20 - 10) * 0.005;
    const offsetLng = ((property.id * 3) % 20 - 10) * 0.005;
    const mapCoords = [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng];

    // Calculator Math
    const totalMoveInCost = property.rentAmount + property.depositAmount + Number(calcMovers) + Number(calcSetup);

    return (
        <div className="min-h-screen bg-[#f4f4f4] font-sans pb-12">

            {/* Top Navbar */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-3 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-[#fd3752] rounded flex items-center justify-center text-white font-bold text-xl">R</div>
                    <h1 className="text-xl font-bold text-[#464949] tracking-tight">RentNest</h1>
                </div>
                <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-[#009688] font-bold text-sm flex items-center gap-1">
                    &larr; Back to Search
                </button>
            </div>

            <div className="max-w-[1200px] mx-auto mt-6 px-4 md:px-0">

                {/* Breadcrumbs */}
                <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                    <span className="hover:underline cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> &gt;
                    <span className="hover:underline cursor-pointer">{property.city}</span> &gt;
                    <span className="hover:underline cursor-pointer">{property.locality}</span> &gt;
                    <span className="font-bold text-gray-700">{property.rooms} BHK {property.type}</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">

                    {/* LEFT COLUMN - MAIN DETAILS */}
                    <div className="flex-1 min-w-0">

                        {/* Title Card */}
                        <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-5 mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-2xl font-bold text-[#464949]">{property.rooms} BHK {property.type} For Rent In {property.locality}</h1>
                                        {property.verified && (
                                            <span className="bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 text-sm flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {property.locality}, {property.city}
                                    </p>
                                </div>
                                <button onClick={handleToggleFavorite} className={`p-2 border border-gray-200 rounded hover:bg-gray-50 transition ${isFavorited ? 'bg-red-50 border-red-100' : ''}`}>
                                    <svg className={`w-6 h-6 ${isFavorited ? 'text-[#fd3752] fill-current' : 'text-gray-400'}`} fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Image Gallery */}
                        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden mb-6">
                            <div className="bg-black relative h-[450px] w-full flex items-center justify-center">
                                {activeImage ? <img src={activeImage} alt="Main" className="w-full h-full object-contain" /> : <div className="text-gray-500">No Images Available</div>}
                            </div>
                            {property.images && property.images.length > 1 && (
                                <div className="flex p-4 gap-3 bg-gray-50 border-t border-gray-200 overflow-x-auto">
                                    {property.images.map(img => (
                                        <img key={img.id} src={img.imageUrl} onClick={() => setActiveImage(img.imageUrl)} className={`h-16 w-24 object-cover cursor-pointer rounded border-2 transition ${activeImage === img.imageUrl ? 'border-[#009688] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Property Overview Grid */}
                        <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold text-[#464949] mb-4 pb-2 border-b">Property Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Furnishing</p>
                                    <p className="font-semibold text-[#464949] mt-1">{property.furnishingStatus.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tenant Preference</p>
                                    <p className="font-semibold text-[#464949] mt-1">{property.tenantPreference}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Availability</p>
                                    <p className="font-semibold text-[#00a859] mt-1">
                                        {new Date(property.availableFrom) <= new Date() ? 'Immediate' : new Date(property.availableFrom).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Property Age</p>
                                    <p className="font-semibold text-[#464949] mt-1">1-5 Years</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold text-[#464949] mb-4 pb-2 border-b">Description</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">{property.description}</p>
                        </div>

                        {/* EMBEDDED MAP */}
                        <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold text-[#464949] mb-4 pb-2 border-b">Explore Neighborhood</h2>
                            <div className="h-[350px] w-full bg-gray-200 rounded overflow-hidden border border-gray-200 z-0 relative">
                                <MapContainer center={mapCoords} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={mapCoords} icon={customIcon}>
                                        <Popup>Exact location provided after contacting owner.</Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN - STICKY WIDGETS */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="sticky top-20 space-y-6">

                            {/* Pricing & Contact Card */}
                            <div className="bg-white rounded-sm border border-gray-200 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                                    <div>
                                        <p className="text-3xl font-extrabold text-[#464949]">₹{property.rentAmount}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase mt-1">Rent / Month</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-[#464949]">₹{property.depositAmount?.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500 font-bold uppercase mt-1">Deposit</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded p-4 flex items-center justify-between border border-gray-100 mb-6">
                                    <span className="font-bold text-gray-600 text-sm">Builtup Area</span>
                                    <span className="font-bold text-[#464949]">{property.squareFootage} Sq.Ft</span>
                                </div>

                                <a
                                    href={`https://wa.me/${property.contactNumber}?text=${whatsappMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#009688] hover:bg-[#00796b] text-white py-3.5 rounded-sm font-bold shadow transition flex items-center justify-center gap-2 uppercase tracking-wide text-sm mb-4"
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                    Chat on WhatsApp
                                </a>

                                <div className="pt-4 border-t border-gray-100 flex items-center">
                                    <div className="w-10 h-10 bg-[#fd3752] rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 shadow-sm">
                                        {property.owner.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#464949] text-sm uppercase">{property.owner.name}</p>
                                        <p className="text-gray-500 text-xs">Property Owner</p>
                                    </div>
                                </div>
                            </div>

                            {/* MOVE-IN COST CALCULATOR (NEW) */}
                            <div className="bg-white rounded-sm border border-[#009688] shadow-md p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-[#009688] text-white text-[10px] font-bold px-2 py-1 rounded-bl">UTILITY</div>
                                <h3 className="text-sm font-bold text-[#464949] uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    Total Move-In Cost
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">1st Month Rent</span>
                                        <span className="font-semibold">₹{property.rentAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Security Deposit</span>
                                        <span className="font-semibold">₹{property.depositAmount.toLocaleString()}</span>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-gray-600">Packers & Movers (Est.)</span>
                                            <input type="number" value={calcMovers} onChange={(e) => setCalcMovers(e.target.value)} className="w-24 border border-gray-300 rounded p-1 text-right text-sm outline-none focus:border-[#009688]" />
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Setup/Utilities (Est.)</span>
                                            <input type="number" value={calcSetup} onChange={(e) => setCalcSetup(e.target.value)} className="w-24 border border-gray-300 rounded p-1 text-right text-sm outline-none focus:border-[#009688]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#e6f4f3] p-4 rounded text-center border border-[#b2dfdb]">
                                    <p className="text-xs text-gray-600 font-bold uppercase mb-1">Estimated Cash Needed</p>
                                    <p className="text-2xl font-extrabold text-[#009688]">₹{totalMoveInCost.toLocaleString()}</p>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;