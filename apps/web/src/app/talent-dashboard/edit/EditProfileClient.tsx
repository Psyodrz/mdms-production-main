'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fetchAPI } from '@/lib/api-client';
import { uploadToSupabase } from '@/lib/upload';
import { toast } from 'sonner';

export default function EditProfileClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    bio: initialData?.bio || '',
    city: initialData?.city || '',
    availability: initialData?.availability || 'FLEXIBLE',
    instagramFollowers: initialData?.instagramFollowers || 0,
    instagramHandle: initialData?.instagramHandle || '',
    youtubeHandle: initialData?.youtubeHandle || '',
    tiktokHandle: initialData?.tiktokHandle || '',
    linkedinHandle: initialData?.linkedinHandle || '',
  });
  
  const [portfolioPhotos, setPortfolioPhotos] = useState<string[]>(initialData?.portfolioPhotos || []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI('/talent/me', {
        method: 'PATCH',
        body: JSON.stringify({
          ...formData,
          instagramFollowers: Number(formData.instagramFollowers)
        })
      });
      router.refresh();
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const url = await uploadToSupabase({
        file,
        bucket: 'mp-public',
        folder: 'talent/avatars',
      });

      await fetchAPI('/talent/me/portfolio', {
        method: 'POST',
        body: JSON.stringify({ urls: [url] })
      });
      
      setPortfolioPhotos([...portfolioPhotos, url]);
      toast.success('Photo uploaded successfully!');
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (urlToRemove: string) => {
    try {
      await fetchAPI('/talent/me/portfolio/remove', {
        method: 'PATCH',
        body: JSON.stringify({ url: urlToRemove })
      });
      setPortfolioPhotos(portfolioPhotos.filter(u => u !== urlToRemove));
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card padding="lg" className="bg-surface border-border">
          <h2 className="text-xl font-serif text-foreground mb-6">Personal Details</h2>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
              <textarea 
                className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:ring-1 focus:ring-brand"
                rows={5}
                value={formData.bio}
                onChange={e => setFormData({...formData, bio: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <input 
                  type="text"
                  className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:ring-1 focus:ring-brand"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Availability</label>
                <select 
                  className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:ring-1 focus:ring-brand"
                  value={formData.availability}
                  onChange={e => setFormData({...formData, availability: e.target.value})}
                >
                  <option value="FLEXIBLE">Flexible</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
            </div>

            <h2 className="text-xl font-serif text-foreground mb-6 pt-6 border-t border-border mt-8">Social & Following</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Instagram Followers</label>
                <input 
                  type="number"
                  className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:ring-1 focus:ring-brand"
                  value={formData.instagramFollowers}
                  onChange={e => setFormData({...formData, instagramFollowers: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Instagram Handle</label>
                <input 
                  type="text"
                  placeholder="@"
                  className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:ring-1 focus:ring-brand"
                  value={formData.instagramHandle}
                  onChange={e => setFormData({...formData, instagramHandle: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">TikTok Handle</label>
                <input 
                  type="text"
                  placeholder="@"
                  className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:ring-1 focus:ring-brand"
                  value={formData.tiktokHandle}
                  onChange={e => setFormData({...formData, tiktokHandle: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">YouTube Handle</label>
                <input 
                  type="text"
                  placeholder="@"
                  className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:ring-1 focus:ring-brand"
                  value={formData.youtubeHandle}
                  onChange={e => setFormData({...formData, youtubeHandle: e.target.value})}
                />
              </div>
            </div>
            
            <div className="pt-6">
              <Button type="submit" disabled={loading} variant="primary" className="w-full md:w-auto">
                {loading ? 'Saving...' : 'Save Profile Details'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <Card padding="lg" className="bg-surface border-border">
          <h2 className="text-xl font-serif text-foreground mb-6">Portfolio Photos</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {portfolioPhotos.map((url, i) => (
                <div key={i} className="relative aspect-[3/4] bg-muted/20 rounded-md overflow-hidden group">
                  <img src={url} alt={`Portfolio ${i}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleRemovePhoto(url)}
                    className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 w-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="border-2 border-dashed border-border rounded-md p-6 text-center hover:bg-muted/10 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                {uploading ? (
                  <>
                    <span className="text-sm animate-pulse">Uploading…</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl mb-2">+</span>
                    <span className="text-sm">Upload Photo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
