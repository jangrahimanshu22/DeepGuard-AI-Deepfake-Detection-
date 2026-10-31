import React, { useState, useEffect } from 'react';
import {
  Key,
  Copy,
  Check,
  Trash2,
  Plus,
  Terminal,
  Code2,
  X,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ApiKeyItem } from '../../types/detection';
import { createApiKey, listApiKeys, revokeApiKey } from '../../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeSnippetTab, setActiveSnippetTab] = useState<'curl' | 'python' | 'node'>('curl');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadKeys();
      setCreatedSecret(null);
    }
  }, [isOpen]);

  const loadKeys = async () => {
    const list = await listApiKeys();
    setKeys(list);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const res = await createApiKey(newKeyName.trim());
      if (res.raw_key) {
        setCreatedSecret(res.raw_key);
      }
      setNewKeyName('');
      await loadKeys();
    } catch (err) {
      alert('Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this API key? Any applications using it will be blocked.')) return;
    await revokeApiKey(id);
    await loadKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  if (!isOpen) return null;

  const curlSnippet = `curl -X POST "http://127.0.0.1:8000/api/predict/image" \\
  -H "X-API-Key: ${createdSecret || 'YOUR_API_KEY'}" \\
  -F "file=@target_photo.jpg"`;

  const pythonSnippet = `import requests

url = "http://127.0.0.1:8000/api/predict/image"
headers = {"X-API-Key": "${createdSecret || 'YOUR_API_KEY'}"}
files = {"file": open("target_photo.jpg", "rb")}

response = requests.post(url, headers=headers, files=files)
print("Deepfake Verdict:", response.json()["prediction"])
print("Confidence:", response.json()["confidence"])`;

  const nodeSnippet = `const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const form = new FormData();
form.append('file', fs.createReadStream('target_photo.jpg'));

const res = await fetch('http://127.0.0.1:8000/api/predict/image', {
  method: 'POST',
  headers: {
    'X-API-Key': '${createdSecret || 'YOUR_API_KEY'}',
    ...form.getHeaders()
  },
  body: form
});
const data = await res.json();
console.log(data.prediction, data.confidence);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-guard-midnight/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-guard-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-guard-border flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pastel-blue/40 flex items-center justify-center text-guard-navy">
              <Key className="w-4 h-4 text-guard-navy" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-guard-navy">
                Developer API Access & Tokens
              </h3>
              <p className="text-xs text-guard-muted">
                Integrate DeepGuard AI forensic models directly into your CI/CD pipelines & KYC workflows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-200 flex items-center justify-center text-guard-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Secret Token Banner when newly created */}
          {createdSecret && (
            <div className="p-4 rounded-2xl bg-pastel-cyan/30 border border-pastel-cyan flex flex-col gap-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-guard-navy flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-guard-navy" />
                  Save Your Secret Key Now!
                </span>
                <button
                  onClick={() => copyToClipboard(createdSecret)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-guard-border text-xs font-bold text-guard-navy flex items-center gap-1 shadow-xs hover:bg-slate-50"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-detect-real" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-guard-slate">
                This token will never be displayed again. Store it securely in your server's environment variables.
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-guard-border font-mono text-xs text-guard-navy select-all break-all">
                {createdSecret}
              </div>
            </div>
          )}

          {/* Create Key Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Mobile KYC Engine / Staging Server"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-guard-border text-xs text-guard-navy focus:outline-none focus:ring-2 focus:ring-guard-navy/20"
            />
            <button
              type="submit"
              disabled={loading || !newKeyName.trim()}
              className="px-4 py-2.5 rounded-xl bg-guard-navy hover:bg-guard-slate disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              Generate API Key
            </button>
          </form>

          {/* Key List Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider">
              Active API Keys ({keys.length})
            </h4>
            {keys.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-guard-border text-center text-xs text-guard-muted">
                No active API keys found. Generate one above to access programmatic endpoints.
              </div>
            ) : (
              <div className="border border-guard-border rounded-2xl overflow-hidden divide-y divide-guard-border">
                {keys.map((k) => (
                  <div key={k.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-guard-navy">{k.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {k.key_prefix}
                        </span>
                      </div>
                      <div className="text-[10px] text-guard-muted mt-0.5">
                        Created: {new Date(k.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRevoke(k.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-detect-fake hover:bg-red-50 transition-colors"
                      title="Revoke API key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Integration Snippets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider">
                Code Snippets
              </h4>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveSnippetTab('curl')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    activeSnippetTab === 'curl' ? 'bg-guard-navy text-white' : 'text-guard-slate hover:bg-slate-100'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveSnippetTab('python')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    activeSnippetTab === 'python' ? 'bg-guard-navy text-white' : 'text-guard-slate hover:bg-slate-100'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveSnippetTab('node')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    activeSnippetTab === 'node' ? 'bg-guard-navy text-white' : 'text-guard-slate hover:bg-slate-100'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto shadow-inner group">
              <button
                onClick={() => copyToClipboard(activeSnippetTab === 'curl' ? curlSnippet : activeSnippetTab === 'python' ? pythonSnippet : nodeSnippet)}
                className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
              <pre className="pr-12">
                {activeSnippetTab === 'curl' ? curlSnippet : activeSnippetTab === 'python' ? pythonSnippet : nodeSnippet}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
