import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingForm } from './BookingForm';
import { serverFetchAPI } from '@/lib/server-api-client';

async function getTalentProfile(id: string) {
  try {
    const data = await serverFetchAPI(`/talent/${id}`, { cache: 'no-store' });
    if (!data) return null;
    return data.data ? data.data : data;
  } catch (error) {
    return null;
  }
}

export default async function BookTalentPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const profile = await getTalentProfile(id);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <div className="max-w-4xl mx-auto">
          
          <Reveal direction="up">
            <Link href={`/talent/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-12 uppercase tracking-widest font-semibold">
              &larr; Back to Profile
            </Link>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div className="mb-12">
              <span className="text-[var(--color-primary)] tracking-[0.2em] text-xs uppercase font-semibold mb-4 block">
                Booking Inquiry
              </span>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
                Book {profile.user.firstName} {profile.user.lastName}
              </h1>
              <p className="text-muted-foreground font-light">
                Submit your project details. Our team will review the inquiry and get back to you with availability and a quotation.
              </p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.2}>
            <div className="bg-[var(--color-surface)] p-8 md:p-12 border border-[var(--color-border)]">
              <BookingForm talentProfileId={id} />
            </div>
          </Reveal>

        </div>
      </main>
    </>
  );
}
