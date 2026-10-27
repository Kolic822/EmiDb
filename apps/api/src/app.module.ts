import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AttachmentsModule } from './attachments/attachments.module.js';
import { ComponentTypesModule } from './component-types/component-types.module.js';
import { config } from './config.js';
import { DatabaseModule } from './database/database.module.js';
import { ManufacturersModule } from './manufacturers/manufacturers.module.js';
import { PickupSetsModule } from './pickup-sets/pickup-sets.module.js';
import { PickupsModule } from './pickups/pickups.module.js';
import { WiringDiagramsModule } from './wiring-diagrams/wiring-diagrams.module.js';

@Module({
  imports: [
    DatabaseModule,
    ManufacturersModule,
    ComponentTypesModule,
    PickupsModule,
    PickupSetsModule,
    WiringDiagramsModule,
    AttachmentsModule,
    // In production the API also serves the built Angular app.
    ...(config.serveWeb
      ? [ServeStaticModule.forRoot({ rootPath: config.webDist, exclude: ['/api/{*path}'] })]
      : []),
  ],
})
export class AppModule {}
