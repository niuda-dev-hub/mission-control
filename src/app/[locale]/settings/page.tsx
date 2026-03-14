'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@i18n/navigation';
import { Settings, Save, RotateCcw, FolderOpen, Link as LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getConfig, updateConfig, resetConfig, type MissionControlConfig } from '@/lib/config';

export default function SettingsPage() {
  const router = useRouter();
  const t = useTranslations('common');
  const [config, setConfig] = useState<MissionControlConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      updateConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm(t('resetConfirm'))) {
      resetConfig();
      setConfig(getConfig());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleChange = <K extends keyof MissionControlConfig>(field: K, value: MissionControlConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-mc-bg flex items-center justify-center">
        <div className="text-mc-text-secondary">{t('loadingSettings')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mc-bg">
      <div className="border-b border-mc-border bg-mc-bg-secondary">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-mc-bg-tertiary rounded text-mc-text-secondary"
              title={t('backToDashboard')}
            >
              ← {t('back')}
            </button>
            <Settings className="w-6 h-6 text-mc-accent" />
            <h1 className="text-2xl font-bold text-mc-text">{t('settingsTitle')}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-mc-border rounded hover:bg-mc-bg-tertiary text-mc-text-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t('resetToDefaults')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-mc-accent text-mc-bg rounded hover:bg-mc-accent/90 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded text-green-400">
            {t('settingsSaved')}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400">
            ✗ {error}
          </div>
        )}

        <section className="mb-8 p-6 bg-mc-bg-secondary border border-mc-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-mc-accent" />
            <h2 className="text-xl font-semibold text-mc-text">{t('workspacePaths')}</h2>
          </div>
          <p className="text-sm text-mc-text-secondary mb-4">
            {t('workspacePathsHelp')}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                {t('workspaceBasePath')}
              </label>
              <input
                type="text"
                value={config.workspaceBasePath}
                onChange={(e) => handleChange('workspaceBasePath', e.target.value)}
                placeholder="~/Documents/Shared"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                {t('workspaceBasePathHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                {t('projectsPath')}
              </label>
              <input
                type="text"
                value={config.projectsPath}
                onChange={(e) => handleChange('projectsPath', e.target.value)}
                placeholder="~/Documents/Shared/projects"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                {t('projectsPathHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                {t('defaultProjectName')}
              </label>
              <input
                type="text"
                value={config.defaultProjectName}
                onChange={(e) => handleChange('defaultProjectName', e.target.value)}
                placeholder="mission-control"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                {t('defaultProjectNameHelp')}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 p-6 bg-mc-bg-secondary border border-mc-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5 text-mc-accent" />
            <h2 className="text-xl font-semibold text-mc-text">{t('apiConfiguration')}</h2>
          </div>
          <p className="text-sm text-mc-text-secondary mb-4">
            {t('apiConfigurationHelp')}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                {t('missionControlUrl')}
              </label>
              <input
                type="text"
                value={config.missionControlUrl}
                onChange={(e) => handleChange('missionControlUrl', e.target.value)}
                placeholder="http://localhost:4000"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                {t('missionControlUrlHelp')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                {t('missionControlUrl')}
              </label>
              <input
                type="text"
                value={config.missionControlUrl}
                onChange={(e) => handleChange('missionControlUrl', e.target.value)}
                placeholder="http://localhost:4000"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                {t('missionControlUrlHelp')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
