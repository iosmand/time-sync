import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WorkSession } from '../services/tracker.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-edit-session-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm transition-all"
         (click)="close.emit()">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <div class="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
          <h2 class="text-lg font-semibold text-zinc-800 dark:text-white">{{ t().editSession }}</h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          
          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{{ t().taskTitle }}</label>
            <input type="text" formControlName="title" 
                   class="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{{ t().description }}</label>
            <textarea formControlName="description" rows="3"
                      class="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"></textarea>
          </div>

          <!-- Time Editing -->
          <div class="grid grid-cols-2 gap-4">
            <div>
               <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Start</label>
               <input type="datetime-local" formControlName="start" step="1"
                      class="w-full px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs">
            </div>
            <div>
               <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">End</label>
               <input type="datetime-local" formControlName="end" step="1"
                      class="w-full px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white text-xs">
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="close.emit()"
                    class="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
              {{ t().cancel }}
            </button>
            <button type="submit" [disabled]="form.invalid"
                    class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">
              {{ t().saveChanges }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditSessionModalComponent implements OnInit {
  @Input({ required: true }) session!: WorkSession;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<WorkSession>();

  private fb = inject(FormBuilder);
  private settingsService = inject(SettingsService);
  t = this.settingsService.dictionary;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    start: ['', Validators.required],
    end: ['', Validators.required]
  });

  ngOnInit() {
    const toInputString = (ts: number) => {
        const d = new Date(ts);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    this.form.patchValue({
      title: this.session.title,
      description: this.session.description,
      start: toInputString(this.session.startTime),
      end: this.session.endTime ? toInputString(this.session.endTime) : ''
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const val = this.form.value;
      const startTime = new Date(val.start!).getTime();
      const endTime = new Date(val.end!).getTime();
      
      this.save.emit({
        ...this.session,
        title: val.title!,
        description: val.description || '',
        startTime,
        endTime,
        durationSeconds: Math.floor((endTime - startTime) / 1000)
      });
      this.close.emit();
    }
  }
}