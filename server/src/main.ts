import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { HttpExceptionFilter } from './common/filters/http-exception.filter';
// import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(process.cwd(), 'public'), {
    index: false,
  });

  // API Base Route
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  // Setup CORS
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Set Global-validation - setup global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Centralised Error Handling Filters
  // app.useGlobalFilters(
  //   new HttpExceptionFilter(),
  //   new PrismaExceptionFilter()
  // );

  // Enable Swagger Docs
  const config = new DocumentBuilder()
    .setTitle('AarogyaID NestJS API Documentation')
    .setDescription('The complete detailed documentation of all the api endpoints.')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication related endpoints')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    }, 'JWT-auth',
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Refresh-JWT',
      description: 'Enter Refresh JWT token',
      in: 'header',
    }, 'JWT-Refresh',
    )
    .addServer('http://localhost:3000', 'Development Server')
    .build();


  const document = SwaggerModule.createDocument(app, config);


  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'AarogyaID API Docs',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0; }
      .swagger-ui .info .title { color: #4A90E2; }
    `,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(
  (error) => {
    Logger.error("Error starting server...! Error:", error);
    process.exit(1);
  }
);
