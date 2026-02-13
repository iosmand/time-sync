import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-start-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm transition-all"
         (click)="close.emit()">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
          <h2 class="text-lg font-semibold text-zinc-800 dark:text-white">{{ t().startModalTitle }}</h2>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{{ t().taskTitle }} <span class="text-red-500">*</span></label>
            <input type="text" formControlName="title" 
                   class="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                   [placeholder]="t().taskPlaceholder" autofocus>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{{ t().description }}</label>
            <textarea formControlName="description" rows="3"
                      class="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      [placeholder]="t().descPlaceholder"></textarea>
          </div>

          <!-- Retroactive Start -->
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{{ t().startedEarlier }}</label>
            <div class="flex items-center gap-3">
              <input type="number" formControlName="offsetMinutes" min="0" max="180"
                     class="w-24 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors">
              <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ t().minutesAgo }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="close.emit()"
                    class="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
              {{ t().cancel }}
            </button>
            <button type="submit" [disabled]="form.invalid"
                    class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {{ t().startTimer }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class StartModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() start = new EventEmitter<{title: string, description: string, offset: number}>();

  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  t = this.settingsService.dictionary;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    offsetMinutes: [0, [Validators.min(0), Validators.max(180)]]
  });

  onSubmit() {
    if (this.form.valid) {
      this.start.emit({
        title: this.form.value.title!,
        description: this.form.value.description || '',
        offset: this.form.value.offsetMinutes || 0
      });
      this.close.emit();
    }
  }
}