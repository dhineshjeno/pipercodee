import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Code2, Folder, TrendingUp } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getMe } from '../api/client';
import { getIdTokenClaims } from '../config/cognito';
import { StatCard } from '../components/StatCard';
import { StreakCounter } from '../components/StreakCounter';
import { LanguageBadge } from '../components/LanguageBadge';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard: React.FC = () => {
  const claims = useMemo(() => getIdTokenClaims(), []);
  const [stats, setStats] = useState<any>({
    todayTime: 0,
    weekTime: 0,
    monthTime: 0,
    streak: 0,
    longestStreak: 0,
    languages: {},
    projects: {},
  });
  const [name, setName] = useState<string>('');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await getMe();
        if (cancelled || !me) return;
        if (me.stats) setStats(me.stats);
        if (me.name) setName(me.name);
      } catch (e: any) {
        if (!cancelled) setLoadError(e?.message || 'Failed to load dashboard');
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const formatHours = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  };

  const languageData = {
    labels: Object.keys(stats.languages as Record<string, number>),
    datasets: [
      {
        data: (Object.values(stats.languages as Record<string, number>) as number[]).map((s: number) => Math.floor(s / 3600)),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(6, 182, 212, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(6, 182, 212, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const projectData = {
    labels: Object.keys(stats.projects as Record<string, number>),
    datasets: [
      {
        label: 'Hours',
        data: (Object.values(stats.projects as Record<string, number>) as number[]).map((s: number) => Math.floor(s / 3600)),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Welcome back, {(claims?.name || name).split(' ')[0]}!
        </h1>
        <p className="text-slate-400">Here's your coding activity overview</p>
        {loadError && (
          <p className="text-xs text-red-400 mt-2">{loadError}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today"
          value={formatHours(stats.todayTime)}
          subtitle="Keep it up!"
          icon={Clock}
          color="indigo"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="This Week"
          value={formatHours(stats.weekTime)}
          subtitle="7 days"
          icon={TrendingUp}
          color="emerald"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Languages"
          value={Object.keys(stats.languages).length}
          subtitle="Active languages"
          icon={Code2}
          color="blue"
        />
        <StatCard
          title="Projects"
          value={Object.keys(stats.projects).length}
          subtitle="In progress"
          icon={Folder}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">
              Language Distribution
            </h2>
            <div className="h-64">
              <Doughnut data={languageData} options={chartOptions} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.keys(stats.languages).map((lang) => (
                <LanguageBadge key={lang} language={lang} />
              ))}
            </div>
          </div>
        </div>

        <div>
          <StreakCounter
            currentStreak={stats.streak || 0}
            longestStreak={stats.longestStreak || 0}
            size="md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Project Activity</h2>
          <div className="h-64">
            {Object.keys(stats.projects as Record<string, number>).length > 0 ? (
              <Bar data={projectData} options={barChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">No project data</div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Active Projects</h2>
          <div className="space-y-3 text-sm text-slate-500">
            Coming soon
          </div>
        </div>
      </div>

      {/* Recent Activity via API will be added later */}
    </div>
  );
};
