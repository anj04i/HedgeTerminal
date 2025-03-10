import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PerformanceViewProps {
  filings: any[];
  quarterlyChanges: any[];
  stats: any;
  selectedFund: string;
}

export default function PerformanceView({
  filings,
  quarterlyChanges,
  stats,
  selectedFund,
}: PerformanceViewProps) {
  return (
    <>
      <div className="mb-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">Assets Under Management</h2>
          <p className="text-zinc-500 text-sm">
            Historical 13F filing data for {selectedFund}
          </p>
        </div>
        <div className="bg-black border border-zinc-900 rounded-lg p-6 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filings}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#27272a"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="quarter"
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                tickFormatter={(value) => `${(value / 1000).toLocaleString()}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()}`,
                  'AUM',
                ]}
                labelFormatter={(label) => `Quarter: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value_usd"
                name={selectedFund}
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAssets)"
                activeDot={{
                  r: 6,
                  fill: '#22c55e',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">Quarterly Performance</h2>
          <p className="text-zinc-500 text-sm">
            Quarter-over-quarter percentage changes
          </p>
        </div>
        <div className="bg-black border border-zinc-900 rounded-lg p-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={quarterlyChanges}
              margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid
                stroke="#27272a"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="quarter"
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
              />
              <YAxis
                stroke="#52525b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#27272a' }}
                tickFormatter={(value) => `${value}%`}
              />
              <ReferenceLine y={0} stroke="#27272a" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '4px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(value: string) => [`${value}%`, 'Change']}
                labelFormatter={(label) => `Quarter: ${label}`}
              />
              <defs>
                <linearGradient id="colorChange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                name="Change"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorChange)"
                activeDot={{
                  r: 6,
                  fill: '#ef4444',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6 pb-3">
            <CardDescription className="text-xs text-zinc-500 uppercase font-medium">
              MAXIMUM GROWTH
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-white">
              {stats.max_growth}%
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <p className="text-xs text-zinc-500">
              Highest quarter-over-quarter growth
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6 pb-3">
            <CardDescription className="text-xs text-zinc-500 uppercase font-medium">
              MAXIMUM DECLINE
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-white">
              {stats.max_decline}%
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <p className="text-xs text-zinc-500">
              Largest quarter-over-quarter decline
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6 pb-3">
            <CardDescription className="text-xs text-zinc-500 uppercase font-medium">
              GROWTH CONSISTENCY
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-white">
              {stats.growth_consistency}%
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <p className="text-xs text-zinc-500">
              Percentage of quarters with positive growth
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black border-zinc-900 shadow-none">
          <CardHeader className="p-6 pb-3">
            <CardDescription className="text-xs text-zinc-500 uppercase font-medium">
              TOTAL APPRECIATION
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-white">
              {stats.total_appreciation}%
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-0">
            <p className="text-xs text-zinc-500">
              Growth from first reported filing
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
