import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-8xl font-serif text-primary mb-4">404</h1>
        <h2 className="text-3xl font-serif text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground font-light mb-10">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/" size="lg" variant="primary">
            Go Home
          </Button>
          <Button href="/contact" size="lg" variant="outline">
            Contact Us
          </Button>
        </div>
        <div className="mt-12 flex flex-wrap gap-4 justify-center text-sm">
          <Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link>
          <span className="text-[var(--border)]">·</span>
          <Link href="/portfolio" className="text-muted-foreground hover:text-primary transition-colors">Portfolio</Link>
          <span className="text-[var(--border)]">·</span>
          <Link href="/talent" className="text-muted-foreground hover:text-primary transition-colors">Talent</Link>
          <span className="text-[var(--border)]">·</span>
          <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
          <span className="text-[var(--border)]">·</span>
          <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link>
        </div>
      </div>
    </div>
  );
}
