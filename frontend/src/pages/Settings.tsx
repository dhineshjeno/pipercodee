import React, { useEffect, useMemo, useState } from 'react';
import { Settings as SettingsIcon, Code2, Bell, Lock, User, Download, LogOut } from 'lucide-react';
import { currentUser } from '../data/mockData';
import { buildLogoutUrl, getAccessToken, getIdTokenClaims, setAuthenticated } from '../config/cognito';
import { getMe, updateMe } from '../api/client';




export const Settings: React.FC = () => {
  const claims = useMemo(() => getIdTokenClaims(), []);
  const accessToken = useMemo(() => getAccessToken(), []);
  
  // Initialize with default values
  const defaultNotifications = {
    friendActivity: true,
    achievements: true,
    weeklyReport: true,
    leaderboardUpdates: false,
  };

  const defaultPrivacy = {
    showProfile: true,
    showActivity: true,
    showStats: false,
  };

  const [notifications, setNotifications] = useState(defaultNotifications);
  const [privacy, setPrivacy] = useState(defaultPrivacy);
  const [me, setMe] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    statusMessage: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meData = await getMe();
        if (cancelled || !meData) return; // Change '!me' to '!meData'
        
        setMe(meData);
        
       
  
        // Set notifications from backend or use defaults
        if (meData.notifications) { // Change 'me' to 'meData'
          setNotifications({
            ...defaultNotifications,
            ...meData.notifications // Change 'me' to 'meData'
          });
        }
  
        // Set privacy from backend or use defaults
        if (meData.privacy) { // Change 'me' to 'meData'
          setPrivacy({
            ...defaultPrivacy,
            ...meData.privacy // Change 'me' to 'meData'
          });
        }
      } catch (e) {
        console.error('Failed to load user data:', e);
        // Fallback to claims and defaults
        setForm({
          name: claims?.name || currentUser.name,
          statusMessage: currentUser.statusMessage || '',
        });
      }
    })();
    return () => { cancelled = true; };
  }, [claims, defaultNotifications, defaultPrivacy]); // Add dependencies


  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const updatedUser = await updateMe({ 
        name: form.name, 
        statusMessage: form.statusMessage 
      });
      setMe(updatedUser); // Add this line
      setSaveMsg('Profile saved successfully');
    } catch (e: any) {
      setSaveMsg(e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateMe({ notifications });
      setSaveMsg('Notification settings saved');
    } catch (e: any) {
      setSaveMsg(e?.message || 'Failed to save notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateMe({ privacy });
      setSaveMsg('Privacy settings saved');
    } catch (e: any) {
      setSaveMsg(e?.message || 'Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-slate-500/20 to-slate-600/20 p-3 rounded-xl">
            <SettingsIcon className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Settings</h1>
            <p className="text-slate-400">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-100">Account</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30">
              <p className="text-slate-400">Name</p>
              <p className="text-slate-200 font-medium">{me?.name || claims?.name || '—'}</p>
          </div>
            <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30">
              <p className="text-slate-400">Email</p>
              <p className="text-slate-200 font-medium">{claims?.email || '—'}</p>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30">
              <p className="text-slate-400">Username</p>
              <p className="text-slate-200 font-medium">{me?.username || claims?.preferred_username || currentUser.username}</p>
            </div>
            <div className="bg-slate-900/40 rounded-lg p-4 border border-slate-700/30 break-all">
              <p className="text-slate-400">User ID (sub)</p>
              <p className="text-slate-200 font-mono text-xs">{claims?.sub || '—'}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (accessToken) navigator.clipboard.writeText(accessToken);
              }}
              className="px-3 py-2 text-xs rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
            >
              Copy Access Token
            </button>
            <button
              onClick={() => {
                setAuthenticated(false);
                window.location.href = buildLogoutUrl();
              }}
              className="px-3 py-2 text-xs rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign out everywhere
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-100">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={form.name || me?.name || claims?.name || '—'}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status Message
              </label>
              <input
                type="text"
                value={form.statusMessage || me?.statusMessage}
                onChange={(e) => setForm({ ...form, statusMessage: e.target.value })}
                placeholder="What are you working on?"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {saveMsg && saveMsg.includes('Profile') && (
              <div className={`text-sm ${saveMsg.startsWith('Profile saved') ? 'text-emerald-400' : 'text-red-400'}`}>
                {saveMsg}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-100">VS Code Extension</h2>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30 mb-4">
            <p className="text-sm text-slate-300 mb-3">
              Install the PiperCode extension to automatically track your coding activity.
            </p>
            <div className="bg-slate-800/50 rounded p-3 mb-3">
              <code className="text-sm text-emerald-400">
                ext install pipercode.activity-tracker
              </code>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <Download className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                After installation, the extension will automatically start tracking your coding
                sessions, languages, and projects.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <span className="text-sm text-slate-300">Extension Status</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
              <span className="text-sm text-slate-300">Last Sync</span>
              <span className="text-sm text-slate-400">2 minutes ago</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-100">Notifications</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-slate-500">
                    {key === 'friendActivity' &&
                      'Get notified when friends start coding'}
                    {key === 'achievements' && 'Celebrate your coding milestones'}
                    {key === 'weeklyReport' && 'Receive weekly activity summary'}
                    {key === 'leaderboardUpdates' &&
                      'Get updates on your leaderboard position'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({ ...notifications, [key]: !value })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveNotifications}
            disabled={saving}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Notifications'}
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-slate-100">Privacy</h2>
          </div>

          <div className="space-y-4">
            {Object.entries(privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-slate-500">
                    {key === 'showProfile' && 'Allow others to view your profile'}
                    {key === 'showActivity' && 'Display your activity in friend feeds'}
                    {key === 'showStats' && 'Make your statistics publicly visible'}
                  </p>
                </div>
                <button
                  onClick={() => setPrivacy({ ...privacy, [key]: !value })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleSavePrivacy}
            disabled={saving}
            className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Privacy Settings'}
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-6 border border-red-500/20">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
              Reset All Statistics
            </button>
            <button className="w-full px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};