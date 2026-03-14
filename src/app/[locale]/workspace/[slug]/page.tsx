'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@i18n/navigation';
import { ChevronLeft, ListTodo, Users, Activity, Settings as SettingsIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { AgentsSidebar } from '@/components/AgentsSidebar';
import { MissionQueue } from '@/components/MissionQueue';
import { LiveFeed } from '@/components/LiveFeed';
import { useMissionControl } from '@/lib/store';
import { useSSE } from '@/hooks/useSSE';
import { debug } from '@/lib/debug';
import type { Task, Workspace } from '@/lib/types';

type MobileTab = 'queue' | 'agents' | 'feed' | 'settings';

export default function WorkspacePage() {
  const t = useTranslations('common');
  const params = useParams();
  const slug = params.slug as string;

  const { setAgents, setTasks, setEvents, setIsOnline, setIsLoading, isLoading } = useMissionControl();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('queue');
  const [isPortrait, setIsPortrait] = useState(true);

  useSSE();

  useEffect(() => {
    const media = window.matchMedia('(orientation: portrait)');
    const updateOrientation = () => setIsPortrait(media.matches);

    updateOrientation();
    media.addEventListener('change', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      media.removeEventListener('change', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, []);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch(`/api/workspaces/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setWorkspace(data);
        } else if (res.status === 404) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Failed to load workspace:', error);
        setNotFound(true);
        setIsLoading(false);
        return;
      }
    }

    loadWorkspace();
  }, [slug, setIsLoading]);

  useEffect(() => {
    if (!isPortrait && mobileTab === 'queue') {
      setMobileTab('agents');
    }
  }, [isPortrait, mobileTab]);

  useEffect(() => {
    if (!workspace) return;

    const workspaceId = workspace.id;

    async function loadData() {
      try {
        debug.api('Loading workspace data...', { workspaceId });

        const [agentsRes, tasksRes, eventsRes] = await Promise.all([
          fetch(`/api/agents?workspace_id=${workspaceId}`),
          fetch(`/api/tasks?workspace_id=${workspaceId}`),
          fetch('/api/events'),
        ]);

        if (agentsRes.ok) setAgents(await agentsRes.json());
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          debug.api('Loaded tasks', { count: tasksData.length });
          setTasks(tasksData);
        }
        if (eventsRes.ok) setEvents(await eventsRes.json());
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    async function checkOpenClaw() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const openclawRes = await fetch('/api/openclaw/status', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (openclawRes.ok) {
          const status = await openclawRes.json();
          setIsOnline(status.connected);
        }
      } catch {
        setIsOnline(false);
      }
    }

    loadData();
    checkOpenClaw();

    const eventPoll = setInterval(async () => {
      try {
        const res = await fetch('/api/events?limit=20');
        if (res.ok) {
          setEvents(await res.json());
        }
      } catch (error) {
        console.error('Failed to poll events:', error);
      }
    }, 30000);

    const taskPoll = setInterval(async () => {
      try {
        const res = await fetch(`/api/tasks?workspace_id=${workspaceId}`);
        if (res.ok) {
          const newTasks: Task[] = await res.json();
          const currentTasks = useMissionControl.getState().tasks;

          const hasChanges =
            newTasks.length !== currentTasks.length ||
            newTasks.some((t) => {
              const current = currentTasks.find((ct) => ct.id === t.id);
              return !current || current.updated_at !== t.updated_at;
            });

          if (hasChanges) {
            debug.api('[FALLBACK] Task changes detected via polling, updating store');
            setTasks(newTasks);
          }
        }
      } catch (error) {
        console.error('Failed to poll tasks:', error);
      }
    }, 60000);

    const connectionCheck = setInterval(async () => {
      try {
        const res = await fetch('/api/openclaw/status');
        if (res.ok) {
          const status = await res.json();
          setIsOnline(status.connected);
        }
      } catch {
        setIsOnline(false);
      }
    }, 30000);

    return () => {
      clearInterval(eventPoll);
      clearInterval(connectionCheck);
      clearInterval(taskPoll);
    };
  }, [workspace, setAgents, setTasks, setEvents, setIsOnline, setIsLoading]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-mc-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-2">{t('workspaceNotFound')}</h1>
          <p className="text-mc-text-secondary mb-6">{t('workspaceNotFoundDetail', { slug })}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-mc-accent text-mc-bg rounded-lg font-medium hover:bg-mc-accent/90">
            <ChevronLeft className="w-4 h-4" />
            {t('backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !workspace) {
    return (
      <div className="min-h-screen bg-mc-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🦞</div>
          <p className="text-mc-text-secondary">{t('loadingWorkspace', { slug })}</p>
        </div>
      </div>
    );
  }

  const headerProps = { workspace, isPortrait };

  return (
    <div className="min-h-screen bg-mc-bg flex flex-col">
      <Header {...headerProps} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {(!isPortrait || mobileTab === 'agents') && (
          <AgentsSidebar
            workspaceId={workspace.id}
            mobileMode={isPortrait}
            isPortrait={isPortrait}
          />
        )}

        {(!isPortrait || mobileTab === 'queue') && (
          <MissionQueue
            workspaceId={workspace.id}
            mobileMode={isPortrait}
            isPortrait={isPortrait}
          />
        )}

        {(!isPortrait || mobileTab === 'feed') && <LiveFeed mobileMode={isPortrait} isPortrait={isPortrait} />}

        {(!isPortrait || mobileTab === 'settings') && (
            <div className="lg:hidden flex-1 overflow-y-auto">
              <div className="p-4 text-mc-text-secondary">{t('settings')}</div>
            </div>
        )}
      </div>

      {isPortrait && (
        <div className="lg:hidden border-t border-mc-border bg-mc-bg-secondary p-2">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => setMobileTab('queue')}
              className={`min-h-11 px-2 py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 ${
                mobileTab === 'queue' ? 'bg-mc-accent text-mc-bg' : 'text-mc-text-secondary'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>{t('missionQueue')}</span>
            </button>
            <button
              onClick={() => setMobileTab('agents')}
              className={`min-h-11 px-2 py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 ${
                mobileTab === 'agents' ? 'bg-mc-accent text-mc-bg' : 'text-mc-text-secondary'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('agents')}</span>
            </button>
            <button
              onClick={() => setMobileTab('feed')}
              className={`min-h-11 px-2 py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 ${
                mobileTab === 'feed' ? 'bg-mc-accent text-mc-bg' : 'text-mc-text-secondary'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t('feedTab')}</span>
            </button>
            <button
              onClick={() => setMobileTab('settings')}
              className={`min-h-11 px-2 py-2 rounded-lg text-xs flex flex-col items-center justify-center gap-1 ${
                mobileTab === 'settings' ? 'bg-mc-accent text-mc-bg' : 'text-mc-text-secondary'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>{t('settings')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
