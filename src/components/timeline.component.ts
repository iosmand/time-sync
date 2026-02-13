import { Component, input, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkSession } from '../services/tracker.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe], // Inject DatePipe for manual transformation
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors">
      <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Today's Timeline</h3>
      
      <div class="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center transition-colors">
        <!-- Hour Markers -->
        @for (hour of [0, 6, 12, 18, 24]; track hour) {
          <div class="absolute h-full border-r border-slate-200 dark:border-slate-700 z-0" [style.left.%]="(hour / 24) * 100">
            <span class="absolute bottom-1 left-1 text-[10px] text-slate-400 dark:text-slate-500">{{ hour }}:00</span>
          </div>
        }

        <!-- Session Blocks -->
        @for (block of timelineBlocks(); track block.id) {
          <div class="absolute h-8 bg-primary-500 rounded-md shadow-sm z-10 hover:bg-primary-600 transition-colors cursor-help group"
               [style.left.%]="block.left"
               [style.width.%]="block.width">
            
            <!-- Tooltip -->
            <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded p-2 z-20 pointer-events-none shadow-lg">
              <div class="font-bold">{{ block.title }}</div>
              <div class="text-slate-300">{{ block.timeRange }}</div>
            </div>
          </div>
        }
      </div>
      
      <!-- Stats footer -->
      <div class="mt-4 flex gap-6 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
          <span class="text-slate-600 dark:text-slate-400">Work Sessions</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full"></div>
          <span class="text-slate-600 dark:text-slate-400">Idle</span>
        </div>
      </div>
    </div>
  `
})
export class TimelineComponent {
  sessions = input.required<WorkSession[]>();
  
  private settingsService = inject(SettingsService);
  private datePipe = inject(DatePipe);

  timelineBlocks = computed(() => {
    const settings = this.settingsService.settings();
    const format = settings.timeFormat === '24' ? 'HH:mm' : 'shortTime';
    const timezone = settings.timezone;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const dayStartMs = startOfDay.getTime();
    const totalDayMs = 24 * 60 * 60 * 1000;

    return this.sessions().map(session => {
      // Calculate position relative to start of day
      const startRelative = Math.max(0, session.startTime - dayStartMs);
      const endRelative = session.endTime 
        ? session.endTime - dayStartMs 
        : Date.now() - dayStartMs; // Active session extends to now

      const left = (startRelative / totalDayMs) * 100;
      const width = ((endRelative - startRelative) / totalDayMs) * 100;

      const formattedStart = this.datePipe.transform(session.startTime, format, timezone);
      const formattedEnd = session.endTime 
          ? this.datePipe.transform(session.endTime, format, timezone) 
          : 'Now';

      return {
        id: session.id,
        left: Math.max(0, Math.min(100, left)),
        width: Math.max(0.5, Math.min(100 - left, width)), // Min width for visibility
        title: session.title,
        timeRange: `${formattedStart} - ${formattedEnd}`
      };
    });
  });
}