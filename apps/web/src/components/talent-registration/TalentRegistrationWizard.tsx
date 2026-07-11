'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { WizardProgress, WizardNavigation } from './WizardChrome';
import { StepAccountCreation } from './StepAccountCreation';
import { StepProfessionalIdentity } from './StepProfessionalIdentity';
import { StepProfessionalDetails } from './StepProfessionalDetails';
import { StepPortfolioBuilder } from './StepPortfolioBuilder';
import { StepAboutMe } from './StepAboutMe';
import { StepSocialMedia } from './StepSocialMedia';
import { StepProfilePreview } from './StepProfilePreview';
import { fetchAPI } from '@/lib/api-client';


const WIZARD_STEPS = [
  { 
    label: 'Account Creation', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 
  },
  { 
    label: 'Professional Identity', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 11h6"/><path d="M19 8v6"/></svg>
  },
  { 
    label: 'Professional Details', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> 
  },
  { 
    label: 'Portfolio Builder', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> 
  },
  { 
    label: 'About Me', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> 
  },
  { 
    label: 'Social Media', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> 
  },
  { 
    label: 'Review & Publish', 
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 
  },
];

export function TalentRegistrationWizard() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Unified Wizard State
  const [data, setData] = useState({
    // Step 1
    fullName: '', stageName: '', email: '', phone: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: '', country: '', state: '', city: '', acceptTerms: false,
    
    // Step 2
    primaryTalentId: '', secondaryTalentIds: [] as string[], experienceLevel: '',
    languages: [] as string[], skills: [] as string[],
    
    // Step 3
    attributes: {} as Record<string, any>,
    
    // Step 4
    profilePhoto: null as File | null, profilePhotoPreview: '',
    coverBanner: null as File | null, coverBannerPreview: '',
    galleryImages: [] as { id: string; url: string; file?: File }[],
    introductionVideo: null as File | null, introductionVideoPreview: '',
    resume: null as File | null, resumeName: '',
    compCard: null as File | null, compCardName: '',
    
    // Step 5
    bio: '', achievements: [] as { title: string; year: string }[],
    education: [] as { institution: string; degree: string; year: string }[],
    brandsWorkedWith: [] as string[], pricingType: '', pricingAmount: '',
    isAvailableForTravel: true, isAvailableForRemote: true, isAvailableImmediate: true,
    
    // Step 6
    instagram: '', youtube: '', facebook: '', linkedin: '', imdb: '', website: '',
    portfolio: '', behance: '', pinterest: '', spotify: '', tiktok: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAPI('/talent-category')
      .then(resData => setCategories(resData.data || resData))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!data.fullName) newErrors.fullName = 'Full Name is required';
      if (!data.email) newErrors.email = 'Email is required';
      if (!data.phone) newErrors.phone = 'Phone number is required';
      if (!data.password || data.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!data.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';
    } else if (step === 2) {
      if (!data.primaryTalentId) newErrors.primaryTalentId = 'Please select a primary talent';
    }
    // Simple validation for POC. Real validation happens via Zod on the API.

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) isValid = false;
    return isValid;
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      if (currentStep === 1 && !data.acceptTerms) {
        toast.error('Please check "I agree to the Terms & Conditions and Privacy Policy" at the bottom to continue.');
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
      } else {
        toast.error('Please fix the highlighted errors before continuing.');
      }
      return;
    }
    
    if (currentStep < WIZARD_STEPS.length) {
      // Save draft in background (don't block UI)
      fetchAPI('/talent/draft', {
        method: 'POST',
        body: JSON.stringify({ currentStep: currentStep + 1, wizardData: data }),
      }).catch(console.error);

      setCurrentStep(prev => prev + 1);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      submitProfile();
    }
  };

  const saveDraftExplicit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetchAPI('/talent/draft', {
        method: 'POST',
        body: JSON.stringify({ currentStep, wizardData: data }),
      });
      // fetchAPI throws if response is not ok
      toast.success('Draft saved successfully! You can resume later.');
    } catch (error) {
      toast.error('Could not save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProfile = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetchAPI('/talent/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      toast.success('Profile submitted successfully! Pending admin review.');
      router.push('/');
    } catch (error) {
      toast.error('Failed to submit profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateData = (newData: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...newData }));
    // Clear error for updated field
    const newErrors = { ...errors };
    Object.keys(newData).forEach(key => delete newErrors[key]);
    setErrors(newErrors);
  };

  const primaryCategory = categories.find(c => c.id === data.primaryTalentId);
  const dynamicFields = primaryCategory?.fields || [];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col md:flex-row">
      
      {/* Top Mobile Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-40">
        <img src="/logo.png" alt="MP Productions" className="h-8 w-auto object-contain" />
        
      </div>

      {/* Left Sidebar (Desktop) */}
      <div className="hidden md:block w-80 lg:w-96 flex-shrink-0 bg-[var(--surface)] border-r border-[var(--border)] sticky top-0 h-screen overflow-y-auto custom-scrollbar p-8">
        <WizardProgress
          currentStep={currentStep}
          totalSteps={WIZARD_STEPS.length}
          steps={WIZARD_STEPS}
          completionPercent={Math.round(((currentStep - 1) / WIZARD_STEPS.length) * 100)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative h-screen max-h-screen overflow-hidden">
        
        {/* Top Desktop Bar */}
        <div className="hidden md:flex items-center justify-end p-6 absolute top-0 right-0 z-40">
          
        </div>

        {/* Scrolling Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 pb-12">
          <div className="max-w-4xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {currentStep === 1 && (
                  <StepAccountCreation data={data} onChange={updateData} errors={errors} />
                )}
                {currentStep === 2 && (
                  <StepProfessionalIdentity data={data} categories={categories} onChange={updateData} errors={errors} />
                )}
                {currentStep === 3 && (
                  <StepProfessionalDetails 
                    categoryName={primaryCategory?.name || 'Talent'}
                    fields={dynamicFields} 
                    data={data.attributes} 
                    onChange={(attrs) => updateData({ attributes: attrs })} 
                    errors={errors} 
                  />
                )}
                {currentStep === 4 && (
                  <StepPortfolioBuilder data={data} onChange={updateData} errors={errors} />
                )}
                {currentStep === 5 && (
                  <StepAboutMe data={data} onChange={updateData} errors={errors} />
                )}
                {currentStep === 6 && (
                  <StepSocialMedia data={data} onChange={updateData} errors={errors} />
                )}
                {currentStep === 7 && (
                  <StepProfilePreview data={data} categories={categories} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <div className="shrink-0 w-full z-30 bg-[var(--card)] border-t border-[var(--border)] shadow-xl">
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={WIZARD_STEPS.length}
            onPrev={() => {
              setCurrentStep(p => Math.max(1, p - 1));
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onNext={handleNext}
            onSaveDraft={saveDraftExplicit}
            isSubmitting={isSubmitting}
            isLastStep={currentStep === WIZARD_STEPS.length}
          />
        </div>
      </div>
    </div>
  );
}
