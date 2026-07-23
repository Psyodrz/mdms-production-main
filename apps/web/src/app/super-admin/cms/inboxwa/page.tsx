import React from 'react';
import { WhatsAppConfigCard } from '@/components/admin/WhatsAppConfigCard';
import { Reveal } from '@/components/ui/Reveal';
import { MessageSquare, Bot, Sparkles, Radio, Server, ExternalLink, ShieldCheck } from 'lucide-react';

export default function InboxWACmsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <Reveal direction="up">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
                Live Messaging Gateway
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
              WhatsApp & InboxWA Automation System
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage live customer queries, website WhatsApp widget automation, InboxWA credentials & webhook integrations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://inboxwa.online"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl border border-border hover:border-emerald-500/50 bg-surface text-foreground text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              InboxWA Portal
            </a>
          </div>
        </div>
      </Reveal>

      {/* Info Overview Cards */}
      <Reveal direction="up" delay={0.05}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Website Live Chatbot</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Automated AI customer query handler for MP Production website visitors via WhatsApp widget.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">InboxWA Webhook URL</h3>
            </div>
            <p className="text-xs font-mono text-muted-foreground truncate bg-background p-2 rounded border border-border">
              /api/v1/whatsapp/inboxwa/webhook
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Role Security</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Credentials modification & API key updates restricted exclusively to Super Admin role.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Configuration & Connection Test Card */}
      <Reveal direction="up" delay={0.1}>
        <WhatsAppConfigCard />
      </Reveal>
    </div>
  );
}
