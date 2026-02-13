import { Component, EventEmitter, Output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
         (click)="close.emit()">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
          <h2 class="text-lg font-semibold text-zinc-800 dark:text-white">{{ t().settingsTitle }}</h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          
          <!-- Language -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{{ t().language }}</label>
            <div class="grid grid-cols-2 gap-3">
               <label class="flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all"
                      [class]="form.value.language === 'en' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'">
                  <input type="radio" formControlName="language" value="en" class="hidden">
                  <span class="font-medium">English</span>
               </label>
               <label class="flex items-center justify-center p-3 border rounded-xl cursor-pointer transition-all"
                      [class]="form.value.language === 'tr' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'">
                  <input type="radio" formControlName="language" value="tr" class="hidden">
                  <span class="font-medium">Türkçe</span>
               </label>
            </div>
          </div>

          <!-- Target Hours -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{{ t().targetHours }}</label>
            <input type="number" formControlName="targetHours" min="1" max="24"
                   class="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
          </div>

          <!-- Timezone -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{{ t().timezone }}</label>
            <select formControlName="timezone"
                    class="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
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
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">{{ t().timeFormat }}</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" formControlName="timeFormat" value="24" class="text-primary-600 focus:ring-primary-500">
                <span class="text-zinc-700 dark:text-zinc-300">24 Hour</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" formControlName="timeFormat" value="12" class="text-primary-600 focus:ring-primary-500">
                <span class="text-zinc-700 dark:text-zinc-300">12 Hour (AM/PM)</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button type="button" (click)="close.emit()"
                    class="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
              {{ t().close }}
            </button>
            <button type="submit" 
                    class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">
              {{ t().savePrefs }}
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
  
  t = this.settingsService.dictionary;

  form = this.fb.group({
    targetHours: [this.settingsService.settings().targetHours],
    timezone: [this.settingsService.settings().timezone],
    timeFormat: [this.settingsService.settings().timeFormat],
    language: [this.settingsService.settings().language]
  });

  onSubmit() {
    this.settingsService.updateSettings({
      targetHours: this.form.value.targetHours!,
      timezone: this.form.value.timezone!,
      timeFormat: this.form.value.timeFormat as '12' | '24',
      language: this.form.value.language as 'en' | 'tr'
    });
    this.close.emit();
  }
}