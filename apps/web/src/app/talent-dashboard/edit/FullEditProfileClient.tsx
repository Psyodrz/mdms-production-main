'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import { StepProfessionalIdentity } from '@/components/talent-registration/StepProfessionalIdentity';
import { StepProfessionalDetails } from '@/components/talent-registration/StepProfessionalDetails';
import { StepPortfolioBuilder } from '@/components/talent-registration/StepPortfolioBuilder';
import { StepAboutMe } from '@/components/talent-registration/StepAboutMe';
import { StepSocialMedia } from '@/components/talent-registration/StepSocialMedia';

export default function FullEditProfileClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const primaryTalent = initialData?.userTalents?.find((t: any) => t.isPrimary);
  const secondaryTalents = initialData?.userTalents?.filter((t: any) => !t.isPrimary) || [];

  const [data, setData] = useState({
    // Step 2
    primaryTalentId: primaryTalent?.categoryId || '',
    secondaryTalentIds: secondaryTalents.map((t: any) => t.categoryId),
    experienceLevel: initialData?.experienceLevel || '',
    languages: initialData?.userLanguages?.map((l: any) => l.language?.name || l.languageId) || [],
    skills: initialData?.userSkills?.map((s: any) => s.skill?.name || s.skillId) || [],
    
    // Step 3
    attributes: primaryTalent?.attributes || {},
    
    // Step 4
    profilePhoto: null as File | null, profilePhotoPreview: initialData?.user?.profileImage || '',
    coverBanner: null as File | null, coverBannerPreview: initialData?.coverBannerUrl || '',
    galleryImages: [] as { id: string; url: string; file?: File }[],
    introductionVideo: null as File | null, introductionVideoPreview: initialData?.introductionVideoUrl || '',
    resume: null as File | null, resumeName: initialData?.resumeUrl ? initialData.resumeUrl.replace('documents/', '') : '',
    compCard: null as File | null, compCardName: initialData?.compCardUrl ? initialData.compCardUrl.replace('documents/', '') : '',
    
    // Step 5
    bio: initialData?.bio || '',
    achievements: Array.isArray(initialData?.achievements) ? initialData.achievements : [],
    education: Array.isArray(initialData?.education) ? initialData.education : [],
    brandsWorkedWith: initialData?.brandsWorkedWith || [],
    pricingType: initialData?.pricing?.perDay ? 'per-day' : (initialData?.pricing?.perHour ? 'per-hour' : ''),
    pricingAmount: initialData?.pricing?.perDay ? (initialData.pricing.perDay / 100).toString() : (initialData?.pricing?.perHour ? (initialData.pricing.perHour / 100).toString() : ''),
    isAvailableForTravel: initialData?.availability?.travelReady ?? true,
    isAvailableForRemote: initialData?.availability?.availablePartTime ?? true,
    isAvailableImmediate: initialData?.availability?.availableFullTime ?? true,
    stageName: initialData?.stageName || '',
    
    // Step 6
    instagram: initialData?.socialLinks?.find((s: any) => s.platform === 'INSTAGRAM')?.url || '',
    youtube: initialData?.socialLinks?.find((s: any) => s.platform === 'YOUTUBE')?.url || '',
    facebook: initialData?.socialLinks?.find((s: any) => s.platform === 'FACEBOOK')?.url || '',
    linkedin: initialData?.socialLinks?.find((s: any) => s.platform === 'LINKEDIN')?.url || '',
    imdb: initialData?.socialLinks?.find((s: any) => s.platform === 'IMDB')?.url || '',
    website: initialData?.socialLinks?.find((s: any) => s.platform === 'WEBSITE')?.url || '',
    portfolio: initialData?.socialLinks?.find((s: any) => s.platform === 'PORTFOLIO')?.url || '',
    behance: initialData?.socialLinks?.find((s: any) => s.platform === 'BEHANCE')?.url || '',
    pinterest: initialData?.socialLinks?.find((s: any) => s.platform === 'PINTEREST')?.url || '',
    spotify: initialData?.socialLinks?.find((s: any) => s.platform === 'SPOTIFY')?.url || '',
    tiktok: initialData?.socialLinks?.find((s: any) => s.platform === 'TIKTOK')?.url || '',
  });

  useEffect(() => {
    fetchAPI('/talent-category')
      .then((resData: any) => setCategories(resData.data || resData))
      .catch((err: any) => console.error('Failed to fetch categories:', err));
  }, []);

  const updateData = React.useCallback((newData: Partial<typeof data>) => {
    setData(prev => ({ ...prev, ...newData }));
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newData).forEach(key => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  const primaryCategory = categories.find(c => c.id === data.primaryTalentId);
  const dynamicFields = primaryCategory?.fields || [];

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // For updates, the backend expects PATCH to /talent/me
      await fetchAPI('/talent/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      
      toast.success('Profile updated successfully!');
      router.push('/talent-dashboard');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const identitySection = React.useMemo(() => (
    <StepProfessionalIdentity data={data} categories={categories} onChange={updateData} errors={errors} />
  ), [
    data.primaryTalentId, data.secondaryTalentIds, data.experienceLevel, data.languages, data.skills,
    categories, errors, updateData
  ]);

  const detailsSection = React.useMemo(() => (
    <StepProfessionalDetails 
      categoryName={primaryCategory?.name || 'Talent'}
      fields={dynamicFields} 
      data={data.attributes} 
      onChange={(attrs) => updateData({ attributes: attrs })} 
      errors={errors} 
    />
  ), [primaryCategory?.name, dynamicFields, data.attributes, errors, updateData]);

  const aboutMeSection = React.useMemo(() => (
    <StepAboutMe data={data} onChange={updateData} errors={errors} />
  ), [
    data.bio, data.achievements, data.education, data.brandsWorkedWith, data.pricingType, data.pricingAmount,
    data.isAvailableForTravel, data.isAvailableForRemote, data.isAvailableImmediate,
    errors, updateData
  ]);

  const portfolioSection = React.useMemo(() => (
    <StepPortfolioBuilder data={data} onChange={updateData} errors={errors} />
  ), [
    data.profilePhotoPreview, data.coverBannerPreview, data.galleryImages, data.introductionVideoPreview,
    data.resumeName, data.compCardName, errors, updateData
  ]);

  const socialSection = React.useMemo(() => (
    <StepSocialMedia data={data} onChange={updateData} errors={errors} />
  ), [
    data.instagram, data.youtube, data.facebook, data.linkedin, data.imdb, data.website,
    data.portfolio, data.behance, data.pinterest, data.spotify, data.tiktok, errors, updateData
  ]);

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-24">
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Professional Identity</h2>
        {identitySection}
      </section>

      {dynamicFields.length > 0 && (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Details for {primaryCategory?.name}</h2>
          {detailsSection}
        </section>
      )}

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">About Me</h2>
        {aboutMeSection}
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Portfolio & Media</h2>
        {portfolioSection}
      </section>

      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Social Media</h2>
        {socialSection}
      </section>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--card)] border-t border-[var(--border)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex justify-end gap-4 md:px-12 lg:px-24">
        <button 
          onClick={() => router.push('/talent-dashboard')}
          className="px-6 py-2.5 rounded-full border border-[var(--border)] font-medium hover:bg-[var(--surface)] transition-colors text-[var(--foreground)]"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-full bg-[var(--brand)] text-[var(--brand-foreground)] font-medium hover:brightness-110 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
