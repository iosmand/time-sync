import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { interval, Subscription } from 'rxjs';

export interface WorkSession {
  id: string;
  title: string;
  description?: string;
  startTime: number; // Timestamp
  endTime?: number; // Timestamp
  durationSeconds: number;
}

@Injectable({
  providedIn: 'root'
})
export class TrackerService {
  private storage = inject(StorageService);
  
  // Signals
  readonly sessions = signal<WorkSession[]>([]);
  readonly currentSession = signal<WorkSession | null>(null);
  readonly elapsedSeconds = signal(0);
  
  // Computed
  readonly isTracking = computed(() => !!this.currentSession());
  
  // Gets sessions for the "virtual" day based on local time logic (simplified for now to basic date check)
  // For strict timezone day boundaries, we would need to map timestamps to the target timezone's dates.
  readonly todaySessions = computed(() => {
    // Note: This simple filter uses the browser's local midnight. 
    // Ideally, we'd use a timezone library to find midnight in 'Europe/Istanbul', 
    // but for this scope, we filter by simple timestamp order for the list.
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return this.sessions()
      .filter(s => s.startTime >= startOfDay)
      .sort((a, b) => b.startTime - a.startTime);
  });
  
  readonly totalSecondsToday = computed(() => {
    return this.todaySessions().reduce((acc, curr) => acc + curr.durationSeconds, 0) + 
           (this.isTracking() ? this.elapsedSeconds() : 0);
  });

  private timerSub: Subscription | null = null;

  constructor() {
    // Load from storage
    const savedSessions = this.storage.getItem<WorkSession[]>('sessions');
    if (savedSessions) {
      this.sessions.set(savedSessions);
    }

    const activeSession = this.storage.getItem<WorkSession>('activeSession');
    if (activeSession) {
      this.resumeSession(activeSession);
    }
  }

  // Helper to get sessions within a specific time range
  getSessionsInRange(startMs: number, endMs: number): WorkSession[] {
    return this.sessions()
      .filter(s => s.startTime >= startMs && s.startTime < endMs)
      .sort((a, b) => b.startTime - a.startTime);
  }

  startSession(title: string, description: string, startOffsetMinutes: number = 0) {
    const now = Date.now();
    const startTime = now - (startOffsetMinutes * 60 * 1000);
    
    const newSession: WorkSession = {
      id: crypto.randomUUID(),
      title,
      description,
      startTime,
      durationSeconds: 0
    };

    this.currentSession.set(newSession);
    this.storage.setItem('activeSession', newSession);
    this.startTimer();
  }

  private resumeSession(session: WorkSession) {
    this.currentSession.set(session);
    this.startTimer();
  }

  stopSession() {
    const session = this.currentSession();
    if (!session) return;

    const completedSession: WorkSession = {
      ...session,
      endTime: Date.now(),
      durationSeconds: Math.floor((Date.now() - session.startTime) / 1000)
    };

    this.addSessionToHistory(completedSession);
    this.clearActiveSession();
  }

  discardCurrentSession() {
    this.clearActiveSession();
  }

  // Used by Idle Guard to stop at a specific time in the past
  stopSessionAtTime(timestamp: number) {
    const session = this.currentSession();
    if (!session) return;

    // If timestamp is before start, just discard
    if (timestamp < session.startTime) {
      this.discardCurrentSession();
      return;
    }

    const completedSession: WorkSession = {
      ...session,
      endTime: timestamp,
      durationSeconds: Math.floor((timestamp - session.startTime) / 1000)
    };

    this.addSessionToHistory(completedSession);
    this.clearActiveSession();
  }

  updateSession(updatedSession: WorkSession) {
    this.sessions.update(prev => 
      prev.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
    this.storage.setItem('sessions', this.sessions());
  }

  deleteSession(id: string) {
    this.sessions.update(prev => prev.filter(s => s.id !== id));
    this.storage.setItem('sessions', this.sessions());
  }

  importSessions(jsonContent: string) {
    try {
      const parsed = JSON.parse(jsonContent);
      if (Array.isArray(parsed)) {
        // Basic validation could go here
        // Merge strategy: Add new ones, avoid ID collisions if possible or just replace
        // Here we'll append and dedupe by ID if necessary, but simple replacement is requested usually.
        // Let's merge:
        
        const currentIds = new Set(this.sessions().map(s => s.id));
        const newSessions = parsed.filter((s: any) => s.id && s.startTime && !currentIds.has(s.id));
        
        this.sessions.update(prev => [...newSessions, ...prev].sort((a, b) => b.startTime - a.startTime));
        this.storage.setItem('sessions', this.sessions());
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }

  exportSessions(): string {
    return JSON.stringify(this.sessions(), null, 2);
  }

  private addSessionToHistory(session: WorkSession) {
    this.sessions.update(prev => [session, ...prev]);
    this.storage.setItem('sessions', this.sessions());
  }

  private clearActiveSession() {
    this.currentSession.set(null);
    this.elapsedSeconds.set(0);
    this.storage.removeItem('activeSession');
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = null;
    }
  }

  private startTimer() {
    if (this.timerSub) this.timerSub.unsubscribe();
    
    // Update immediately
    this.updateElapsed();

    this.timerSub = interval(1000).subscribe(() => {
      this.updateElapsed();
    });
  }

  private updateElapsed() {
    const session = this.currentSession();
    if (session) {
      const diff = Math.floor((Date.now() - session.startTime) / 1000);
      this.elapsedSeconds.set(diff);
    }
  }
}