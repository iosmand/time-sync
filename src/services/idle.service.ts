import { Injectable, signal, OnDestroy } from '@angular/core';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { debounceTime, map, filter, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IdleService implements OnDestroy {
  // 10 minutes in ms = 600000
  // For testing convenience, you might want to lower this, but per requirements:
  private readonly IDLE_THRESHOLD = 600000; 

  readonly isIdle = signal(false);
  readonly lastActive = signal(Date.now());
  
  private subscription: Subscription;

  constructor() {
    const events$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'click'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'scroll')
    );

    // Stream that resets the idle timer on activity
    this.subscription = events$.pipe(
      tap(() => {
        if (this.isIdle()) {
          // If we were idle and moved, we don't auto-resume usually in this app logic,
          // because the user needs to decide what to do with the "lost" time via the modal.
          // However, we record the activity time.
        } else {
          this.lastActive.set(Date.now());
        }
      }),
      debounceTime(this.IDLE_THRESHOLD)
    ).subscribe(() => {
      if (!this.isIdle()) {
        this.isIdle.set(true);
      }
    });
  }

  resetIdle() {
    this.isIdle.set(false);
    this.lastActive.set(Date.now());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}