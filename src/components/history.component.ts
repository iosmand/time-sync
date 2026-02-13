import { Component, computed, signal, inject, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TrackerService, WorkSession } from '../services/tracker.service';
import { SessionListComponent } from './session-list.component';
import { SettingsService } from '../services/settings.service';

type ViewMode = 'year' | 'month' | 'week' | 'day';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, SessionListComponent, DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Toolbar -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
        
        <!-- Navigation Controls -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button (click)="changeDate(-1)" class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all text-slate-600 dark:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <div class="px-4 min-w-[140px] text-center font-semibold text-slate-800 dark:text-white select-none">
            {{ viewLabel() }}
          </div>

          <button (click)="changeDate(1)" class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-all text-slate-600 dark:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Mode Switcher -->
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button (click)="setViewMode('year')" 
                  [class]="viewMode() === 'year' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  class="px-3 py-1.5 rounded-md text-sm font-medium transition-all">Year</button>
          <button (click)="setViewMode('month')"
                  [class]="viewMode() === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  class="px-3 py-1.5 rounded-md text-sm font-medium transition-all">Month</button>
          <button (click)="setViewMode('week')"
                  [class]="viewMode() === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  class="px-3 py-1.5 rounded-md text-sm font-medium transition-all">Week</button>
          <button (click)="setViewMode('day')"
                  [class]="viewMode() === 'day' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
                  class="px-3 py-1.5 rounded-md text-sm font-medium transition-all">Day</button>
        </div>
        
        <button (click)="jumpToToday()" class="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
          Today
        </button>
      </div>

      <!-- Views -->
      @if (viewMode() === 'month') {
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          <div class="grid grid-cols-7 gap-px text-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div class="grid grid-cols-7 gap-1">
             @for (day of calendarDays(); track day.date) {
               <div (click)="selectDay(day.date)"
                    [class.bg-slate-50]="!day.isCurrentMonth && !isDarkMode"
                    [class.dark:bg-slate-800]="!day.isCurrentMonth && isDarkMode"
                    [class.border-primary-500]="isToday(day.date)"
                    class="relative h-24 p-2 border border-slate-100 dark:border-slate-800 rounded-lg cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors flex flex-col justify-between group">
                  
                  <div class="flex justify-between items-start">
                    <span class="text-sm font-medium" [class.text-slate-400]="!day.isCurrentMonth" [class.text-primary-600]="isToday(day.date)">
                      {{ day.dayNum }}
                    </span>
                    @if (day.totalSeconds > 0) {
                      <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    }
                  </div>

                  @if (day.totalSeconds > 0) {
                    <div class="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 rounded px-1.5 py-0.5 self-start">
                      {{ formatDurationShort(day.totalSeconds) }}
                    </div>
                  }
               </div>
             }
          </div>
        </div>
      }

      @if (viewMode() === 'year') {
         <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
               @for (month of yearMonths(); track month.index) {
                 <div (click)="selectMonth(month.index)"
                      class="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer transition-colors text-center">
                    <div class="font-semibold text-slate-800 dark:text-white mb-2">{{ month.name }}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400">
                        @if(month.totalSeconds > 0) {
                            <span class="text-emerald-600 dark:text-emerald-400 font-mono">{{ formatDurationShort(month.totalSeconds) }}</span>
                        } @else {
                            -
                        }
                    </div>
                 </div>
               }
            </div>
         </div>
      }

      @if (viewMode() === 'week') {
         <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div class="grid grid-cols-7 gap-2">
                @for (day of weekDays(); track day.date) {
                    <div (click)="selectDay(day.date)"
                         class="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer transition-colors text-center"
                         [class.bg-primary-50]="isSelectedDate(day.date)"
                         [class.dark:bg-primary-900]="isSelectedDate(day.date) && isDarkMode">
                        <div class="text-xs uppercase text-slate-500 mb-1">{{ day.name }}</div>
                        <div class="text-lg font-bold text-slate-800 dark:text-white mb-2">{{ day.dayNum }}</div>
                         @if (day.totalSeconds > 0) {
                            <div class="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded py-1">
                                {{ formatDurationShort(day.totalSeconds) }}
                            </div>
                         }
                    </div>
                }
            </div>
         </div>
      }

      <!-- List (Visible in Day View and Week View below the grid) -->
      @if (viewMode() === 'day' || viewMode() === 'week') {
         <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div class="mb-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                Sessions for {{ currentDate() | date:'fullDate' }}
             </div>
             <app-session-list [sessions]="currentDaySessions()" (editSession)="editSession.emit($event)"></app-session-list>
         </div>
      }
    </div>
  `
})
export class HistoryComponent {
  editSession = output<WorkSession>();
  
  private tracker = inject(TrackerService);
  private settingsService = inject(SettingsService);

  viewMode = signal<ViewMode>('month');
  currentDate = signal<Date>(new Date());

  // Helper for class bindings
  get isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  viewLabel = computed(() => {
    const d = this.currentDate();
    const mode = this.viewMode();
    if (mode === 'year') return d.getFullYear().toString();
    if (mode === 'month') return d.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (mode === 'week') {
        const start = this.getStartOfWeek(d);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    return d.toLocaleDateString();
  });

  // Data Selectors
  
  // For Day View (or detailed list below week)
  currentDaySessions = computed(() => {
    const d = this.currentDate();
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86400000;
    return this.tracker.getSessionsInRange(start, end);
  });

  // For Month Grid
  calendarDays = computed(() => {
     if (this.viewMode() !== 'month') return [];
     
     const d = this.currentDate();
     const year = d.getFullYear();
     const month = d.getMonth();
     
     const firstDayOfMonth = new Date(year, month, 1);
     const lastDayOfMonth = new Date(year, month + 1, 0);
     
     const days = [];
     
     // Pad start
     const startPadding = firstDayOfMonth.getDay(); // 0 = Sun
     for (let i = startPadding; i > 0; i--) {
        const date = new Date(year, month, 1 - i);
        days.push(this.createDayData(date, false));
     }
     
     // Days of month
     for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(year, month, i);
        days.push(this.createDayData(date, true));
     }

     // Pad end (to 35 or 42 cells)
     const remaining = 42 - days.length;
     for (let i = 1; i <= remaining; i++) {
        const date = new Date(year, month + 1, i);
        days.push(this.createDayData(date, false));
     }
     
     return days;
  });

  // For Year View
  yearMonths = computed(() => {
    if (this.viewMode() !== 'year') return [];
    const year = this.currentDate().getFullYear();
    const months = [];
    
    for (let i = 0; i < 12; i++) {
        const start = new Date(year, i, 1).getTime();
        const end = new Date(year, i + 1, 0, 23, 59, 59).getTime();
        const sessions = this.tracker.getSessionsInRange(start, end);
        const total = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
        months.push({
            index: i,
            name: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
            totalSeconds: total
        });
    }
    return months;
  });

  // For Week View
  weekDays = computed(() => {
    if (this.viewMode() !== 'week') return [];
    const d = this.currentDate();
    const start = this.getStartOfWeek(d);
    const days = [];
    for(let i=0; i<7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        days.push({
            ...this.createDayData(date, true),
            name: date.toLocaleString('default', { weekday: 'short' })
        });
    }
    return days;
  });

  private createDayData(date: Date, isCurrentMonth: boolean) {
     const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
     const end = start + 86400000;
     const sessions = this.tracker.getSessionsInRange(start, end);
     const total = sessions.reduce((acc, s) => acc + s.durationSeconds, 0);
     
     return {
        date,
        dayNum: date.getDate(),
        isCurrentMonth,
        totalSeconds: total
     };
  }

  // Actions
  
  setViewMode(mode: ViewMode) {
    this.viewMode.set(mode);
  }

  changeDate(delta: number) {
    const mode = this.viewMode();
    const d = new Date(this.currentDate());
    
    if (mode === 'year') d.setFullYear(d.getFullYear() + delta);
    else if (mode === 'month') d.setMonth(d.getMonth() + delta);
    else if (mode === 'week') d.setDate(d.getDate() + (delta * 7));
    else if (mode === 'day') d.setDate(d.getDate() + delta);
    
    this.currentDate.set(d);
  }

  jumpToToday() {
    this.currentDate.set(new Date());
    if (this.viewMode() === 'year') { /* stay */ }
    else this.viewMode.set('day'); // usually jump to day view
  }

  selectDay(date: Date) {
    this.currentDate.set(date);
    this.viewMode.set('day');
  }

  selectMonth(monthIndex: number) {
    const d = new Date(this.currentDate());
    d.setMonth(monthIndex);
    this.currentDate.set(d);
    this.viewMode.set('month');
  }

  isSelectedDate(date: Date) {
    const cur = this.currentDate();
    return date.getDate() === cur.getDate() && 
           date.getMonth() === cur.getMonth() && 
           date.getFullYear() === cur.getFullYear();
  }

  isToday(date: Date) {
    const now = new Date();
    return date.getDate() === now.getDate() && 
           date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  }

  formatDurationShort(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  private getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
}