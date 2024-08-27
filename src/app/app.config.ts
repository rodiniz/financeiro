import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";

import { routes } from "./app.routes";
import {
  LucideAngularModule,
  FilePenLineIcon,
  Trash2Icon,
  ChartBarIcon,
  ChartPieIcon,
  BadgeEuroIcon,
  CaseUpperIcon,
} from "lucide-angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    importProvidersFrom(
      LucideAngularModule.pick({
        FilePenLineIcon,
        Trash2Icon,
        ChartBarIcon,
        ChartPieIcon,
        BadgeEuroIcon,
        CaseUpperIcon,
      })
    ),
  ],
};
