'use client';

import { useState, useMemo } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Search, MapPin, X, Filter } from 'lucide-react';

const TALENT_TYPES = [
  { id: 'All', label: 'All Talent' },
  { id: 'INFLUENCER', label: 'Influencer' },
  { id: 'MODEL', label: 'Model' },
  { id: 'ACTOR', label: 'Actor' },
  { id: 'COMEDIAN', label: 'Comedian' },
  { id: 'REELS_ARTIST', label: 'Reels Artist' },
  { id: 'VOICE_ARTIST', label: 'Voice Artist' },
  { id: 'DANCER', label: 'Dancer' },
  { id: 'PHOTOGRAPHER', label: 'Photographer' },
  { id: 'MUSICIAN', label: 'Musician' },
];

const DEFAULT_INDIAN_CITIES = [
  'Mumbai',
  'Delhi NCR',
  'Delhi',
  'Bengaluru',
  'Bangalore',
  'Kochi',
  'Jaipur',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Ahmedabad',
  'Kolkata',
  'Surat',
  'Lucknow',
  'Indore',
  'Bhopal',
  'Chandigarh',
  'Goa',
  'Noida',
  'Gurgaon',
];

export default function TalentDirectoryClient({ initialTalents }: { initialTalents: any[] }) {
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(16);

  // Dynamically extract unique cities from loaded talent profiles + default major cities
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    DEFAULT_INDIAN_CITIES.forEach((c) => set.add(c));
    if (Array.isArray(initialTalents)) {
      initialTalents.forEach((t) => {
        const city = t.city || t.user?.city;
        if (city && typeof city === 'string' && city.trim()) {
          set.add(city.trim());
        }
      });
    }
    return Array.from(set).sort();
  }, [initialTalents]);

  // Helper to extract category terms for a talent profile
  const getTalentCategories = (t: any): string[] => {
    const terms: string[] = [];
    if (t.stageName) terms.push(t.stageName);
    if (t.experienceLevel) terms.push(t.experienceLevel);
    if (t.bio) terms.push(t.bio);
    if (t.talentTypes && Array.isArray(t.talentTypes)) {
      terms.push(...t.talentTypes);
    }
    if (t.userTalents && Array.isArray(t.userTalents)) {
      t.userTalents.forEach((ut: any) => {
        if (ut.category?.name) terms.push(ut.category.name);
        if (ut.category?.slug) terms.push(ut.category.slug);
      });
    }
    return terms.map((s) => String(s).toLowerCase());
  };

  const filtered = useMemo(() => {
    if (!Array.isArray(initialTalents)) return [];

    return initialTalents.filter((t: any) => {
      // 1. Category Matching
      let typeMatch = true;
      if (typeFilter !== 'All') {
        const target = typeFilter.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');
        const cats = getTalentCategories(t);
        
        typeMatch = cats.some((cat) => {
          const normCat = cat.replace(/_/g, ' ').replace(/-/g, ' ');
          if (normCat.includes(target) || target.includes(normCat)) return true;
          
          // Fuzzy fallback for category terms
          if (target === 'influencer' && (normCat.includes('creator') || normCat.includes('digital') || normCat.includes('social'))) return true;
          if (target === 'comedian' && (normCat.includes('comedy') || normCat.includes('standup') || normCat.includes('humor') || normCat.includes('actor') || normCat.includes('creator'))) return true;
          if (target === 'reels artist' && (normCat.includes('reel') || normCat.includes('short') || normCat.includes('creator') || normCat.includes('influencer'))) return true;
          if (target === 'voice artist' && (normCat.includes('voice') || normCat.includes('dubbing') || normCat.includes('audio') || normCat.includes('actor'))) return true;
          if (target === 'musician' && (normCat.includes('music') || normCat.includes('singer') || normCat.includes('vocalist'))) return true;
          if (target === 'photographer' && (normCat.includes('photo') || normCat.includes('camera') || normCat.includes('crew'))) return true;
          return false;
        });

        // Fallback: If total active profiles exist and category filter has fewer results, match all talents that have any primary type or bio matching
        if (!typeMatch && t.bio) {
          typeMatch = t.bio.toLowerCase().includes(target);
        }
      }

      // 2. City Matching (Direct type & select)
      let cityMatch = true;
      if (cityFilter.trim() !== '') {
        const talentCity = (t.city || t.user?.city || '').toLowerCase();
        const searchCity = cityFilter.trim().toLowerCase();
        cityMatch = talentCity.includes(searchCity) || searchCity.includes(talentCity);
      }

      // 3. Name & Keyword Search
      let searchMatch = true;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        const name = t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim().toLowerCase() : '';
        const stageName = (t.stageName || '').toLowerCase();
        const city = (t.city || t.user?.city || '').toLowerCase();
        const bio = (t.bio || '').toLowerCase();
        
        searchMatch =
          name.includes(query) ||
          stageName.includes(query) ||
          city.includes(query) ||
          bio.includes(query);
      }

      return typeMatch && cityMatch && searchMatch;
    });
  }, [initialTalents, typeFilter, cityFilter, searchQuery]);

  return (
    <Container>
      {/* Search Bar & City Input Controls */}
      <Reveal direction="up">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-8 gap-4">
          
          {/* Main Keyword Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search talent by name, skill, or bio..."
              className="w-full bg-surface/90 border border-border text-foreground pl-11 pr-10 py-3.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70 text-sm shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Searchable City Input Field + Autocomplete Datalist */}
          <div className="w-full md:w-80 relative">
            <div className="relative">
              <input
                type="text"
                list="city-suggestions"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="Type or select city..."
                className="w-full bg-surface/90 border border-border text-foreground pl-11 pr-10 py-3.5 rounded-lg focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/70 text-sm shadow-sm"
              />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              {cityFilter && (
                <button
                  onClick={() => setCityFilter('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  title="Clear City Filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Datalist for instant city suggestions */}
            <datalist id="city-suggestions">
              {availableCities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>

        </div>
      </Reveal>

      {/* Category Filter Pills & Quick City Dropdown */}
      <Reveal direction="up" delay={0.1}>
        <Card padding="md" className="flex flex-col lg:flex-row gap-4 mb-8 bg-surface/90 border-border shadow-sm">
          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap flex-grow items-center">
            {TALENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setTypeFilter(type.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200 border ${
                  typeFilter === type.id
                    ? 'bg-primary text-white border-primary shadow-sm drop-shadow-[0_0_8px_rgba(235,61,38,0.3)]'
                    : 'border-border/80 text-foreground/80 hover:text-white hover:border-primary/60 bg-background/50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Quick City Select Fallback */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-background border border-border text-foreground px-3.5 py-1.5 text-xs font-semibold rounded-md focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="">All Cities ({availableCities.length} Cities)</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </Reveal>

      {/* Active Filter Badges */}
      {(typeFilter !== 'All' || cityFilter || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          <span className="text-muted-foreground font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Active Filters:
          </span>
          {typeFilter !== 'All' && (
            <span className="px-2.5 py-1 bg-primary/15 text-primary border border-primary/30 rounded-full font-bold flex items-center gap-1">
              Category: {TALENT_TYPES.find((t) => t.id === typeFilter)?.label}
              <button onClick={() => setTypeFilter('All')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {cityFilter && (
            <span className="px-2.5 py-1 bg-primary/15 text-primary border border-primary/30 rounded-full font-bold flex items-center gap-1">
              City: {cityFilter}
              <button onClick={() => setCityFilter('')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-1 bg-primary/15 text-primary border border-primary/30 rounded-full font-bold flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setTypeFilter('All');
              setCityFilter('');
              setSearchQuery('');
            }}
            className="text-xs text-muted-foreground hover:text-white underline font-semibold ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results Count */}
      <p className="text-sm font-semibold text-foreground/80 mb-6">
        {filtered.length} talent profiles found
      </p>

      {/* Talent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.slice(0, displayCount).map((talent: any, idx: number) => {
          const name =
            talent.stageName ||
            (talent.user
              ? `${talent.user.firstName || ''} ${talent.user.lastName || ''}`.trim()
              : '') ||
            'Talent Artist';

          const primaryType =
            talent.userTalents?.[0]?.category?.name ||
            talent.talentTypes?.[0] ||
            talent.experienceLevel ||
            'CREATOR';

          const talentCity = talent.city || talent.user?.city || 'India';
          const imageUrl =
            talent.user?.avatarUrl ||
            talent.coverBannerUrl ||
            '/assets/project-fashion.jpg';

          return (
            <Reveal key={talent.id} direction="up" delay={(idx % 4) * 0.05}>
              <Link href={`/talent/${talent.id}`} className="block w-full h-full">
                <Card padding="none" hover className="group cursor-pointer overflow-hidden border border-border bg-surface/90 shadow-md">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Status Badge */}
                    <div
                      className={`absolute top-3 right-3 z-20 px-2 py-1 rounded-sm text-[10px] uppercase tracking-wider font-semibold ${
                        talent.status === 'ACTIVE'
                          ? 'bg-green-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {talent.status === 'ACTIVE' ? 'Available' : 'Verified'}
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                      <h3 className="text-lg font-serif text-white mb-1 drop-shadow">{name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-primary text-xs font-bold uppercase tracking-wider">
                          {String(primaryType).replace(/_/g, ' ')}
                        </span>
                        <span className="text-white/80 text-xs font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" /> {talentCity}
                        </span>
                      </div>
                    </div>

                    {/* Hover CTA */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="px-5 py-2 bg-primary text-white text-xs uppercase tracking-widest font-bold rounded shadow-lg">
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
        <div className="py-20 text-center bg-surface/50 border border-border rounded-xl my-6">
          <p className="text-muted-foreground font-medium mb-4">No talent found matching your criteria.</p>
          <Button
            variant="outline"
            onClick={() => {
              setTypeFilter('All');
              setCityFilter('');
              setSearchQuery('');
            }}
          >
            Clear Filters & View All
          </Button>
        </div>
      )}

      {/* Load More */}
      {filtered.length > 0 && (
        <div className="mt-14 text-center">
          {displayCount < filtered.length ? (
            <Button variant="outline" size="lg" onClick={() => setDisplayCount((prev) => prev + 16)}>
              Load More Profiles ({filtered.length - displayCount} Remaining)
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              All {filtered.length} Profiles Displayed
            </span>
          )}
        </div>
      )}
    </Container>
  );
}
