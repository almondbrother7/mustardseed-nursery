import { ConfigService } from './services/config.service';

export function loadCatalogConfig(configService: ConfigService) {
  return () => configService.getCatalogConfig()
    .catch(err => {
      console.error('Failed to load catalog config', err);
      return null;
    });
}