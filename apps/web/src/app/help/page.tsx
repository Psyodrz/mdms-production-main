import { Navbar } from '@/components/ui/Navbar';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';

export const metadata = { title: 'Help Center — MP Production' };

export default function HelpCenter() {
  return (
    <>
      <Navbar />
      <main className="page-content py-16">
        <Container size="md">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Help Center</h1>
          <p className="text-sm text-muted-foreground mb-10">Answers, guides, and how to reach us.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <Link href="/faq" className="rounded-2xl border border-border bg-surface p-6 hover:border-primary transition-colors">
              <h2 className="text-foreground font-serif text-xl mb-2">FAQs</h2>
              <p className="text-sm text-muted-foreground">Common questions about bookings, revisions, and talent.</p>
            </Link>
            <Link href="/contact" className="rounded-2xl border border-border bg-surface p-6 hover:border-primary transition-colors">
              <h2 className="text-foreground font-serif text-xl mb-2">Contact Us</h2>
              <p className="text-sm text-muted-foreground">Reach our team for project or support enquiries.</p>
            </Link>
            <Link href="/join/talent" className="rounded-2xl border border-border bg-surface p-6 hover:border-primary transition-colors">
              <h2 className="text-foreground font-serif text-xl mb-2">Join as Talent</h2>
              <p className="text-sm text-muted-foreground">Register your profile and get discovered by brands.</p>
            </Link>
            <Link href="/services" className="rounded-2xl border border-border bg-surface p-6 hover:border-primary transition-colors">
              <h2 className="text-foreground font-serif text-xl mb-2">Our Services</h2>
              <p className="text-sm text-muted-foreground">Explore production, post, casting, and campaigns.</p>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-10">Still stuck? Email <a href="mailto:hello@mpproduction.com" className="text-primary">hello@mpproduction.com</a>.</p>
        </Container>
      </main>
    </>
  );
}
