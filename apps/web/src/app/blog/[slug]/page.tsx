"use client";

import { Navbar } from '@/components/ui/Navbar';
import { Reveal } from '@/components/ui/Reveal';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';

export default function BlogPostPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  // Guard against "null"/"undefined"/empty strings arriving in the query so a
  // published post is never treated as a (failed) preview request.
  const rawPreview = searchParams?.get('preview');
  const previewToken = rawPreview && rawPreview !== 'null' && rawPreview !== 'undefined' ? rawPreview : null;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
    const fetchUrl = previewToken
      ? `${apiUrl}/cms/preview/blog/${slug}?token=${previewToken}`
      : `${apiUrl}/cms/blog/${slug}`;

    fetch(fetchUrl)
      .then(r => r.json())
      .then(res => {
        if (res && res.success && res.data) {
          setPost(res.data);
        }
      })
      .catch(() => {
        toast.error('Failed to load blog post.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, previewToken]);

  if (!loading && !post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="page-content py-12">
        <Container size="md">
          <div className="mb-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Journal</span>
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-8">
              <div className="h-6 bg-muted/40 rounded w-32" />
              <div className="h-16 bg-muted/40 rounded w-full" />
              <div className="h-[400px] bg-muted/40 rounded-2xl w-full" />
              <div className="space-y-4 pt-8">
                <div className="h-4 bg-muted/40 rounded w-full" />
                <div className="h-4 bg-muted/40 rounded w-full" />
                <div className="h-4 bg-muted/40 rounded w-3/4" />
              </div>
            </div>
          ) : (
            <Reveal direction="up">
              <article className="space-y-8">
                <div>
                  <span className="text-accent uppercase tracking-widest text-xs font-semibold mb-4 block">
                    {post.category || "Production"}
                  </span>
                  <h1 className="text-4xl md:text-6xl font-serif text-foreground mb-6 leading-tight">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4 my-8">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>{post.author || "Admin"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{post.date || new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.readTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{post.readTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {(post.img || post.coverImage || post.coverImageUrl) && (
                  <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-xl">
                    <img src={post.img || post.coverImage || post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="prose prose-invert max-w-none pt-6 space-y-6 text-muted-foreground font-light leading-relaxed">
                  {post.content ? (
                    <div 
                      className="text-base md:text-lg space-y-6"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  ) : (
                    <p className="text-lg">{post.excerpt || "Article content loading..."}</p>
                  )}
                </div>

                <div className="border-t border-border pt-12 mt-16 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="text-foreground font-serif text-xl mb-1">Enjoyed this article?</h4>
                    <p className="text-sm text-muted-foreground font-light">Share it with your production network or team.</p>
                  </div>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Article
                  </Button>
                </div>
              </article>
            </Reveal>
          )}
        </Container>
      </main>
    </>
  );
}
