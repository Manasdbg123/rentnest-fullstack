import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const CreateProperty = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '', description: '', rentAmount: '', depositAmount: '', squareFootage: '',
        contactNumber: '', city: '', locality: '', type: 'APARTMENT', furnishingStatus: 'SEMI_FURNISHED',
        rooms: '', availableFrom: '', tenantPreference: 'ANY'
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]); // NEW: Stores the image preview URLs
    const [isDragging, setIsDragging] = useState(false); // NEW: Drag state

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // ==========================================
    // NEW: Drag and Drop Logic
    // ==========================================
    const processFiles = (newFiles) => {
        const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
        setImages(prev => [...prev, ...validFiles]);

        // Generate local URLs to preview the images instantly
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };
    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
        }
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
        // Clean up memory to prevent memory leaks
        URL.revokeObjectURL(previews[indexToRemove]);
        setPreviews(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        images.forEach(image => data.append('images', image));

        try {
            await api.post('/properties', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/my-properties');
        } catch (err) {
            setError('Failed to create property.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f4f4] py-10 px-4 font-sans">
            <div className="max-w-[900px] mx-auto bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#009688] px-8 py-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Post Free Property Ad</h2>
                        <p className="opacity-90 mt-1 text-sm">Get your property rented fast to verified tenants.</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="text-white hover:text-gray-200 font-bold text-sm">Cancel</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {error && <div className="bg-red-50 text-red-600 p-4 rounded text-sm font-medium border border-red-100">{error}</div>}

                    {/* Section 1: Basic Details */}
                    <div>
                        <h3 className="text-lg font-bold text-[#464949] border-b pb-2 mb-4">Property Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">Ad Title</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none transition" placeholder="e.g. Beautiful 2 BHK in Koramangala" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#464949] mb-2">City</label>
                                    <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#464949] mb-2">Locality</label>
                                    <input type="text" name="locality" required value={formData.locality} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-[#464949] mb-2">Property Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none bg-white">
                                        <option value="APARTMENT">Apartment</option>
                                        <option value="HOUSE">House</option>
                                        <option value="VILLA">Villa</option>
                                        <option value="STUDIO">Studio</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Financials & Features */}
                    <div>
                        <h3 className="text-lg font-bold text-[#464949] border-b pb-2 mb-4">Pricing & Features</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">Rent (₹)</label>
                                <input type="number" name="rentAmount" required value={formData.rentAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">Deposit (₹)</label>
                                <input type="number" name="depositAmount" required value={formData.depositAmount} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">Area (Sq.Ft)</label>
                                <input type="number" name="squareFootage" required value={formData.squareFootage} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">BHK / Rooms</label>
                                <input type="number" name="rooms" required min="1" value={formData.rooms} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">Furnishing</label>
                                <select name="furnishingStatus" value={formData.furnishingStatus} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none bg-white">
                                    <option value="UNFURNISHED">Unfurnished</option>
                                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">Preferred Tenants</label>
                                <select name="tenantPreference" value={formData.tenantPreference} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none bg-white">
                                    <option value="ANY">Any</option>
                                    <option value="FAMILY">Family Only</option>
                                    <option value="BACHELOR">Bachelors Allowed</option>
                                    <option value="COMPANY">Company Lease</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#464949] mb-2">Available From</label>
                                <input type="date" name="availableFrom" required value={formData.availableFrom} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Contact & Description */}
                    <div>
                        <h3 className="text-lg font-bold text-[#464949] border-b pb-2 mb-4">Contact & Details</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#464949] mb-2">WhatsApp Contact Number</label>
                            <input type="text" name="contactNumber" required value={formData.contactNumber} onChange={handleChange} placeholder="e.g. 919876543210" className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#464949] mb-2">Property Description</label>
                            <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="w-full border border-gray-300 rounded-sm p-3 focus:border-[#009688] outline-none resize-none"></textarea>
                        </div>
                    </div>

                    {/* Section 4: DRAG AND DROP IMAGES */}
                    <div>
                        <h3 className="text-lg font-bold text-[#464949] border-b pb-2 mb-4">Upload Photos</h3>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${isDragging ? 'border-[#009688] bg-teal-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                        >
                            <label className="cursor-pointer block">
                                <svg className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-[#009688]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                <span className="text-base font-bold text-[#009688]">Drag & Drop images here</span>
                                <span className="block text-sm text-gray-500 mt-1">or click to browse from your computer</span>
                                <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
                            </label>
                        </div>

                        {/* Image Previews Grid */}
                        {previews.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-sm font-bold text-gray-600 mb-3">{previews.length} File(s) Selected</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative group rounded-md overflow-hidden border border-gray-200 shadow-sm aspect-video">
                                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                            {/* Delete Button overlaid on image */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md text-xs font-bold"
                                            >
                                                X
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6">
                        <button type="submit" disabled={loading || images.length === 0} className="bg-[#009688] hover:bg-[#00796b] text-white px-10 py-3.5 rounded-sm font-bold text-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Uploading & Posting...' : 'Post Ad Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProperty;