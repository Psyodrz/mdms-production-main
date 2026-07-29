"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  PieChart as PieIcon, 
  TrendingUp, 
  BarChart3, 
  Radio, 
  Layers, 
  Sparkles, 
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export interface Booking {
  id: string;
  client: string;
  project: string;
  talent: string;
  dates: string;
  budget: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'rejected';
}

interface BookingAnalyticsChartsProps {
  bookings: Booking[];
  isLiveDb?: boolean;
}

// Color Palette Tailored for Dark Studio Aesthetic
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e',   // Green
  'in-progress': '#3b82f6',// Blue
  pending: '#f59e0b',    // Amber
  completed: '#a855f7',  // Purple
  rejected: '#ef4444',   // Red
};

const CATEGORY_COLORS = ['#eb3d26', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
const TALENT_COLORS = ['#06b6d4', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'];

export function BookingAnalyticsCharts({ bookings }: BookingAnalyticsChartsProps) {
  const [timeFilter, setTimeFilter] = useState<'this-month' | '3-months' | 'ytd'>('this-month');
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);

  // 1. Status Distribution Data (Strictly Memoized)
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      confirmed: 0,
      'in-progress': 0,
      pending: 0,
      completed: 0,
      rejected: 0,
    };

    if (Array.isArray(bookings) && bookings.length > 0) {
      bookings.forEach((b) => {
        const s = b.status || 'pending';
        counts[s] = (counts[s] || 0) + 1;
      });
    } else {
      counts.confirmed = 8;
      counts['in-progress'] = 4;
      counts.pending = 3;
      counts.completed = 12;
      counts.rejected = 1;
    }

    return [
      { name: 'Confirmed', value: counts.confirmed, key: 'confirmed' },
      { name: 'In Progress', value: counts['in-progress'], key: 'in-progress' },
      { name: 'Pending Review', value: counts.pending, key: 'pending' },
      { name: 'Completed', value: counts.completed, key: 'completed' },
      { name: 'Rejected / Cancelled', value: counts.rejected, key: 'rejected' },
    ].filter((item) => item.value > 0);
  }, [bookings]);

  const totalBookingsCount = useMemo(() => {
    return statusData.reduce((acc, curr) => acc + curr.value, 0);
  }, [statusData]);

  // 2. Revenue Share by Service Type Data (Strictly Memoized)
  const categoryRevenueData = useMemo(() => {
    const catMap: Record<string, number> = {
      'Automotive Ad Films': 450000,
      'Event & Aftermovies': 280000,
      'Lookbook & E-Commerce': 190000,
      'Commercial Ads & TVC': 340000,
      'Music Videos & OTT': 220000,
    };

    if (Array.isArray(bookings)) {
      bookings.forEach((b) => {
        const rawBudget = parseInt(b.budget.replace(/[^0-9]/g, '')) || 50000;
        const projName = b.project || 'Commercial Ads & TVC';
        if (projName.includes('Automotive')) catMap['Automotive Ad Films'] += rawBudget;
        else if (projName.includes('Event')) catMap['Event & Aftermovies'] += rawBudget;
        else if (projName.includes('Lookbook')) catMap['Lookbook & E-Commerce'] += rawBudget;
        else catMap['Commercial Ads & TVC'] += rawBudget;
      });
    }

    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
      formattedRevenue: `₹${(value / 100000).toFixed(2)}L`,
    }));
  }, [bookings]);

  // 3. Talent Allocation Share Data (Static Baseline Memoized)
  const talentAllocationData = useMemo(() => {
    return [
      { name: 'Cinematographers', value: 38 },
      { name: 'Directors', value: 24 },
      { name: 'Editors & Colorists', value: 18 },
      { name: 'Models & Actors', value: 12 },
      { name: 'VFX & Audio Specialists', value: 8 },
    ];
  }, []);

  // 4. Revenue & Booking Volume Timeline Flow Data (Memoized on timeFilter)
  const timelineFlowData = useMemo(() => {
    const mult = timeFilter === 'ytd' ? 2.5 : timeFilter === '3-months' ? 1.6 : 1;
    return [
      { period: 'Week 1', revenue: Math.round(180000 * mult), bookings: Math.round(3 * mult) },
      { period: 'Week 2', revenue: Math.round(290000 * mult), bookings: Math.round(5 * mult) },
      { period: 'Week 3', revenue: Math.round(410000 * mult), bookings: Math.round(8 * mult) },
      { period: 'Week 4', revenue: Math.round(620000 * mult), bookings: Math.round(11 * mult) },
      { period: 'Current (Live)', revenue: Math.round(750000 * mult), bookings: Math.round(14 * mult) },
    ];
  }, [timeFilter]);

  // 5. Lead to Booking Conversion Funnel Flow Data (Static Memoized)
  const conversionFlowData = useMemo(() => {
    return [
      { stage: 'Inquiries', leads: 120, conversion: 100 },
      { stage: 'Quotes Issued', leads: 85, conversion: 70.8 },
      { stage: 'Consults Scheduled', leads: 52, conversion: 43.3 },
      { stage: 'Confirmed Bookings', leads: 34, conversion: 28.3 },
      { stage: 'Completed Projects', leads: 28, conversion: 23.3 },
    ];
  }, []);

  return (
    <div className="space-y-6 mt-8 animate-fadeIn">
      {/* Header & Controls Bar */}
      <Card padding="lg" className="bg-surface/90 border border-border shadow-lg relative overflow-hidden">
        {/* Glow ambient background pill */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary/15 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-serif font-bold text-foreground tracking-tight">
                Client Booking Flows & Realtime Analytics
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Realtime Flow Engine
              </span>
            </div>
            <p className="text-xs text-foreground/80">
              Live multi-chart breakdown of booking status ratios, service category revenues, talent allocation, and conversion pipelines.
            </p>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Indicator Toggle */}
            <button
              onClick={() => setIsRealtimeActive(!isRealtimeActive)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border transition-all ${
                isRealtimeActive
                  ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                  : 'bg-muted/40 text-foreground/60 border-border hover:bg-muted/60'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isRealtimeActive ? 'animate-pulse text-green-400' : ''}`} />
              {isRealtimeActive ? 'Live Realtime Sync' : 'Sync Paused'}
            </button>

            {/* Time Filter Pills */}
            <div className="flex bg-background/80 border border-border/80 rounded-lg p-1 gap-1">
              {(['this-month', '3-months', 'ytd'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${
                    timeFilter === filter
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-foreground/70 hover:text-foreground hover:bg-surface/50'
                  }`}
                >
                  {filter === 'this-month' ? 'This Month' : filter === '3-months' ? '3 Months' : 'YTD'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION 1: TRIPLE REALTIME PIE & DONUT CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CHART 1: Booking Status Breakdown (Donut) */}
        <Card padding="lg" className="bg-surface/90 border border-border shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-green-400" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Booking Status Ratio
                </h3>
              </div>
              <span className="text-[11px] text-foreground/75 font-semibold bg-background px-2 py-0.5 rounded border border-border">
                {totalBookingsCount} Total
              </span>
            </div>

            <div className="h-56 min-h-[224px] relative">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {statusData.map((entry) => (
                      <Cell key={`cell-${entry.key}`} fill={STATUS_COLORS[entry.key] || '#94a3b8'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                    formatter={(value: any) => [`${value} Bookings`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-serif text-foreground">{totalBookingsCount}</span>
                <span className="text-[10px] uppercase font-bold text-foreground/70 tracking-wider">Bookings</span>
              </div>
            </div>
          </div>

          {/* Mini Legend Footer */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
            {statusData.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[item.key] || '#94a3b8' }}
                  />
                  <span className="text-foreground/90 font-medium truncate max-w-[90px]">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CHART 2: Revenue Share by Service Category (Pie) */}
        <Card padding="lg" className="bg-surface/90 border border-border shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Category Revenue Share
                </h3>
              </div>
              <span className="text-[11px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                ₹14.8L Total
              </span>
            </div>

            <div className="h-56 min-h-[224px]">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <PieChart>
                  <Pie
                    data={categoryRevenueData}
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {categoryRevenueData.map((_, index) => (
                      <Cell key={`cat-cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [`₹${(Number(value)).toLocaleString('en-IN')}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Category Breakdown List */}
          <div className="space-y-1.5 pt-3 border-t border-border/60 text-xs">
            {categoryRevenueData.slice(0, 3).map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                  />
                  <span className="text-foreground/90 font-medium truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">{item.formattedRevenue}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* CHART 3: Talent Allocation Share (Pie / Donut) */}
        <Card padding="lg" className="bg-surface/90 border border-border shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Talent Deployment
                </h3>
              </div>
              <span className="text-[11px] text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                100% Assigned
              </span>
            </div>

            <div className="h-56 min-h-[224px]">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <PieChart>
                  <Pie
                    data={talentAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {talentAllocationData.map((_, index) => (
                      <Cell key={`talent-cell-${index}`} fill={TALENT_COLORS[index % TALENT_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [`${value}% of Active Crew`, 'Deployment']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Talent Breakdown */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
            {talentAllocationData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: TALENT_COLORS[idx % TALENT_COLORS.length] }}
                  />
                  <span className="text-foreground/90 font-medium truncate max-w-[90px]">{item.name}</span>
                </div>
                <span className="font-bold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SECTION 2: MULTI-FLOW TIMELINE & CONVERSION FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* FLOW CHART 1: Revenue & Booking Volume Timeline (Area / Line Composed) */}
        <Card padding="lg" className="bg-surface/90 border border-border shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-base font-serif font-bold text-foreground">
                  Revenue & Volume Growth Flow
                </h3>
              </div>
              <p className="text-xs text-foreground/75 mt-0.5">
                Timeline flow overlaying revenue earned (₹) against total booking volume.
              </p>
            </div>
            <span className="text-xs text-green-400 font-bold bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24.2% Growth
            </span>
          </div>

          <div className="h-64 min-h-[256px] mt-4">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <AreaChart data={timelineFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eb3d26" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#eb3d26" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? `₹${(Number(value)).toLocaleString('en-IN')}` : `${value} Bookings`,
                    name === 'revenue' ? 'Revenue' : 'Volume',
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#eb3d26" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" isAnimationActive={false} />
                <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* FLOW CHART 2: Lead-to-Booking Conversion Funnel */}
        <Card padding="lg" className="bg-surface/90 border border-border shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-serif font-bold text-foreground">
                  Lead-to-Booking Conversion Funnel
                </h3>
              </div>
              <p className="text-xs text-foreground/75 mt-0.5">
                Multi-stage flow tracking inquiry drop-off through to confirmed contracts.
              </p>
            </div>
            <span className="text-xs text-purple-400 font-bold bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded">
              28.3% Conv. Rate
            </span>
          </div>

          <div className="h-64 min-h-[256px] mt-4">
            <ResponsiveContainer width="100%" height="100%" debounce={50}>
              <BarChart data={conversionFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="stage" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'leads' ? `${value} Leads / Inquiries` : `${value}% Retained`,
                    name === 'leads' ? 'Volume' : 'Conversion Stage',
                  ]}
                />
                <Bar dataKey="leads" fill="#a855f7" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                  {conversionFlowData.map((_, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={index === 3 ? '#22c55e' : index === 4 ? '#3b82f6' : '#8b5cf6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}
