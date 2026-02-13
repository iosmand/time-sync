import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WorkSession } from '../services/tracker.service';

@Component({
  selector: 'app-edit-session-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all"
         (click)="close.emit()">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
           (click)="$event.stopPropagation()">
        
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <h2 class="text-lg font-semibold text-slate-800 dark:text-white">Edit Session</h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-4">
          
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input type="text" formControlName="title" 
                   class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea formControlName="description" rows="3"
                      class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"></textarea>
          </div>

          <!-- Time Editing (Simplified to datetime-local inputs) -->
          <div class="grid grid-cols-2 gap-4">
            <div>
               <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start</label>
               <input type="datetime-local" formControlName="start" step="1"
                      class="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs">
            </div>
            <div>
               <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End</label>
               <input type="datetime-local" formControlName="end" step="1"
                      class="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs">
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="close.emit()"
                    class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid"
                    class="px-6 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm">
              Save Changes
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
  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    start: ['', Validators.required],
    end: ['', Validators.required]
  });

  ngOnInit() {
    // Format dates for datetime-local input (YYYY-MM-DDThh:mm:ss)
    // Note: This uses local time of browser. Dealing with timezone aware editing in input[type=datetime-local] is tricky.
    // For this applet, we assume the user edits in their local system time which is what the browser inputs expect.
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