import { Component, EventEmitter, Output, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-idle-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-md transition-all">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-bounce-subtle transition-colors">
        
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-zinc-800 dark:text-white mb-2">{{ t().idleTitle }}</h2>
          <p class="text-zinc-600 dark:text-zinc-400 mb-8">
            {{ t().idleDesc }} <span class="font-semibold text-zinc-900 dark:text-white">{{ idleSinceTime() }}</span>.
          </p>

          <div class="grid grid-cols-1 gap-3">
            <button (click)="resolve.emit('resume')"
                    class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-2">
              <span>{{ t().idleResume }}</span>
            </button>
            
            <button (click)="resolve.emit('stop')"
                    class="w-full py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
              <span>{{ t().idleStop }}</span>
            </button>

            <button (click)="resolve.emit('discard')"
                    class="w-full py-3 px-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all text-sm">
              {{ t().idleDiscard }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes bounce-subtle {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-bounce-subtle {
      animation: bounce-subtle 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class IdleModalComponent {
  lastActive = input.required<number>();
  @Output() resolve = new EventEmitter<'resume' | 'stop' | 'discard'>();

  private settingsService = inject(SettingsService);
  t = this.settingsService.dictionary;

  idleSinceTime = computed(() => {
    return new Date(this.lastActive()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
}