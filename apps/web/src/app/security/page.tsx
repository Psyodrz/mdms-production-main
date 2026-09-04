import { Navbar } from '@/components/ui/Navbar';
import { Container } from '@/components/ui/Container';

export const metadata = { title: 'Security & Compliance — MP Production' };

export default function SecurityCompliance() {
  return (
    <>
      <Navbar />
      <main className="page-content py-16">
        <Container size="md">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Security & Compliance</h1>
          <p className="text-sm text-muted-foreground mb-10">How we protect your data and our platform.</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground font-light leading-relaxed">
            <h2 className="text-foreground font-serif text-2xl">Authentication & Access</h2>
            <p>Access to admin systems is role-based (RBAC) with least-privilege permissions. Sensitive operations are restricted to authorized administrators.</p>
            <h2 className="text-foreground font-serif text-2xl">Data Protection</h2>
            <p>Data is stored in a managed PostgreSQL database with encrypted connections. Passwords are hashed and never stored in plain text.</p>
            <h2 className="text-foreground font-serif text-2xl">Auditing</h2>
            <p>Administrative actions are recorded in an audit log for accountability and traceability.</p>
            <h2 className="text-foreground font-serif text-2xl">Reporting an Issue</h2>
            <p>Found a vulnerability or security concern? Please report it responsibly to our security cell at <a href="mailto:yogsathi@gmail.com" className="text-primary font-mono">yogsathi@gmail.com</a> or reach out via Phone/WhatsApp at <a href="tel:+918310531309" className="text-primary font-mono">+91 83105 31309</a>.</p>
          </div>
        </Container>
      </main>
    </>
  );
}
