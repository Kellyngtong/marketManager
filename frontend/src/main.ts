import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { AppModule } from './app/app.module';

registerLocaleData(localeEs, 'es-ES');

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
