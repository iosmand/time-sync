import { Injectable, inject, signal, effect, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface AppSettings {
  timezone: string;
  timeFormat: '12' | '24';
  targetHours: number;
  language: 'en' | 'tr';
}

const DICTIONARY = {
  en: {
    appTitle: 'WorkTime',
    navDashboard: 'Dashboard',
    navCalendar: 'Calendar',
    readyTitle: 'Ready to work?',
    readyDesc: 'Track your focus blocks and build a timeline of your productivity.',
    focusActive: 'Focus Mode Active',
    startNewSession: 'Start New Session',
    stopSession: 'Stop Session',
    totalTime: 'Total Time Today',
    dailyGoal: 'Daily Goal',
    sessions: 'Sessions',
    timelineTitle: 'Today\'s Timeline',
    historyTitle: 'Session History',
    noSessions: 'No completed sessions today.',
    task: 'Task',
    time: 'Time',
    duration: 'Duration',
    startModalTitle: 'Start New Session',
    taskTitle: 'Task Title',
    taskPlaceholder: 'What are you working on?',
    description: 'Description',
    descPlaceholder: 'Add details (optional)',
    startedEarlier: 'Did you start earlier?',
    minutesAgo: 'minutes ago',
    cancel: 'Cancel',
    startTimer: 'Start Timer',
    idleTitle: 'Are you still there?',
    idleDesc: 'We noticed you haven\'t been active since',
    idleResume: 'I was working (Keep Time)',
    idleStop: 'I stopped working (Cut Time)',
    idleDiscard: 'Discard this session',
    settingsTitle: 'Settings',
    targetHours: 'Target Daily Hours',
    timezone: 'Timezone',
    timeFormat: 'Time Format',
    language: 'Language',
    savePrefs: 'Save Preferences',
    close: 'Close',
    year: 'Year',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    today: 'Today',
    editSession: 'Edit Session',
    saveChanges: 'Save Changes',
    deleteConfirm: 'Are you sure you want to delete this session?',
    importSuccess: 'Sessions imported successfully.',
    importFail: 'Failed to import. Invalid JSON format.'
  },
  tr: {
    appTitle: 'WorkTime',
    navDashboard: 'Panel',
    navCalendar: 'Takvim',
    readyTitle: 'Çalışmaya hazır mısın?',
    readyDesc: 'Odaklanma sürelerini takip et ve üretkenlik zaman çizelgeni oluştur.',
    focusActive: 'Odak Modu Aktif',
    startNewSession: 'Yeni Oturum Başlat',
    stopSession: 'Oturumu Bitir',
    totalTime: 'Bugünkü Toplam Süre',
    dailyGoal: 'Günlük Hedef',
    sessions: 'Oturumlar',
    timelineTitle: 'Bugünün Zaman Çizelgesi',
    historyTitle: 'Oturum Geçmişi',
    noSessions: 'Bugün tamamlanmış oturum yok.',
    task: 'Görev',
    time: 'Saat',
    duration: 'Süre',
    startModalTitle: 'Yeni Oturum Başlat',
    taskTitle: 'Görev Başlığı',
    taskPlaceholder: 'Ne üzerinde çalışıyorsun?',
    description: 'Açıklama',
    descPlaceholder: 'Detay ekle (isteğe bağlı)',
    startedEarlier: 'Daha önce mi başladın?',
    minutesAgo: 'dakika önce',
    cancel: 'İptal',
    startTimer: 'Başlat',
    idleTitle: 'Hâlâ orada mısın?',
    idleDesc: 'Şu saatten beri aktif olmadığınızı fark ettik:',
    idleResume: 'Çalışıyordum (Süreyi Koru)',
    idleStop: 'Çalışmayı bıraktım (Süreyi Kes)',
    idleDiscard: 'Bu oturumu sil',
    settingsTitle: 'Ayarlar',
    targetHours: 'Günlük Hedef Saat',
    timezone: 'Zaman Dilimi',
    timeFormat: 'Zaman Biçimi',
    language: 'Dil',
    savePrefs: 'Tercihleri Kaydet',
    close: 'Kapat',
    year: 'Yıl',
    month: 'Ay',
    week: 'Hafta',
    day: 'Gün',
    today: 'Bugün',
    editSession: 'Oturumu Düzenle',
    saveChanges: 'Değişiklikleri Kaydet',
    deleteConfirm: 'Bu oturumu silmek istediğinize emin misiniz?',
    importSuccess: 'Oturumlar başarıyla içe aktarıldı.',
    importFail: 'İçe aktarma başarısız. Geçersiz JSON formatı.'
  }
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private storage = inject(StorageService);

  readonly settings = signal<AppSettings>({
    timezone: 'Europe/Istanbul',
    timeFormat: '24',
    targetHours: 8,
    language: 'en'
  });

  readonly dictionary = computed(() => DICTIONARY[this.settings().language]);

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

  // Helper to get locale string for Dates (e.g. 'tr-TR' or 'en-US')
  getLocale(): string {
    return this.settings().language === 'tr' ? 'tr-TR' : 'en-US';
  }
}