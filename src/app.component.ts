import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { TrackerService, WorkSession } from './services/tracker.service';
import { IdleService } from './services/idle.service';
import { SettingsService } from './services/settings.service';
import { StartModalComponent } from './components/start-modal.component';
import { IdleModalComponent } from './components/idle-modal.component';
import { SettingsModalComponent } from './components/settings-modal.component';
import { EditSessionModalComponent } from './components/edit-session-modal.component';
import { TimelineComponent } from './components/timeline.component';
import { SessionListComponent } from './components/session-list.component';
import { HistoryComponent } from './components/history.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe,
    StartModalComponent,
    IdleModalComponent,
    SettingsModalComponent,
    EditSessionModalComponent,
    TimelineComponent,
    SessionListComponent,
    HistoryComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  tracker = inject(TrackerService);
  idleService = inject(IdleService);
  settingsService = inject(SettingsService);
  
  t = this.settingsService.dictionary;
  
  showStartModal = signal(false);
  showSettingsModal = signal(false);
  editingSession = signal<WorkSession | null>(null);
  currentView = signal<'dashboard' | 'history'>('dashboard');

  todayDate = new Date();

  constructor() {
    // Register the Turkish locale data so that 'tr-TR' works in DatePipes
    registerLocaleData(localeTr, 'tr-TR');
  }

  openStartModal() {
    this.showStartModal.set(true);
  }

  onStartSession(data: {title: string, description: string, offset: number}) {
    this.tracker.startSession(data.title, data.description, data.offset);
  }

  onIdleResolved(action: 'resume' | 'stop' | 'discard') {
    switch (action) {
      case 'resume':
        break;
      case 'stop':
        this.tracker.stopSessionAtTime(this.idleService.lastActive());
        break;
      case 'discard':
        this.tracker.discardCurrentSession();
        break;
    }
    this.idleService.resetIdle();
  }

  onSaveSession(session: WorkSession) {
    this.tracker.updateSession(session);
    this.editingSession.set(null);
  }

  calculateProgress(): number {
    const totalHours = this.tracker.totalSecondsToday() / 3600;
    const target = this.settingsService.settings().targetHours || 8;
    return Math.min(100, Math.round((totalHours / target) * 100));
  }

  formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}