import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module.js';
import { AttachmentsModule } from './attachments/attachments.module.js';
import { ComponentTypesModule } from './component-types/component-types.module.js';
import { config } from './config.js';
import { DatabaseModule } from './database/database.module.js';
import { ManufacturersModule } from './manufacturers/manufacturers.module.js';
import { PickupSetsModule } from './pickup-sets/pickup-sets.module.js';
import { PickupsModule } from './pickups/pickups.module.js';
import { PotLayoutsModule } from './pot-layouts/pot-layouts.module.js';
import { StorageModule } from './storage/storage.module.js';
import { TrashModule } from './trash/trash.module.js';
import { VersionModule } from './version/version.module.js';
import { WiringDiagramsModule } from './wiring-diagrams/wiring-diagrams.module.js';
import { WiringPickupTypesModule } from './wiring-pickup-types/wiring-pickup-types.module.js';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    ManufacturersModule,
    ComponentTypesModule,
    PickupsModule,
    PickupSetsModule,
    WiringDiagramsModule,
    WiringPickupTypesModule,
    PotLayoutsModule,
    AttachmentsModule,
    VersionModule,
    TrashModule,
    StorageModule,
    // In production the API also serves the built Angular app.
    ...(config.serveWeb
      ? [
          ServeStaticModule.forRoot({
            rootPath: config.webDist,
            exclude: ['/api/{*path}'],
            serveStaticOptions: {
              setHeaders: (res, filePath) => {
                // Hashed bundles never change; everything else is revalidated on every load.
                const hashed = /-[A-Za-z0-9]{8}\.(js|css)$/.test(filePath);
                res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'no-cache');
              },
            },
          }),
        ]
      : []),
  ],
})
export class AppModule {}
