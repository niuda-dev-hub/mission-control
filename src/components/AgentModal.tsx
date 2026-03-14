'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Save, Trash2 } from 'lucide-react';
import { useMissionControl } from '@/lib/store';
import type { Agent, AgentStatus } from '@/lib/types';

interface AgentModalProps {
  agent?: Agent;
  onClose: () => void;
  workspaceId?: string;
  onAgentCreated?: (agentId: string) => void;
}

const EMOJI_OPTIONS = ['🤖', '🦞', '💻', '🔍', '✍️', '🎨', '📊', '🧠', '⚡', '🚀', '🎯', '🔧'];

export function AgentModal({ agent, onClose, workspaceId, onAgentCreated }: AgentModalProps) {
  const t = useTranslations('agent');
  const { addAgent, updateAgent, agents } = useMissionControl();
  const [activeTab, setActiveTab] = useState<'info' | 'soul' | 'user' | 'agents'>('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState(true);

  const [form, setForm] = useState({
    name: agent?.name || '',
    role: agent?.role || '',
    description: agent?.description || '',
    avatar_emoji: agent?.avatar_emoji || '🤖',
    status: agent?.status || 'standby' as AgentStatus,
    is_master: agent?.is_master || false,
    soul_md: agent?.soul_md || '',
    user_md: agent?.user_md || '',
    agents_md: agent?.agents_md || '',
    model: agent?.model || '',
  });

  // Load available models from OpenClaw config
  useEffect(() => {
    const loadModels = async () => {
      try {
        const res = await fetch('/api/openclaw/models');
        if (res.ok) {
          const data = await res.json();
          setAvailableModels(data.availableModels || []);
          setDefaultModel(data.defaultModel || '');
          // If agent has no model set, use default
          if (!agent?.model && data.defaultModel) {
            setForm(prev => ({ ...prev, model: data.defaultModel }));
          }
        }
      } catch (error) {
        console.error('Failed to load models:', error);
      } finally {
        setModelsLoading(false);
      }
    };
    loadModels();
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = agent ? `/api/agents/${agent.id}` : '/api/agents';
      const method = agent ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          workspace_id: workspaceId || agent?.workspace_id || 'default',
        }),
      });

      if (res.ok) {
        const savedAgent = await res.json();
        if (agent) {
          updateAgent(savedAgent);
        } else {
          addAgent(savedAgent);
          // Notify parent if callback provided (e.g., for inline agent creation)
          if (onAgentCreated) {
            onAgentCreated(savedAgent.id);
          }
        }
        onClose();
      }
    } catch (error) {
      console.error('Failed to save agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!agent || !confirm(t('confirmDelete', { name: agent.name }))) return;

    try {
      const res = await fetch(`/api/agents/${agent.id}`, { method: 'DELETE' });
      if (res.ok) {
        // Remove from store
        useMissionControl.setState((state) => ({
          agents: state.agents.filter((a) => a.id !== agent.id),
          selectedAgent: state.selectedAgent?.id === agent.id ? null : state.selectedAgent,
        }));
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const tabs = [
    { id: 'info', label: t('tabs.info') },
    { id: 'soul', label: t('tabs.soul') },
    { id: 'user', label: t('tabs.user') },
    { id: 'agents', label: t('tabs.agents') },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-mc-bg-secondary border border-mc-border rounded-t-xl sm:rounded-lg w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)] sm:pb-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-mc-border">
          <h2 className="text-lg font-semibold">
            {agent ? t('editTitle', { name: agent.name }) : t('createTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-mc-bg-tertiary rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-mc-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 min-h-11 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-mc-accent text-mc-accent'
                  : 'border-transparent text-mc-text-secondary hover:text-mc-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Avatar Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">{t('fields.avatar')}</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm({ ...form, avatar_emoji: emoji })}
                      className={`text-2xl p-2 rounded hover:bg-mc-bg-tertiary ${
                        form.avatar_emoji === emoji
                          ? 'bg-mc-accent/20 ring-2 ring-mc-accent'
                          : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.name')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full min-h-11 bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
                  placeholder={t('placeholders.name')}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.role')}</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                  className="w-full min-h-11 bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
                  placeholder={t('placeholders.role')}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.description')}</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-accent resize-none"
                  placeholder={t('placeholders.description')}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">{t('fields.status')}</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as AgentStatus })}
                  className="w-full min-h-11 bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
                >
                  <option value="standby">{t('status.standby')}</option>
                  <option value="working">{t('status.working')}</option>
                  <option value="offline">{t('status.offline')}</option>
                </select>
              </div>

              {/* Master Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_master"
                  checked={form.is_master}
                  onChange={(e) => setForm({ ...form, is_master: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_master" className="text-sm">
                  {t('fields.master')}
                </label>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('fields.model')}
                  {defaultModel && form.model === defaultModel && (
                    <span className="ml-2 text-xs text-mc-text-secondary">({t('model.default')})</span>
                  )}
                </label>
                {modelsLoading ? (
                  <div className="text-sm text-mc-text-secondary">{t('model.loading')}</div>
                ) : (
                  <select
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full min-h-11 bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
                  >
                    <option value="">{t('model.useDefault')}</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}{defaultModel === model ? ` (${t('model.default')})` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-mc-text-secondary mt-1">
                  {t('model.help')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'soul' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('soul.label')}
              </label>
              <textarea
                value={form.soul_md}
                onChange={(e) => setForm({ ...form, soul_md: e.target.value })}
                rows={15}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-mc-accent resize-none"
                placeholder={t('soul.placeholder')}
              />
            </div>
          )}

          {activeTab === 'user' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('user.label')}
              </label>
              <textarea
                value={form.user_md}
                onChange={(e) => setForm({ ...form, user_md: e.target.value })}
                rows={15}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-mc-accent resize-none"
                placeholder={t('user.placeholder')}
              />
            </div>
          )}

          {activeTab === 'agents' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('agents.label')}
              </label>
              <textarea
                value={form.agents_md}
                onChange={(e) => setForm({ ...form, agents_md: e.target.value })}
                rows={15}
                className="w-full bg-mc-bg border border-mc-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-mc-accent resize-none"
                placeholder={t('agents.placeholder')}
              />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-mc-border">
          <div>
            {agent && (
              <button
                type="button"
                onClick={handleDelete}
                className="min-h-11 flex items-center gap-2 px-3 py-2 text-mc-accent-red hover:bg-mc-accent-red/10 rounded text-sm"
              >
                <Trash2 className="w-4 h-4" />
                {t('delete')}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 py-2 text-sm text-mc-text-secondary hover:text-mc-text"
            >
                {t('cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-h-11 flex items-center gap-2 px-4 py-2 bg-mc-accent text-mc-bg rounded text-sm font-medium hover:bg-mc-accent/90 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
