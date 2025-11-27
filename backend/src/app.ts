import Fastify from 'fastify'
import fp from 'fastify-plugin'
import multipart from '@fastify/multipart'
import fs from 'fs'
import path from 'path';
import authentication from './middleware/auth';

export const app = Fastify({
  // Documents may be upwrads of 100mb
  bodyLimit: 100 * 1024 * 1024,
})

// Register multipart for file uploads
app.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  }
})

// Add CORS headers manually to all responses - completely permissive
app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*')
  reply.header('Access-Control-Allow-Methods', '*')
  reply.header('Access-Control-Allow-Headers', '*')
  reply.header('Access-Control-Expose-Headers', '*')

  // Handle preflight
  if (request.method === 'OPTIONS') {
    reply.code(200).send()
  }
})

app.register(fp(authentication), { noAuthRoutes: ['/login', '/ping', '/request_otp', '/verify_otp'] })
app.decorate('session', {})

// Register routes before app starts listening
console.log('Starting route registration...');
const files = fs.readdirSync(path.join(__dirname, 'routes'));
console.log(`Found ${files.length} route files`);

files.forEach(file => {
  const name = file.replace('.ts', '');
  console.log(`Registering route: ${name}`);
  const route = require(`./routes/${name}`);
  route.default(app);
});

console.log('Route registration complete!');