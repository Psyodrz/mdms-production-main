import { Navbar } from '@/components/ui/Navbar';
import { Container } from '@/components/ui/Container';

export const metadata = { title: 'Privacy Policy — MP Production' };

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main className="page-content py-16">
        <Container size="md">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {new Date().getFullYear()}</p>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground font-light leading-relaxed">
            <p>MP Production ("we", "us") respects your privacy. This policy explains what we collect, why, and how we protect it.</p>
            <h2 className="text-foreground font-serif text-2xl">Information We Collect</h2>
            <p>We collect information you provide directly — such as your name, email, phone number, and any details submitted through our contact, booking, or talent registration forms.</p>
            <h2 className="text-foreground font-serif text-2xl">How We Use It</h2>
            <p>We use your information to respond to inquiries, process bookings, manage talent profiles, and improve our services. We never sell your personal data.</p>
            <h2 className="text-foreground font-serif text-2xl">Data Security</h2>
            <p>Your data is stored securely and access is restricted to authorized personnel. We use industry-standard safeguards to protect it.</p>
            <h2 className="text-foreground font-serif text-2xl">Contact</h2>
            <p>For any privacy questions, reach us at <a href="mailto:hello@mpproduction.com" className="text-primary">hello@mpproduction.com</a>.</p>
          </div>
        </Container>
      </main>
    </>
  );
}
