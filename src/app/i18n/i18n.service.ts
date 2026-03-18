import { Injectable, signal } from '@angular/core';
import { translations, Language } from './translations';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage = signal<Language>('pt');
  
  readonly language = this.currentLanguage.asReadonly();
  
  constructor() {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'pt')) {
      this.currentLanguage.set(savedLang);
    }
  }
  
  setLanguage(lang: Language) {
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
  }
  
  t(key: string): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage()];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }
}
