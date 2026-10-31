import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, AlertOctagon, Eye, Download, Image as ImageIcon, Video, Calendar, ArrowUpDown } from 'lucide-react';
import { DetectionResult, DetectionVerdict, MediaType } from '../../types/detection';
import { formatDate, formatFileSize, getVerdictTheme, getRiskBadgeColor } from '../../utils/formatters';
import { HistoryDetailModal } from './HistoryDetailModal';

interface DetectionHistoryProps {
  history: DetectionResult[];
  onSelectResult: (result: DetectionResult) => void;
}

export const DetectionHistory: React.FC<DetectionHistoryProps> = ({ history, onSelectResult }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'real' | 'fake' | 'images' | 'videos'>('all');
  const [inspectedRecord, setInspectedRecord] = useState<DetectionResult | null>(null);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Search match
      const matchesSearch = item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Filter match
      if (activeFilter === 'all') return true;
      if (activeFilter === 'real') return item.verdict === 'REAL';
      if (activeFilter === 'fake') return item.verdict === 'FAKE';
      if (activeFilter === 'images') return item.mediaType === 'image';
      if (activeFilter === 'videos') return item.mediaType === 'video';
      return true;
    });
  }, [history, searchQuery, activeFilter]);

  const filterTabs = [
    { id: 'all', label: 'All Analyses' },
    { id: 'real', label: 'Real' },
    { id: 'fake', label: 'Fake' },
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
  ];

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-guard-navy tracking-tight">
            Detection History
          </h2>
          <p className="text-sm text-guard-muted mt-1">
            Browse and inspect past media analyses, confidence metrics, and forensic artifacts
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-guard-slate bg-white px-3.5 py-2 rounded-2xl border border-guard-border shadow-sm">
          Total Logs: {history.length} Scans
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white shadow-soft mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-guard-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by filename or scan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-guard-border text-xs text-guard-navy placeholder:text-guard-muted focus:outline-none focus:border-pastel-rose focus:ring-1 focus:ring-pastel-rose shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-guard-navy text-white shadow-sm'
                  : 'bg-white/80 text-guard-slate hover:bg-white hover:text-guard-navy border border-guard-border/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* History Table / Grid */}
      {filteredHistory.length === 0 ? (
        <div className="rounded-3xl glass-card p-12 text-center border border-guard-border">
          <p className="text-base font-bold text-guard-navy">No analysis records found</p>
          <p className="text-xs text-guard-muted mt-1">Try adjusting your search query or active filter</p>
        </div>
      ) : (
        <div className="rounded-3xl glass-panel border border-white shadow-soft-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-guard-slate border-collapse">
              <thead>
                <tr className="bg-guard-softbg/80 border-b border-guard-border text-[11px] font-bold text-guard-muted uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Media Target</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Prediction</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Risk Level</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-guard-border/60">
                {filteredHistory.map((scan) => {
                  const theme = getVerdictTheme(scan.verdict);
                  const isReal = scan.verdict === 'REAL';

                  return (
                    <tr
                      key={scan.id}
                      className="hover:bg-white/90 transition-colors group cursor-pointer"
                      onClick={() => setInspectedRecord(scan)}
                    >
                      {/* Media Target with Thumbnail */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-guard-border relative">
                            <img
                              src={scan.previewUrl}
                              alt={scan.filename}
                              className="w-full h-full object-cover"
                            />
                            {scan.mediaType === 'video' && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Video className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-guard-navy block truncate max-w-[180px] sm:max-w-xs">
                              {scan.filename}
                            </span>
                            <span className="text-[10px] font-mono text-guard-muted">
                              {scan.id} • {formatFileSize(scan.fileSizeBytes)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Media Type */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono uppercase font-bold text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-guard-slate">
                          {scan.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          {scan.mediaType}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-guard-muted text-[11px]">
                        {formatDate(scan.timestamp)}
                      </td>

                      {/* Prediction Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl ${
                            isReal
                              ? 'bg-detect-real-bg text-detect-real border border-detect-real-border'
                              : 'bg-detect-fake-bg text-detect-fake border border-detect-fake-border'
                          }`}
                        >
                          {isReal ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                          {scan.verdict}
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-guard-navy text-xs">
                          {scan.confidence}%
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskBadgeColor(scan.riskLevel)}`}>
                          {scan.riskLevel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectedRecord(scan);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-guard-border hover:border-pastel-blue text-xs font-semibold text-guard-slate hover:text-guard-navy inline-flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <HistoryDetailModal
        result={inspectedRecord}
        onClose={() => setInspectedRecord(null)}
        onLoadIntoDetector={(res) => {
          onSelectResult(res);
          setInspectedRecord(null);
        }}
      />

    </section>
  );
};
