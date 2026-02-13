import { Injectable, inject, signal, effect } from '@angular/core';
import { StorageService } from './storage.service';

export interface AppSettings {
  timezone: string;
  timeFormat: '12' | '24';
  targetHours: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private storage = inject(StorageService);

  // Default to Istanbul and 24h as requested
  readonly settings = signal<AppSettings>({
    timezone: 'Europe/Istanbul',
    timeFormat: '24',
    targetHours: 8
  });

  constructor() {
    const saved = this.storage.getItem<AppSettings>('app-settings');
    if (saved) {
      this.settings.set({ ...this.settings(), ...saved });
    }

    // Auto-save effect
    effect(() => {
      this.storage.setItem('app-settings', this.settings());
    });
  }

  updateSettings(newSettings: Partial<AppSettings>) {
    this.settings.update(s => ({ ...s, ...newSettings }));
  }
}