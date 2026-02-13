import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkSession, TrackerService } from '../services/tracker.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors">
      <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50">
        <div class="flex items-center gap-3">
            <h3 class="font-semibold text-zinc-800 dark:text-zinc-200">{{ t().historyTitle }}</h3>
            <span class="text-xs font-medium px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full">{{ sessions().length }}</span>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-2">
            <button (click)="fileInput.click()" class="p-2 text-zinc-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Import JSON">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
            </button>
            <input #fileInput type="file" accept=".json" class="hidden" (change)="onFileSelected($event)">

            <button (click)="onExport()" class="p-2 text-zinc-500 hover:text-primary-600 dark:text-zinc-400 dark:hover:text-primary-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors" title="Export JSON">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto">
        @if (sessions().length === 0) {
          <div class="p-8 text-center text-zinc-400 dark:text-zinc-500">
            <p>{{ t().noSessions }}</p>
          </div>
        } @else {
          <table class="w-full text-left text-sm">
            <thead class="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
              <tr>
                <th class="px-6 py-3">{{ t().task }}</th>
                <th class="px-6 py-3">{{ t().time }}</th>
                <th class="px-6 py-3 text-right">{{ t().duration }}</th>
                <th class="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800">
              @for (session of sessions(); track session.id) {
                <tr class="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="font-medium text-zinc-800 dark:text-zinc-200">{{ session.title }}</div>
                    @if (session.description) {
                      <div class="text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-[200px]">{{ session.description }}</div>
                    }
                  </td>
                  <td class="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {{ session.startTime | date:dateFormat():settings().timezone }}
                  </td>
                  <td class="px-6 py-4 text-right font-mono text-zinc-700 dark:text-zinc-300">
                    {{ formatDuration(session.durationSeconds) }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button (click)="editSession.emit(session)" class="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                        <button (click)="onDelete(session.id)" class="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class SessionListComponent {
  sessions = input.required<WorkSession[]>();
  editSession = output<WorkSession>();
  
  private tracker = inject(TrackerService);
  private settingsService = inject(SettingsService);
  
  settings = this.settingsService.settings;
  t = this.settingsService.dictionary;
  dateFormat = computed(() => this.settings().timeFormat === '24' ? 'HH:mm' : 'shortTime');

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  onDelete(id: string) {
    if (confirm(this.t().deleteConfirm)) {
        this.tracker.deleteSession(id);
    }
  }

  onExport() {
    const json = this.tracker.exportSessions();
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-sync-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const success = this.tracker.importSessions(e.target.result);
        if (success) {
            alert(this.t().importSuccess);
        } else {
            alert(this.t().importFail);
        }
        event.target.value = ''; // reset
      };
      reader.readAsText(file);
    }
  }
}