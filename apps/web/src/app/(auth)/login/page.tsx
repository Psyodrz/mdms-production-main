import React from 'react';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 py-12 relative overflow-hidden">
      {/* Decorative background glow for studio depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      
      <div className="w-full relative z-10">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
