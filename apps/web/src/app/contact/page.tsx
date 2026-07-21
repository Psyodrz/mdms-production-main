"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useState } from 'react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/api-client';
import Image from 'next/image';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: 'Production Services',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email || !formData.message) {
      toast.error('Please fill in required fields: First Name, Email, and Message.');
      return;
    }

    setSubmitting(true);
    try {
      const json = await fetchAPI('/cms/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          subject: formData.inquiryType,
          message: formData.message
        })
      });

      if (json?.success || json?.message) {
        toast.success(json?.message || 'Thank you! Your message has been sent successfully.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          inquiryType: 'Production Services',
          message: ''
        });
      } else {
        toast.error('Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      toast.error('Network error while sending message. Please check your connection or contact us via email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
        {/* Header Section — Full Bleed Merged With Navbar */}
        <section className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden mb-20 text-center pt-28 sm:pt-36">
          <Image 
            src="/images/contact-studio.jpg" 
            alt="Contact MP Production" 
            fill 
            className="object-cover object-center" 
            priority sizes="100vw" />
          
          {/* Top Vignette Gradient for Navbar Contrast */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-1 pointer-events-none" />
          <div className="absolute inset-0 dark:bg-black/60 bg-black/40 z-1" />
          <div className="absolute bottom-0 left-0 right-0 h-40 dark:bg-gradient-to-t dark:from-background bg-gradient-to-t from-background to-transparent z-2" />

          <Container className="relative z-10 w-full max-w-5xl mx-auto px-4">
            <Reveal direction="up">
              <span className="text-brand tracking-[0.2em] text-sm uppercase font-semibold mb-4 block drop-shadow-md">
                Get in Touch
              </span>
              <h1 className="text-6xl sm:text-8xl font-display text-white tracking-editorial leading-[0.92] mb-8 font-light whitespace-pre-line drop-shadow-lg">
                START A CONVERSATION.
              </h1>
              <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed mb-12 drop-shadow">
                Whether you're a brand seeking cinematic production, or an elite talent looking for representation, we'd love to hear from you.
              </p>
            </Reveal>
          </Container>
        </section>

        <Container className="flex flex-col md:flex-row gap-16">
          
          {/* Left: Studio image + Info */}
          <div className="w-full md:w-5/12">
            <Reveal direction="up">
              {/* Studio feature image */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border shadow-xl mb-10 group">
                <Image
                  src="/images/contact-studio.jpg"
                  alt="Inside the MP Production studio"
                  fill
                  className="object-cover scale-105 group-hover:scale-100 transition-transform duration-[1.5s] ease-out" sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="text-brand tracking-[0.2em] text-[11px] uppercase font-semibold mb-1 block">The Studio</span>
                  <p className="text-white font-serif text-2xl leading-tight">Where stories<br/>are crafted.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-foreground font-semibold uppercase tracking-wider text-sm mb-2">Global Headquarters</h3>
                  <p className="text-muted-foreground font-light">
                    123 Cinematic Blvd, Suite 400<br/>
                    Los Angeles, CA 90028<br/>
                    United States
                  </p>
                </div>
                <div>
                  <h3 className="text-foreground font-semibold uppercase tracking-wider text-sm mb-2">General Inquiries</h3>
                  <a href="mailto:hello@mpproductions.com" className="text-primary hover:underline">
                    hello@mpproductions.com
                  </a>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right: Form */}
          <div className="w-full md:w-7/12">
            <Reveal direction="up" delay={0.2}>
              <Card className="shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="firstName">First Name *</label>
                      <input 
                        type="text" 
                        id="firstName" 
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="input-premium" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="lastName">Last Name</label>
                      <input 
                        type="text" 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="input-premium" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="email">Email Address *</label>
                      <input 
                        type="email" 
                        id="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-premium" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="phone">Phone Number</label>
                      <input 
                        type="tel" 
                        id="phone" 
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-premium" 
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="inquiryType">Inquiry Type</label>
                    <select 
                      id="inquiryType" 
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="input-premium"
                    >
                      <option value="Production Services">Production Services</option>
                      <option value="Talent Representation">Talent Representation</option>
                      <option value="Press / Media">Press / Media</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2" htmlFor="message">Message *</label>
                    <textarea 
                      id="message" 
                      rows={5} 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="input-premium resize-none"
                    ></textarea>
                  </div>

                  <Button type="submit" disabled={submitting} size="lg" className="w-full justify-center">
                    {submitting ? "Sending Message..." : "Send Message"}
                  </Button>
                </form>
              </Card>
            </Reveal>
          </div>

        </Container>
      </main>
    </>
  );
}
