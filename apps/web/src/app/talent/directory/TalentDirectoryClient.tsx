'use client';

import { useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

const talentTypes = ['All', 'INFLUENCER', 'MODEL', 'ACTOR', 'COMEDIAN', 'REELS_ARTIST', 'VOICE_ARTIST', 'DANCER', 'PHOTOGRAPHER'];
const cities = ['All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Ahmedabad'];

export default function TalentDirectoryClient({ initialTalents }: { initialTalents: any[] }) {
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(12);

  const filtered = initialTalents.filter((t: any) => {
    const typeMatch = typeFilter === 'All' || (t.talentTypes && t.talentTypes.includes(typeFilter));
    const cityMatch = cityFilter === 'All Cities' || (t.city && t.city.toLowerCase() === cityFilter.toLowerCase());
    
    const name = t.user ? `${t.user.firstName} ${t.user.lastName}` : '';
    const searchMatch = !searchQuery || 
      name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.city && t.city.toLowerCase().includes(searchQuery.toLowerCase()));
      
    return typeMatch && cityMatch && searchMatch;
  });

  return (
    <Container>
      {/* Header */}
      <Reveal direction="up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
          <div className="flex-grow">
            {/* Kept layout spacing */}
          </div>
          
          {/* Search */}
          <div className="w-full md:w-96">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or city..."
                className="w-full bg-surface border border-border text-foreground px-6 py-4 rounded-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth={2}/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35"/>
              </svg>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal direction="up" delay={0.1}>
        <Card padding="md" className="flex flex-col md:flex-row gap-4 mb-10 bg-surface border-border">
          {/* Type Filter */}
          <div className="flex gap-2 flex-wrap flex-grow">
            {talentTypes.map(type => (
              <button 
                key={type} 
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2 text-xs tracking-wide rounded-sm transition-all duration-300 border ${
                  typeFilter === type
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted-foreground hover:border-primary'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          {/* City Filter */}
          <select 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="bg-background border border-border text-foreground px-4 py-2 text-sm rounded-sm focus:outline-none focus:border-primary transition-colors"
          >
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </Card>
      </Reveal>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground/70 mb-6">{filtered.length} talent profiles found</p>

      {/* Talent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filtered.slice(0, displayCount).map((talent: any, idx: number) => {
          const name = talent.user ? `${talent.user.firstName} ${talent.user.lastName}` : 'Unknown Talent';
          const primaryType = talent.talentTypes && talent.talentTypes.length > 0 ? talent.talentTypes[0].replace('_', ' ') : 'CREATOR';
          const imageUrl = talent.user?.avatarUrl || talent.coverBannerUrl || "/assets/project-fashion.jpg";
          
          return (
            <Reveal key={talent.id} direction="up" delay={(idx % 4) * 0.05}>
              <Link href={`/talent/${talent.id}`} className="block w-full h-full">
                <Card padding="none" hover className="group cursor-pointer overflow-hidden border border-border">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
                    <img src={imageUrl} alt={name || 'Talent profile'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    
                    {/* Availability Badge */}
                    <div className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider font-semibold ${
                      talent.availableForWork ? 'bg-[var(--success)] text-white' : 'bg-[var(--overlay)] text-muted-foreground'
                    }`}>
                      {talent.availableForWork ? 'Available' : 'Busy'}
                    </div>
                    
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                      <h3 className="text-lg font-serif text-white mb-1">{name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-accent text-xs font-semibold uppercase tracking-wider">{primaryType}</span>
                        <span className="text-white/60 text-xs">{talent.city || 'Anywhere'}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                        <span>{talent.socialFollowers ? (talent.socialFollowers / 1000).toFixed(1) + 'k' : 'N/A'} followers</span>
                      </div>
                    </div>

                    {/* Hire CTA on Hover */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="px-6 py-2 bg-accent text-white text-xs uppercase tracking-widest font-semibold rounded-sm shadow-lg">
                        View Profile
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </Reveal>
          );
        })}
      </div>
      
      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-muted-foreground mb-4">No talent found matching your criteria.</p>
          <Button variant="outline" onClick={() => { setTypeFilter('All'); setCityFilter('All Cities'); setSearchQuery(''); }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {filtered.length > 0 && (
        <div className="mt-16 text-center">
          {displayCount < filtered.length ? (
            <Button variant="outline" size="lg" onClick={() => setDisplayCount(prev => prev + 12)}>
              Load More Profiles
            </Button>
          ) : (
            <Button variant="outline" size="lg" disabled>
              All Profiles Loaded
            </Button>
          )}
        </div>
      )}
    </Container>
  );
}
