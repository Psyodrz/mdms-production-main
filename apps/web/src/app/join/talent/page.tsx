import React from 'react';
import { SimpleTalentRegistrationForm } from '@/components/talent-registration/SimpleTalentRegistrationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join MP Productions - Premium Talent Network',
  description: 'Create your premium talent portfolio and get discovered by top brands.',
};

export default function TalentJoinPage() {
  return <SimpleTalentRegistrationForm />;
}
