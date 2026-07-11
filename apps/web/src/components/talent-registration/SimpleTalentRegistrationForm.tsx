'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Sparkles, CheckCircle2, Globe, Award, Briefcase, User, Mail, Phone, Lock, MapPin, Film, ChevronDown, Search, Check } from 'lucide-react';
import Link from 'next/link';
import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { createClient } from '@/utils/supabase/client';
import { fetchAPI } from '@/lib/api-client';

const TALENT_CATEGORIES = [
  { id: 'actor', label: 'Lead & Supporting Actor / Actress' },
  { id: 'model', label: 'Fashion & Commercial Model' },
  { id: 'musician', label: 'Vocalist / Musician / Composer' },
  { id: 'dancer', label: 'Professional Dancer / Choreographer' },
  { id: 'voice', label: 'Voice Over Artist / Dubbing' },
  { id: 'creator', label: 'Digital Content Creator / Influencer' },
  { id: 'director', label: 'Cinematographer / Director / Writer' },
  { id: 'other', label: 'Versatile / Multi-Disciplinary Talent' },
];

const EXPERIENCE_LEVELS = [
  { id: 'fresher', label: 'Fresher / Emerging (0 - 1 Years)' },
  { id: 'junior', label: 'Intermediate (1 - 3 Years)' },
  { id: 'mid', label: 'Experienced Professional (3 - 5 Years)' },
  { id: 'senior', label: 'Seasoned Veteran (5+ Years)' },
];

