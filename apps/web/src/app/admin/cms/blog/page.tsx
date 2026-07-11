"use client";

import { PortalNavbar } from '@/components/ui/PortalNavbar';
import { Reveal } from '@/components/ui/Reveal';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { RefreshCw, Trash2, Edit3, Loader2, Plus } from 'lucide-react';
import { fetchAPI } from '@/lib/api-client';

const FALLBACK_BLOG_POSTS = [
  { id: 'b-1', title: 'The Evolution of Virtual Production in Luxury Advertising', slug: 'evolution-virtual-production', category: 'Technology', publishedAt: '2026-06-15', status: 'PUBLISHED', isPublished: true },
  { id: 'b-2', title: 'Casting for Global Brands: Diversity & Authenticity in 2026', slug: 'casting-global-brands-2026', category: 'Casting & Talent', publishedAt: '2026-05-28', status: 'PUBLISHED', isPublished: true },
  { id: 'b-3', title: 'Behind the Scenes: Designing Soundstages for High-Speed Robotics', slug: 'behind-the-scenes-robotics', category: 'Studio Production', publishedAt: '2026-04-10', status: 'PUBLISHED', isPublished: true },
  { id: 'b-4', title: 'Color Grading Secrets: Achieving the Cinematic Look', slug: 'color-grading-secrets', category: 'Post-Production', publishedAt: null, status: 'DRAFT', isPublished: false },
];

export default function CMSBlog() {
  const [posts, setPosts] = useState<any[]>(FALLBACK_BLOG_POSTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [excerpt, setExcerpt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const json = await fetchAPI('/cms/admin/blog');
      const list = json.data || json;
      if (Array.isArray(list)) {
        setPosts(list.length > 0 ? list : FALLBACK_BLOG_POSTS);
      }
      if (isRefresh) toast.success('Blog posts refreshed');
    } catch (err) {
      if (isRefresh) toast.error('Network error refreshing posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a post title');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `post-${Date.now()}`;

      await fetchAPI('/cms/admin/blog', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug,
          category,
          excerpt: excerpt || 'Expert insight from the production team.',
          content: `${excerpt || title}\n\nFull article content coming soon...`,
          status: 'PUBLISHED',
          isPublished: true,
          publishedAt: new Date().toISOString()
        })
      });
      toast.success('Blog post created successfully');
      setIsModalOpen(false);
      setTitle('');
      setExcerpt('');
      fetchPosts(true);
    } catch (err) {
      toast.error('Error creating blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success('Blog post deleted');

    try {
      await fetchAPI(`/cms/admin/blog/${id}`, {
        method: 'DELETE'
      });
      fetchPosts();
    } catch (err) {
      toast.error('Failed to delete post on server');
    }
  };

  const handleToggleStatus = async (post: any) => {
    const updatedPublished = !post.isPublished;
    const updatedStatus = updatedPublished ? 'PUBLISHED' : 'DRAFT';
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: updatedStatus, isPublished: updatedPublished } : p));
    toast.success(updatedPublished ? 'Blog post published live' : 'Blog post set to draft');

    try {
      await fetchAPI('/cms/admin/blog', {
        method: 'POST',
        body: JSON.stringify({
          slug: post.slug,
          isPublished: updatedPublished,
          status: updatedStatus,
          title: post.title,
          category: post.category
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <PortalNavbar />
      
      <main className="page-content">
        <div className="max-w-7xl mx-auto">
          
          <Reveal direction="up">
            <div className="mb-12 border-b border-[var(--color-border)] pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <span className="text-[var(--color-primary)] tracking-[0.2em] text-xs uppercase font-semibold mb-2 block">
                  CMS Administration
                </span>
                <h1 className="text-4xl font-serif text-foreground">
                  Insights & Blog
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchPosts(true)}
                  disabled={refreshing}
                  className="px-4 py-3 bg-surface border border-border hover:border-primary rounded-sm text-sm font-semibold tracking-widest uppercase flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Write Post
                </button>
              </div>
            </div>
          </Reveal>

          {loading ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 rounded-xl space-y-4 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-muted/40 rounded w-full" />
              ))}
            </div>
          ) : (
            <Reveal direction="up" delay={0.1}>
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 overflow-x-auto shadow-sm rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-muted-foreground text-xs tracking-widest uppercase font-semibold">
                      <th className="pb-4">Title</th>
                      <th className="pb-4">Category</th>
                      <th className="pb-4">Published</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-muted-foreground">
                          No blog posts found. Write your first post above!
                        </td>
                      </tr>
                    ) : (
                      posts.map((post: any) => (
                        <tr key={post.id} className="hover:bg-[var(--color-base)] transition-colors">
                          <td className="py-4 font-medium text-foreground">
                            {post.title}
                            <span className="block text-xs text-muted-foreground font-normal font-mono">/{post.slug}</span>
                          </td>
                          <td className="py-4 text-muted-foreground capitalize text-sm">{post.category || '-'}</td>
                          <td className="py-4 text-muted-foreground text-sm">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Unpublished'}
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => handleToggleStatus(post)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-sm uppercase tracking-wider border transition-colors ${
                                post.status === 'PUBLISHED' || post.isPublished
                                  ? 'bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20'
                              }`}
                            >
                              {post.status || (post.isPublished ? 'PUBLISHED' : 'DRAFT')}
                            </button>
                          </td>
                          <td className="py-4 text-right whitespace-nowrap">
                            <button 
                              onClick={() => handleToggleStatus(post)}
                              className="text-muted-foreground hover:text-primary text-xs uppercase tracking-widest transition-colors mr-4 font-semibold inline-flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> {post.status === 'PUBLISHED' || post.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="text-red-500 hover:text-red-400 text-xs uppercase tracking-widest transition-colors font-semibold inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Reveal>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-8 max-w-lg w-full rounded-sm shadow-2xl relative animate-fadeIn">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-black transition-colors"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-serif text-foreground mb-6">Write New Blog Post</h2>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Post Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground" 
                      placeholder="e.g. Virtual Production Insights 2026"
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Casting & Talent">Casting & Talent</option>
                      <option value="Studio Production">Studio Production</option>
                      <option value="Post-Production">Post-Production</option>
                      <option value="Industry News">Industry News</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Excerpt Summary</label>
                    <textarea 
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--color-base)] border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none text-foreground"
                      placeholder="Brief overview of the article..."
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 px-6 py-3 bg-primary text-white font-semibold tracking-widest text-sm uppercase hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                      </>
                    ) : (
                      'Publish Post'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

