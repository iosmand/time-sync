import { Component, input, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkSession } from '../services/tracker.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6 transition-colors">
      <h3 class="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">{{ t().timelineTitle }}</h3>
      
      <!-- Removed overflow-hidden to allow tooltips to show -->
      <div class="relative h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg flex items-center transition-colors">
        <!-- Hour Markers -->
        @for (hour of [0, 6, 12, 18, 24]; track hour) {
          <div class="absolute h-full border-r border-zinc-200 dark:border-zinc-700 z-0 pointer-events-none" [style.left.%]="(hour / 24) * 100">
            @if (hour !== 24) {
              <span class="absolute bottom-1 left-1 text-[10px] text-zinc-400 dark:text-zinc-500 select-none">{{ hour }}:00</span>
            }
          </div>
        }

        <!-- Session Blocks -->
        @for (block of timelineBlocks(); track block.id) {
          <div class="absolute h-8 bg-primary-500 border border-primary-600/20 rounded-md shadow-sm z-10 hover:bg-primary-400 transition-colors cursor-help group"
               [style.left.%]="block.left"
               [style.width.%]="block.width">
            
            <!-- Tooltip -->
            <div class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 bg-zinc-900 dark:bg-zinc-800 text-white text-xs rounded-lg p-3 z-50 shadow-xl border border-zinc-700 dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-200">
              <div class="font-bold text-primary-400 mb-0.5">{{ block.title }}</div>
              <div class="text-zinc-300">{{ block.timeRange }}</div>
              <!-- Arrow -->
              <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800"></div>
            </div>
          </div>
        }
      </div>
      
      <!-- Stats footer -->
      <div class="mt-4 flex gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
          <span class="text-zinc-600 dark:text-zinc-400">{{ t().sessions }}</span>
        </div>
      </div>
    </div>
  `
})
export class TimelineComponent {
  sessions = input.required<WorkSession[]>();
  
  private settingsService = inject(SettingsService);
  private datePipe = inject(DatePipe);
  
  t = this.settingsService.dictionary;

  timelineBlocks = computed(() => {
    const settings = this.settingsService.settings();
    const format = settings.timeFormat === '24' ? 'HH:mm' : 'shortTime';
    const timezone = settings.timezone;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dayStartMs = startOfDay.getTime();
    const totalDayMs = 24 * 60 * 60 * 1000;

    return this.sessions().map(session => {
      const startRelative = Math.max(0, session.startTime - dayStartMs);
      const endRelative = session.endTime 
        ? session.endTime - dayStartMs 
        : Date.now() - dayStartMs;

      const left = (startRelative / totalDayMs) * 100;
      const width = ((endRelative - startRelative) / totalDayMs) * 100;

      const formattedStart = this.datePipe.transform(session.startTime, format, timezone);
      const formattedEnd = session.endTime 
          ? this.datePipe.transform(session.endTime, format, timezone) 
          : 'Now';

      return {
        id: session.id,
        left: Math.max(0, Math.min(100, left)),
        width: Math.max(0.5, Math.min(100 - left, width)),
        title: session.title,
        timeRange: `${formattedStart} - ${formattedEnd}`
      };
    });
  });
}