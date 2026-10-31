import { DetectionVerdict, RiskLevel } from '../types/detection';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getVerdictTheme(verdict: DetectionVerdict) {
  switch (verdict) {
    case 'REAL':
      return {
        text: 'text-detect-real',
        bg: 'bg-detect-real-bg',
        border: 'border-detect-real-border',
        badge: 'bg-[#2E8B70] text-white',
        stroke: '#2E8B70',
        label: 'REAL',
        title: 'Authentic Media',
        description: 'High confidence that this media is authentic and unaltered.',
      };
    case 'FAKE':
      return {
        text: 'text-detect-fake',
        bg: 'bg-detect-fake-bg',
        border: 'border-detect-fake-border',
        badge: 'bg-[#D94F70] text-white',
        stroke: '#D94F70',
        label: 'FAKE',
        title: 'Manipulated Content',
        description: 'Signs of AI-generated or manipulated content were detected.',
      };
    case 'WARNING':
    default:
      return {
        text: 'text-detect-warning',
        bg: 'bg-detect-warning-bg',
        border: 'border-detect-warning-border',
        badge: 'bg-[#C58B2B] text-white',
        stroke: '#C58B2B',
        label: 'WARNING',
        title: 'Inconclusive / Low Quality',
        description: 'Ambiguous artifact density detected. Manual review advised.',
      };
  }
}

export function getRiskBadgeColor(level: RiskLevel): string {
  switch (level) {
    case 'Low':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'High':
      return 'bg-rose-50 text-rose-700 border-rose-200';
  }
}
