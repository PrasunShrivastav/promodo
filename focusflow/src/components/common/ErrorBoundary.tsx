import React, { ErrorInfo, ReactNode } from 'react';
import { purgeAllIDBData, getStoredSessions, getStoredTasks, getStoredSettings } from '../../utils/idbStorage';
import { AlertOctagon, RefreshCw, Trash2, Download } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // @ts-ignore
  props: Props;
  // @ts-ignore
  state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = async () => {
    if (window.confirm('This will wipe all locally stored application data and reset to fresh state. Are you sure?')) {
      await purgeAllIDBData();
      window.location.reload();
    }
  };

  private handleExportRecoverable = async () => {
    try {
      const [tasks, sessions, settings] = await Promise.all([
        getStoredTasks().catch(() => []),
        getStoredSessions().catch(() => []),
        getStoredSettings().catch(() => null),
      ]);

      const backup = {
        exportDate: new Date().toISOString(),
        tasks,
        sessions,
        settings,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `chronofocus_recovery_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export recoverable data: ' + (err as Error).message);
    }
  };

  private handleRetry = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">
                The local data appears to be corrupted.
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                An unexpected system error occurred while reading or writing application state. You can try refreshing or exporting your data before resetting.
              </p>
              {this.state.error && (
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-rose-400 text-left overflow-x-auto max-h-32">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleRetry}
                className="w-full py-2.5 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-rose-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Loading</span>
              </button>

              <button
                onClick={this.handleExportRecoverable}
                className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Recoverable Data</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Application Data</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