const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Mayabunder', 'Car Nicobar', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Eluru', 'Kadapa', 'Srikakulam', 'Vizianagaram', 'Other'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat', 'Ziro', 'Bomdila', 'Roing', 'Aalo', 'Naharlagun', 'Other'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Diphu', 'Other'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Saharsa', 'Other'],
  'Chandigarh': ['Chandigarh', 'Other'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Other'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa', 'Other'],
  'Delhi NCR': ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Gurugram (Gurgaon)', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad', 'Other'],
  'Goa': ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda', 'Calangute', 'Candolim', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari', 'Morbi', 'Bhuj', 'Bharuch', 'Vapi', 'Other'],
  'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Other'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Kullu', 'Chamba', 'Hamirpur', 'Una', 'Other'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Sopore', 'Udhampur', 'Poonch', 'Other'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Other'],
  'Karnataka': ['Bengaluru (Bangalore)', 'Mysuru (Mysore)', 'Hubballi-Dharwad', 'Mangaluru (Mangalore)', 'Belagavi (Belgaum)', 'Kalaburagi (Gulbarga)', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga (Shimoga)', 'Tumakuru', 'Udupi', 'Other'],
  'Kerala': ['Thiruvananthapuram', 'Kochi (Cochin)', 'Kozhikode (Calicut)', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kottayam', 'Kasargod', 'Other'],
  'Ladakh': ['Leh', 'Kargil', 'Other'],
  'Lakshadweep': ['Kavaratti', 'Agatti', 'Minicoy', 'Andrott', 'Other'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara (Katni)', 'Singrauli', 'Burhanpur', 'Khandwa', 'Other'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Ahilyanagar (Ahmednagar)', 'Dhule', 'Ichalkaranji', 'Chandrapur', 'Parbhani', 'Jalna', 'Satara', 'Ratnagiri', 'Other'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Other'],
  'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara', 'Other'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Serchhip', 'Other'],
  'Nagaland': ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Raurkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Baleshwar', 'Bhadrak', 'Baripada', 'Balangir', 'Other'],
  'Puducherry': ['Puducherry (Pondicherry)', 'Karaikal', 'Mahe', 'Yanam', 'Other'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'SAS Nagar (Mohali)', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Chittorgarh', 'Other'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Other'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Tiruppur', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Virudhunagar', 'Karur', 'Udhagamandalam (Ooty)', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Other'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Pratapgarh', 'Kailasahar', 'Belonia', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Prayagraj (Allahabad)', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Almora', 'Other'],
  'West Bengal': ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'English Bazar (Malda)', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Jalpaiguri', 'Darjeeling', 'Other'],
  'Other / International': ['Other City / International Location']
};

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
        {label} {required && <span className="text-[#E50914]">*</span>}
      </label>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch('');
        }}
        className={`input-premium bg-white/5 border text-white w-full py-3.5 px-4 cursor-pointer flex justify-between items-center transition-all ${
          error ? 'border-[#E50914]' : isOpen ? 'border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-black/80' : 'border-white/20 hover:border-white/40'
        } rounded-xl`}
      >
        <span className={value ? 'text-white font-medium truncate pr-2' : 'text-gray-500 truncate pr-2'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#F59E0B]' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-[#0A0A0C] border border-white/20 rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            <div className="p-2.5 border-b border-white/10 bg-black/80 relative flex items-center">
              <Search className="w-4 h-4 text-[#F59E0B] absolute left-4.5" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-white/5 border border-white/20 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-white/50 focus:outline-none focus:border-[#F59E0B] focus:bg-black/80"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-white/5 py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${
                      value === opt
                        ? 'bg-[#E50914]/20 text-[#E50914] font-bold'
                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {value === opt && <Check className="w-3.5 h-3.5 text-[#E50914] shrink-0" />}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (search.trim()) {
                      onChange(search.trim());
                      setIsOpen(false);
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-xs text-[#F59E0B] hover:bg-white/10 flex items-center gap-2 font-semibold"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Use custom: "{search}"</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-[#E50914] text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

export function SimpleTalentRegistrationForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '+91 ',
    email: '',
    password: '',
    category: 'actor',
    experience: 'fresher',
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '',
    bio: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.mobile || formData.mobile.length < 8) newErrors.mobile = 'Enter a valid contact number';
    if (!formData.email.includes('@')) newErrors.email = 'Enter a valid email address';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms to proceed';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields precisely.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register using Server-Side Auth API (which bypasses SMTP verification limits)
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          role: 'talent',
          category: formData.category,
          experienceLevel: formData.experience,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          bio: formData.bio || `Passionate ${formData.category} from ${formData.city}.`,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.message || 'Registration failed');
      }

      // Auto-login the talent after successful registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (loginError) throw loginError;

      // Create the backend TalentProfile (PENDING_REVIEW) so the applicant
      // appears in the admin moderation queue and — once approved — the public
      // directory. The profile can be enriched later in the talent dashboard.
      try {
        await fetchAPI('/talent/submit', {
          method: 'POST',
          body: JSON.stringify({
            stageName: `${formData.firstName} ${formData.lastName}`.trim(),
            bio: formData.bio || `Passionate ${formData.category} from ${formData.city}.`,
            experienceLevel: formData.experience,
          }),
        });
      } catch (profileErr) {
        // Non-blocking: the profile can still be completed from the dashboard.
        console.error('Talent profile creation deferred:', profileErr);
      }

      toast.success('🎉 Registration Successful! Redirecting to your Talent Dashboard where you can upload photos & details...');
      
      setTimeout(() => {
        router.push('/talent-dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] text-white relative overflow-x-hidden grain selection:bg-[#E50914] selection:text-white">
      <PortalNavbar title="PREMIUM TALENT ONBOARDING" />

      {/* Background Multi-Color Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[#E50914]/20 via-[#F59E0B]/10 to-[#38BDF8]/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-3/4 right-10 w-[500px] h-[500px] bg-[#E50914]/10 blur-[160px] pointer-events-none rounded-full" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Streamlined Quick Onboarding
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight flex flex-col items-center gap-4">
            <img src="/logo.png" alt="MP Productions" className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(235,61,38,0.3)]" />
            <span>Join the <span className="text-gradient-brand">Roster</span></span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 leading-relaxed">
            Register below with your essential contact details. Once registered, you will unlock immediate access to your <span className="text-white font-semibold">Personal Talent Dashboard</span> where you can upload photos, showreels, social links, and multiple talents at your own pace.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="card-awwwards rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden border border-white/15"
        >
          {/* Subtle Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E50914] via-[#F59E0B] to-[#38BDF8]" />

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Basic Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold tracking-widest uppercase text-[#38BDF8]">
                <User className="w-4 h-4" /> 01. Personal Identification
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    First Name <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aditya"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-premium bg-white/5 border border-white/20 focus:border-[#E50914] rounded-xl text-white placeholder-white/50 focus:bg-black/80 w-full py-3.5 px-4"
                  />
                  {errors.firstName && <p className="text-[#E50914] text-xs mt-1.5 font-medium">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Last Name <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-premium bg-white/5 border border-white/20 focus:border-[#E50914] rounded-xl text-white placeholder-white/50 focus:bg-black/80 w-full py-3.5 px-4"
                  />
                  {errors.lastName && <p className="text-[#E50914] text-xs mt-1.5 font-medium">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="input-premium bg-white/5 border border-white/20 focus:border-[#E50914] rounded-xl text-white placeholder-white/50 focus:bg-black/80 w-full py-3.5 pl-11 pr-4"
                    />
                  </div>
                  {errors.mobile && <p className="text-[#E50914] text-xs mt-1.5 font-medium">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Email Address <span className="text-[#E50914]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      placeholder="talent@mpproductions.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-premium bg-white/5 border border-white/20 focus:border-[#E50914] rounded-xl text-white placeholder-white/50 focus:bg-black/80 w-full py-3.5 pl-11 pr-4"
                    />
                  </div>
                  {errors.email && <p className="text-[#E50914] text-xs mt-1.5 font-medium">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Create Account Password <span className="text-[#E50914]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Min. 6 characters for login"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-premium bg-white/5 border border-white/20 focus:border-[#E50914] rounded-xl text-white placeholder-white/50 focus:bg-black/80 w-full py-3.5 pl-11 pr-4"
                  />
                </div>
                {errors.password && <p className="text-[#E50914] text-xs mt-1.5 font-medium">{errors.password}</p>}
              </div>
            </div>

            {/* Section 2: Professional Profile */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-bold tracking-widest uppercase text-[#F59E0B]">
                <Film className="w-4 h-4" /> 02. Professional Specialization
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Primary Talent Category <span className="text-[#E50914]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-premium bg-white/5 border border-white/20 focus:border-[#F59E0B] rounded-xl text-white w-full py-3.5 px-4 cursor-pointer"
                  >
                    {TALENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-[#0A0A0C] text-white py-2">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Experience Level <span className="text-[#E50914]">*</span>
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="input-premium bg-white/5 border border-white/20 focus:border-[#F59E0B] rounded-xl text-white w-full py-3.5 px-4 cursor-pointer"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.id} value={level.id} className="bg-[#0A0A0C] text-white py-2">
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SearchableDropdown
                  label="State / Province"
                  value={formData.state}
                  options={Object.keys(INDIAN_STATES_AND_CITIES)}
                  placeholder="Select State"
                  required={true}
                  onChange={(newState) => {
                    const cities = INDIAN_STATES_AND_CITIES[newState] || ['Other City'];
                    setFormData({
                      ...formData,
                      state: newState,
                      city: cities[0] || 'Other City'
                    });
                  }}
                />

                <SearchableDropdown
                  label="Current City / Hub"
                  value={formData.city}
                  options={INDIAN_STATES_AND_CITIES[formData.state] || ['Other City']}
                  placeholder="Select City"
                  required={true}
                  error={errors.city}
                  onChange={(newCity) => setFormData({ ...formData, city: newCity })}
                />

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Pincode <span className="text-[#E50914]">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 400001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                    className="input-premium bg-white/5 border border-white/20 focus:border-[#F59E0B] rounded-xl text-white placeholder-white/50 focus:bg-black/80 w-full py-3.5 px-4 tracking-wider"
                  />
                  {errors.pincode && <p className="text-[#E50914] text-xs mt-1.5 font-medium">{errors.pincode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>About You / Quick Summary</span>
                  <span className="text-gray-500 text-[11px] font-normal">Can be edited anytime later</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell our casting directors a bit about your passions, past projects, or training..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input-premium bg-white/5 border border-white/20 focus:border-[#E50914] rounded-xl text-white placeholder-white/50 focus:bg-black/80 w-full p-4 resize-y"
                />
              </div>
            </div>

            {/* Terms & Submit Section */}
            <div className="pt-6 border-t border-white/10 space-y-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-black/60 text-[#E50914] focus:ring-[#E50914] cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                  I agree to the <Link href="/terms" className="text-[#E50914] underline hover:text-[#F59E0B]">Terms of Service</Link> & <Link href="/privacy" className="text-[#E50914] underline hover:text-[#F59E0B]">Privacy Policy</Link> of MP Productions and confirm all provided details are accurate.
                </span>
              </label>
              {errors.acceptTerms && <p className="text-[#E50914] text-xs font-medium">{errors.acceptTerms}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E50914] via-[#D40812] to-[#B0070F] hover:from-[#FF1E27] hover:to-[#E50914] text-white font-extrabold text-sm sm:text-base tracking-widest uppercase shadow-[0_0_35px_rgba(229,9,20,0.45)] hover:shadow-[0_0_50px_rgba(229,9,20,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Your Portfolio...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration & Go To Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Already have an active talent account?{' '}
                  <Link href="/login" className="text-white font-semibold hover:text-[#F59E0B] transition-colors underline">
                    Sign In Here
                  </Link>
                </p>
              </div>
            </div>

          </form>
        </motion.div>

        {/* Post-Registration Feature Preview */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Award className="w-8 h-8 text-[#F59E0B] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Instant Portfolio Hub</h4>
            <p className="text-xs text-gray-400">Add unlimited showreels, high-res photos & vocal clips inside your dashboard.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Globe className="w-8 h-8 text-[#38BDF8] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Casting Discovery</h4>
            <p className="text-xs text-gray-400">Get discovered directly by verified directors, producers, and premium brands.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Briefcase className="w-8 h-8 text-[#E50914] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">Add-On Anytime</h4>
            <p className="text-xs text-gray-400">No pressure during registration. Expand languages, skills & rates whenever ready.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
