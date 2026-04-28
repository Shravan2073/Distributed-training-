import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import type { TrainingState } from '../../types';
import { generateLoss, generateAccuracy } from '../../data/mockData';
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Layers,
  Gauge,
  BarChart3,
} from 'lucide-react';

interface TrainingDashboardProps {
  training: TrainingState;
}

export default function TrainingDashboard({ training }: TrainingDashboardProps) {

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  // Build per-node chart data from epoch history
  const lossChartData = training.epochHistory.map((eh) => {
    const point: Record<string, number> = { epoch: eh.epoch };
    for (let r = 0; r < 4; r++) {
      point[`rank${r}`] = parseFloat(generateLoss(eh.epoch, r).toFixed(4));
    }
    point.global = parseFloat(eh.loss.toFixed(4));
    return point;
  });

  const accChartData = training.epochHistory.map((eh) => {
    const point: Record<string, number> = { epoch: eh.epoch };
    for (let r = 0; r < 4; r++) {
      point[`rank${r}`] = parseFloat(generateAccuracy(eh.epoch, r).toFixed(1));
    }
    point.global = parseFloat(eh.accuracy.toFixed(1));
    return point;
  });

  const throughputData = training.perNodeMetrics.map((m) => ({
    name: `Rank ${m.rank}`,
    throughput: m.throughput,
    rank: m.rank,
  }));

  const RANK_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  const GLOBAL_COLOR = '#34d399';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Training Dashboard
        </h1>
        <p className="text-sm text-surface-400 mt-1">
          Global and per-node training metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={<Layers size={18} />}
          label="Current Epoch"
          value={`${training.currentEpoch} / ${training.totalEpochs}`}
          color="text-accent-400"
        />
        <KpiCard
          icon={<TrendingDown size={18} />}
          label="Global Loss"
          value={training.globalLoss > 0 ? training.globalLoss.toFixed(4) : '—'}
          color="text-red-400"
        />
        <KpiCard
          icon={<TrendingUp size={18} />}
          label="Global Accuracy"
          value={training.globalAccuracy > 0 ? `${training.globalAccuracy.toFixed(1)}%` : '—'}
          color="text-emerald-400"
        />
        <KpiCard
          icon={<Clock size={18} />}
          label="Elapsed Time"
          value={formatTime(training.elapsedTime)}
          color="text-amber-400"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Loss Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Loss vs Epoch</span>
          </div>
          <div style={{ height: 280 }}>
            {lossChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lossChartData}>
                  <defs>
                    <linearGradient id="lossGlobalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GLOBAL_COLOR} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={GLOBAL_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="epoch"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,17,23,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                  <Area
                    type="monotone"
                    dataKey="global"
                    stroke={GLOBAL_COLOR}
                    strokeWidth={2.5}
                    fill="url(#lossGlobalGrad)"
                    name="Global"
                  />
                  {RANK_COLORS.map((color, i) => (
                    <Line
                      key={i}
                      type="monotone"
                      dataKey={`rank${i}`}
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="4 3"
                      name={`Rank ${i}`}
                      opacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Loss data will appear once training starts" />
            )}
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-sm font-semibold text-white">
              Accuracy vs Epoch
            </span>
          </div>
          <div style={{ height: 280 }}>
            {accChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={accChartData}>
                  <defs>
                    <linearGradient id="accGlobalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GLOBAL_COLOR} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={GLOBAL_COLOR} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="epoch"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,17,23,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                  <Area
                    type="monotone"
                    dataKey="global"
                    stroke={GLOBAL_COLOR}
                    strokeWidth={2.5}
                    fill="url(#accGlobalGrad)"
                    name="Global"
                  />
                  {RANK_COLORS.map((color, i) => (
                    <Line
                      key={i}
                      type="monotone"
                      dataKey={`rank${i}`}
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="4 3"
                      name={`Rank ${i}`}
                      opacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Accuracy data will appear once training starts" />
            )}
          </div>
        </div>
      </div>

      {/* Throughput Bar Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={16} className="text-accent-400" />
          <span className="text-sm font-semibold text-white">
            Per-Node Throughput
          </span>
          <span className="text-xs text-surface-500 ml-auto">
            samples/sec
          </span>
        </div>
        <div style={{ height: 200 }}>
          {throughputData.some((d) => d.throughput > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,17,23,0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar
                  dataKey="throughput"
                  radius={[4, 4, 0, 0]}
                  name="Throughput"
                >
                  {throughputData.map((_, index) => (
                    <BarChart3 key={index} />
                  ))}
                </Bar>
                {/* Custom coloring via cells */}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="Throughput data will appear once training starts" />
          )}
        </div>
      </div>

      {/* Per-Node Metrics Table */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-accent-400" />
          <span className="text-sm font-semibold text-white">
            Per-Node Metrics
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-surface-400 border-b border-surface-800">
                <th className="pb-3 pr-4 font-medium">Rank</th>
                <th className="pb-3 pr-4 font-medium">Loss</th>
                <th className="pb-3 pr-4 font-medium">Accuracy</th>
                <th className="pb-3 pr-4 font-medium">Throughput</th>
                <th className="pb-3 font-medium">Batches</th>
              </tr>
            </thead>
            <tbody className="text-surface-200">
              {training.perNodeMetrics.map((m) => (
                <tr
                  key={m.rank}
                  className="border-b border-surface-800/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: RANK_COLORS[m.rank] }}
                      />
                      <span className="font-medium">Rank {m.rank}</span>
                      {m.rank === 0 && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          MASTER
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs">
                    {m.loss > 0 ? m.loss.toFixed(4) : '—'}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs">
                    {m.accuracy > 0 ? `${m.accuracy.toFixed(1)}%` : '—'}
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs">
                    {m.throughput > 0 ? `${m.throughput} s/s` : '—'}
                  </td>
                  <td className="py-2.5 font-mono text-xs">
                    {m.batchesCompleted}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="glass-card p-4">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <span className="text-xs font-medium text-surface-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center text-surface-500 text-sm">
      {label}
    </div>
  );
}
