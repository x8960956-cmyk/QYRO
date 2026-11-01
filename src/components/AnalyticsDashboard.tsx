import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Clock,
  Calendar,
  Filter,
  TrendingUp,
  RefreshCw,
  Zap
} from 'lucide-react';

interface AnalyticsDashboardProps {
  selectedQRId?: string | null;
  onClearSelectedQR?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  selectedQRId,
  onClearSelectedQR,
}) => {
  const [data, setData] = useState<any>(null);
  const [qrsList, setQrsList] = useState<any[]>([]);
  const [activeQRId, setActiveQRId] = useState<string>(selectedQRId || 'all');
  const [loading, setLoading] = useState(true);

  // Load dynamic QRs for dropdown
  useEffect(() => {
    fetch('/api/dynamic-qrs')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setQrsList(res.data);
      })
      .catch(console.error);
  }, []);

  // Fetch metrics
  const fetchMetrics = async (qrId: string) => {
    setLoading(true);
    try {
      if (qrId === 'all') {
        const res = await fetch('/api/analytics/overview');
        const json = await res.json();
        if (json.success) setData(json.data);
      } else {
        const res = await fetch(`/api/dynamic-qrs/${qrId}/analytics`);
        const json = await res.json();
        if (json.success) setData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(activeQRId);
  }, [activeQRId]);

  const totalScans =
    activeQRId === 'all'
      ? data?.totalScans || 0
      : data?.totalScans || 0;

  const deviceCounts =
    activeQRId === 'all'
      ? data?.deviceCounts || { mobile: 0, desktop: 0, tablet: 0 }
      : data?.byDevice || { mobile: 0, desktop: 0, tablet: 0 };

  const browserCounts =
    activeQRId === 'all' ? data?.browserCounts || {} : data?.byBrowser || {};

  const dateCounts =
    activeQRId === 'all' ? data?.dateCounts || {} : data?.byDate || {};

  const totalDevices = (deviceCounts.mobile || 0) + (deviceCounts.desktop || 0) + (deviceCounts.tablet || 0) || 1;
  const mobilePct = Math.round(((deviceCounts.mobile || 0) / totalDevices) * 100);
  const desktopPct = Math.round(((deviceCounts.desktop || 0) / totalDevices) * 100);
  const tabletPct = Math.round(((deviceCounts.tablet || 0) / totalDevices) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#7657FF]/10 border border-[#7657FF]/30 text-xs font-semibold text-[#15D9F5] mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Real-Time Redirect Telemetry</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F8FAFF] font-heading">
            Scan Analytics & Insights
          </h1>
          <p className="text-sm text-[#A8B4D0]">
            Privacy-centric device metrics, scan volumes, and user engagement logs.
          </p>
        </div>

        {/* Dropdown filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={activeQRId}
            onChange={(e) => setActiveQRId(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-[#111A31] border border-[#25304B] text-xs font-semibold text-[#F8FAFF] focus:border-[#15D9F5] focus:outline-none w-full sm:w-64"
          >
            <option value="all">Global Performance (All QRs)</option>
            {qrsList.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} (/r/{q.code})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchMetrics(activeQRId)}
            className="p-2.5 rounded-xl bg-[#111A31] border border-[#25304B] text-[#A8B4D0] hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <div className="w-8 h-8 border-3 border-[#15D9F5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider">
                Total Recorded Scans
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-[#F8FAFF] font-heading">
                  {totalScans}
                </span>
                <span className="text-xs text-[#10B981] font-semibold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  Live
                </span>
              </div>
            </div>

            <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider">
                Mobile Scanner Share
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-[#15D9F5] font-heading">
                  {mobilePct}%
                </span>
                <span className="text-xs text-[#A8B4D0]">smartphones</span>
              </div>
            </div>

            <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider">
                Desktop / Laptop Share
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-[#7657FF] font-heading">
                  {desktopPct}%
                </span>
                <span className="text-xs text-[#A8B4D0]">workstations</span>
              </div>
            </div>

            <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-5 shadow-lg space-y-2">
              <span className="text-xs font-semibold text-[#A8B4D0] uppercase tracking-wider">
                Active Dynamic Routes
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-[#F8FAFF] font-heading">
                  {data?.activeQRs ?? qrsList.filter((q) => q.status === 'active').length}
                </span>
                <span className="text-xs text-[#10B981] font-semibold">online</span>
              </div>
            </div>
          </div>

          {/* Device & Browser Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device breakdown bar */}
            <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-sm font-bold text-[#F8FAFF] font-heading flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-[#15D9F5]" />
                <span>Device Platform Split</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A8B4D0] flex items-center space-x-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-[#15D9F5]" />
                      <span>Mobile (iOS & Android)</span>
                    </span>
                    <span className="font-mono text-[#F8FAFF] font-bold">
                      {deviceCounts.mobile || 0} ({mobilePct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1428] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7657FF] to-[#15D9F5] rounded-full"
                      style={{ width: `${mobilePct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A8B4D0] flex items-center space-x-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#7657FF]" />
                      <span>Desktop & Laptop</span>
                    </span>
                    <span className="font-mono text-[#F8FAFF] font-bold">
                      {deviceCounts.desktop || 0} ({desktopPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1428] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7657FF] rounded-full"
                      style={{ width: `${desktopPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#A8B4D0] flex items-center space-x-1.5">
                      <Tablet className="w-3.5 h-3.5 text-[#246BFD]" />
                      <span>Tablet / iPad</span>
                    </span>
                    <span className="font-mono text-[#F8FAFF] font-bold">
                      {deviceCounts.tablet || 0} ({tabletPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1428] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#246BFD] rounded-full"
                      style={{ width: `${tabletPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Browser breakdown */}
            <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-xl space-y-5">
              <h3 className="text-sm font-bold text-[#F8FAFF] font-heading flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#7657FF]" />
                <span>Top Browsers & User Agents</span>
              </h3>

              <div className="space-y-3">
                {Object.keys(browserCounts).length === 0 ? (
                  <p className="text-xs text-[#A8B4D0] py-6 text-center">
                    No browser telemetry recorded yet.
                  </p>
                ) : (
                  Object.entries(browserCounts).map(([browser, count]) => {
                    const pct = Math.round(((count as number) / (totalScans || 1)) * 100);
                    return (
                      <div key={browser} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#F8FAFF] font-medium">{browser}</span>
                          <span className="font-mono text-[#A8B4D0]">
                            {count as number} scans ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0D1428] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#246BFD] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Recent Scans Log Table */}
          {activeQRId !== 'all' && data?.recentScans && (
            <div className="bg-[#111A31] border border-[#25304B] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-[#F8FAFF] font-heading">
                Recent Scans Log ({data.recentScans.length})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#A8B4D0]">
                  <thead className="border-b border-[#25304B] text-[11px] uppercase tracking-wider text-[#F8FAFF]">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Device</th>
                      <th className="py-2.5 px-3">Browser</th>
                      <th className="py-2.5 px-3">OS</th>
                      <th className="py-2.5 px-3">Referrer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#25304B]/50 font-mono">
                    {data.recentScans.map((s: any) => (
                      <tr key={s.id} className="hover:bg-[#0D1428]/50">
                        <td className="py-2.5 px-3 text-[#F8FAFF]">
                          {new Date(s.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 uppercase text-[#15D9F5]">
                          {s.device}
                        </td>
                        <td className="py-2.5 px-3">{s.browser}</td>
                        <td className="py-2.5 px-3">{s.os}</td>
                        <td className="py-2.5 px-3 truncate max-w-xs">{s.referrer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
