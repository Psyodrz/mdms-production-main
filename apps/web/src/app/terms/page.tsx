import { Navbar } from '@/components/ui/Navbar';
import { Container } from '@/components/ui/Container';

export const metadata = { title: 'Terms of Service — MP Production' };

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main className="page-content py-16">
        <Container size="md">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground font-light leading-relaxed">
            <p>By accessing MP Production's website and services, you agree to these terms.</p>
            <h2 className="text-foreground font-serif text-2xl">Use of Service</h2>
            <p>You agree to use our platform lawfully and not to misuse forms, bookings, or talent data. Accounts must contain accurate information.</p>
            <h2 className="text-foreground font-serif text-2xl">Bookings & Payments</h2>
            <p>Booking inquiries are subject to confirmation. Quotes, schedules, and deliverables are agreed in writing before production begins.</p>
            <h2 className="text-foreground font-serif text-2xl">Intellectual Property</h2>
            <p>All content on this site is owned by MP Production unless otherwise stated. Talent retain rights to their own submitted materials.</p>
            <h2 className="text-foreground font-serif text-2xl">Contact</h2>
            <p>Questions about these terms? Email <a href="mailto:hello@mpproduction.com" className="text-primary">hello@mpproduction.com</a>.</p>
          </div>
        </Container>
      </main>
    </>
  );
}
