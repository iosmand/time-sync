import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
         (click)="close.emit()">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-white">Settings</h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          
          <!-- Target Hours -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Daily Hours</label>
            <input type="number" formControlName="targetHours" min="1" max="24"
                   class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
          </div>

          <!-- Timezone -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
            <select formControlName="timezone"
                    class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="Europe/Istanbul">Istanbul (Europe/Istanbul)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York (America/New_York)</option>
              <option value="Europe/London">London (Europe/London)</option>
              <option value="Asia/Tokyo">Tokyo (Asia/Tokyo)</option>
              <option value="Europe/Berlin">Berlin (Europe/Berlin)</option>
            </select>
          </div>

          <!-- Time Format -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time Format</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" formControlName="timeFormat" value="24" class="text-primary-600 focus:ring-primary-500">
                <span class="text-slate-700 dark:text-slate-300">24 Hour</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" formControlName="timeFormat" value="12" class="text-primary-600 focus:ring-primary-500">
                <span class="text-slate-700 dark:text-slate-300">12 Hour (AM/PM)</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" (click)="close.emit()"
                    class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              Close
            </button>
            <button type="submit" 
                    class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SettingsModalComponent {
  @Output() close = new EventEmitter<void>();
  
  private settingsService = inject(SettingsService);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    targetHours: [this.settingsService.settings().targetHours],
    timezone: [this.settingsService.settings().timezone],
    timeFormat: [this.settingsService.settings().timeFormat]
  });

  onSubmit() {
    this.settingsService.updateSettings({
      targetHours: this.form.value.targetHours!,
      timezone: this.form.value.timezone!,
      timeFormat: this.form.value.timeFormat as '12' | '24'
    });
    this.close.emit();
  }
}