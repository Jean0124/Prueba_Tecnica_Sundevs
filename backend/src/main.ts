import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: 'http://localhost:3000' })
  app.setGlobalPrefix('api')
  await app.listen(3001)
  console.log('Backend corriendo en http://localhost:3001')
}
bootstrap()
