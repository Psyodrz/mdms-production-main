'use client';

import React, { useState, useEffect } from 'react';
import { Key, Save, Send, Sparkles, Eye, EyeOff, CheckCircle2, ShieldAlert, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { fetchAPI } from '@/lib/api-client';

export interface WhatsAppConfigData {
  provider: 'inboxwa' | 'meta';
  inboxwaApiKey: string;
  inboxwaInstanceId: string;
  inboxwaBaseUrl: string;
  inboxwaPhoneNumber: string;
  autoReplyEnabled: boolean;
  phoneNumberId?: string;
  accessToken?: string;
}

export const WhatsAppConfigCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [testPhone, setTestPhone] = useState('');

  const [form, setForm] = useState<WhatsAppConfigData>({
    provider: 'inboxwa',
    inboxwaApiKey: '',
    inboxwaInstanceId: '',
    inboxwaBaseUrl: 'https://inboxwa.online/api/v1',
    inboxwaPhoneNumber: '',
    autoReplyEnabled: true,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const json = await fetchAPI('/whatsapp/config');
      if (json && json.success && json.data) {
        setForm(json.data);
      }
    } catch (err: any) {
      console.warn('Could not fetch remote WhatsApp config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const json = await fetchAPI('/whatsapp/config', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (json && json.success) {
        toast.success('WhatsApp & InboxWA credentials saved and activated!');
        if (json.data) setForm(json.data);
      } else {
        toast.error(json?.message || 'Failed to save configuration');
      }
    } catch (err: any) {
      toast.error('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a test phone number');
      return;
    }

    setTesting(true);
    try {
      const json = await fetchAPI('/whatsapp/test', {
        method: 'POST',
        body: JSON.stringify({ phone: testPhone }),
      });

      if (json && json.success) {
        toast.success(json.message);
      } else {
        toast.error(json?.message || 'Test message failed to send');
      }
    } catch (err: any) {
      toast.error('Test failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 text-center text-muted-foreground">
        Loading WhatsApp Automation Settings...
      </div>
    );
  }

  return (
    <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 shadow-xl relative overflow-hidden text-foreground">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-(--color-border) pb-4 mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
              WhatsApp & InboxWA Automation Config
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
              Restricted Access: Super Admin Only
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Active Provider: {form.provider.toUpperCase()}
        </span>
      </div>

      {authError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
          <span>🔒 {authError}</span>
          <a href="/login" className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors shrink-0">
            Sign In
          </a>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Provider Select */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Automation Provider
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, provider: 'inboxwa' })}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                form.provider === 'inboxwa'
                  ? 'bg-emerald-500/10 border-emerald-500 text-foreground ring-1 ring-emerald-500'
                  : 'bg-background/50 border-(--color-border) text-muted-foreground hover:border-foreground/40'
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">InboxWA Gateway</p>
                <p className="text-xs text-muted-foreground">https://inboxwa.online</p>
              </div>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.provider === 'inboxwa' ? 'border-emerald-500 bg-emerald-500' : 'border-(--color-border)'}`}>
                {form.provider === 'inboxwa' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, provider: 'meta' })}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                form.provider === 'meta'
                  ? 'bg-emerald-500/10 border-emerald-500 text-foreground ring-1 ring-emerald-500'
                  : 'bg-background/50 border-(--color-border) text-muted-foreground hover:border-foreground/40'
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Meta Cloud API</p>
                <p className="text-xs text-muted-foreground">graph.facebook.com</p>
              </div>
              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.provider === 'meta' ? 'border-emerald-400 bg-emerald-500' : 'border-(--color-border)'}`}>
                {form.provider === 'meta' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
            </button>
          </div>
        </div>

        {/* InboxWA API Credentials */}
        {form.provider === 'inboxwa' && (
          <div className="space-y-4 bg-background/50 border border-(--color-border) p-4 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* API Key */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  InboxWA API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={form.inboxwaApiKey}
                    onChange={(e) => setForm({ ...form, inboxwaApiKey: e.target.value })}
                    placeholder="Enter your InboxWA API Key..."
                    className="w-full bg-background border border-(--color-border) focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none pr-10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Instance ID */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Instance ID
                </label>
                <input
                  type="text"
                  value={form.inboxwaInstanceId}
                  onChange={(e) => setForm({ ...form, inboxwaInstanceId: e.target.value })}
                  placeholder="e.g. 64B29F..."
                  className="w-full bg-background border border-(--color-border) focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base URL */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  InboxWA Base API URL
                </label>
                <input
                  type="text"
                  value={form.inboxwaBaseUrl}
                  onChange={(e) => setForm({ ...form, inboxwaBaseUrl: e.target.value })}
                  placeholder="https://inboxwa.online/api/v1"
                  className="w-full bg-background border border-(--color-border) focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors"
                />
              </div>

              {/* Sender Phone Number */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  WhatsApp Business Phone Number
                </label>
                <input
                  type="text"
                  value={form.inboxwaPhoneNumber}
                  onChange={(e) => setForm({ ...form, inboxwaPhoneNumber: e.target.value })}
                  placeholder="e.g. 919876543210"
                  className="w-full bg-background border border-(--color-border) focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Auto Reply Toggle */}
        <div className="flex items-center justify-between p-4 bg-background/50 border border-(--color-border) rounded-xl">
          <div className="flex items-center space-x-3">
            <Bot className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-foreground">Enable Automated WhatsApp Customer Chatbot</p>
              <p className="text-[11px] text-muted-foreground">Automatically reply to incoming customer WhatsApp queries on website</p>
            </div>
          </div>
          <Switch
            checked={form.autoReplyEnabled}
            onCheckedChange={(checked) => setForm({ ...form, autoReplyEnabled: checked })}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg disabled:opacity-50 uppercase tracking-wider"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Activating Credentials...' : 'Save & Activate WhatsApp Integration'}</span>
          </button>
        </div>
      </form>

      {/* Connection Test Section */}
      <div className="mt-8 pt-6 border-t border-(--color-border)">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Test WhatsApp Connection
        </h4>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            placeholder="Enter test phone number with country code (e.g. 919876543210)..."
            className="w-full sm:flex-1 bg-background border border-(--color-border) focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors"
          />
          <button
            type="button"
            onClick={handleTestSend}
            disabled={testing}
            className="w-full sm:w-auto bg-background hover:bg-muted text-foreground text-xs px-5 py-2.5 rounded-xl border border-(--color-border) flex items-center justify-center space-x-2 transition-all disabled:opacity-50 font-medium"
          >
            <Send className="w-3.5 h-3.5 text-emerald-500" />
            <span>{testing ? 'Sending...' : 'Send Test Message'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

