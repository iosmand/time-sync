import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-start-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all"
         (click)="close.emit()">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-white">Start New Session</h2>
        </div>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title <span class="text-red-500">*</span></label>
            <input type="text" formControlName="title" 
                   class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                   placeholder="What are you working on?" autofocus>
            @if (form.get('title')?.touched && form.get('title')?.invalid) {
              <p class="mt-1 text-xs text-red-500">Title must be at least 3 characters.</p>
            }
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea formControlName="description" rows="3"
                      class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Add details (optional)"></textarea>
          </div>

          <!-- Retroactive Start -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Did you start earlier?</label>
            <div class="flex items-center gap-3">
              <input type="number" formControlName="offsetMinutes" min="0" max="180"
                     class="w-24 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors">
              <span class="text-sm text-slate-500 dark:text-slate-400">minutes ago</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="close.emit()"
                    class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid"
                    class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Start Timer
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

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    offsetMinutes: [0, [Validators.min(0), Validators.max(180)]] // Max 3 hours back
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