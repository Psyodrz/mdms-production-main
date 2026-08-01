import { test } from '@playwright/test';

/**
 * Worker-safe unique test data. Every generated value is namespaced with the
 * parallel worker index + a timestamp + random suffix so concurrent workers
 * never collide on slugs / titles / emails.
 */
function uniqueSuffix(): string {
  const worker = test.info().parallelIndex ?? 0;
  const rand = Math.random().toString(36).slice(2, 7);
  return `${worker}-${Date.now().toString(36)}-${rand}`;
}

export function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const testData = {
  suffix: () => uniqueSuffix(),

  portfolioItem() {
    const s = uniqueSuffix();
    const title = `E2E Portfolio ${s}`;
    return {
      title,
      slug: slugify(title),
      category: 'Brand Campaign',
      description: `Automated E2E portfolio item ${s}`,
      mediaUrl: 'https://example.com/e2e-media.mp4',
    };
  },

  blogPost() {
    const s = uniqueSuffix();
    const title = `E2E Blog ${s}`;
    return {
      title,
      slug: slugify(title),
      content: `<p>Automated E2E blog content ${s}</p>`,
      excerpt: `E2E excerpt ${s}`,
      category: 'Technology',
    };
  },

  teamMember() {
    const s = uniqueSuffix();
    return { name: `E2E Member ${s}`, role: 'Producer', bio: `E2E bio ${s}` };
  },

  testimonial() {
    const s = uniqueSuffix();
    return { clientName: `E2E Client ${s}`, content: `Great work ${s}`, rating: 5 };
  },

  contactSubmission() {
    const s = uniqueSuffix();
    return {
      name: `E2E Contact ${s}`,
      email: `e2e-${s}@example.com`,
      phone: '+91 90000 00000',
      subject: 'E2E Enquiry',
      message: `Automated contact message ${s}`,
    };
  },

  hireRequest() {
    const s = uniqueSuffix();
    return {
      requesterName: `E2E Booker ${s}`,
      requesterEmail: `e2e-book-${s}@example.com`,
      requesterPhone: '+91 90000 11111',
      projectType: 'Commercial',
      city: 'Mumbai',
      briefDescription: `E2E booking brief ${s}`,
    };
  },
};
