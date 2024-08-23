import { InjectionToken } from "@angular/core";

export const LocalStorageToken = new InjectionToken<Storage>("StorageToken", {
  factory() {
    return window.localStorage;
  },
});
