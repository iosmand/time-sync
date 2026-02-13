import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'time-sync-';

  getItem<T>(key: string): T | null {
    const item = localStorage.getItem(this.PREFIX + key);
    return item ? JSON.parse(item) : null;
  }

  setItem(key: string, value: unknown): void {
    localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }
}