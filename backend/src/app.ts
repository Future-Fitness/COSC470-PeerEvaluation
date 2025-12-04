import Fastify from 'fastify'
import fp from 'fastify-plugin'
import multipart from '@fastify/multipart'
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

// Register module routes
console.log('Starting route registration...');

import registerAuthRoutes from './modules/auth/routes';
import registerClassRoutes from './modules/classes/routes';
import registerStudentRoutes from './modules/students/routes';
import registerGroupRoutes from './modules/groups/routes';
import registerAssignmentRoutes from './modules/assignments/routes';
import registerRubricRoutes from './modules/rubrics/routes';
import registerReviewRoutes from './modules/reviews/routes';
import registerHealthRoutes from './modules/health/routes';

export const routesRegistered: string[] = [];

// Register routes by module
const modules = [
  { name: 'auth', register: registerAuthRoutes },
  { name: 'classes', register: registerClassRoutes },
  { name: 'students', register: registerStudentRoutes },
  { name: 'groups', register: registerGroupRoutes },
  { name: 'assignments', register: registerAssignmentRoutes },
  { name: 'rubrics', register: registerRubricRoutes },
  { name: 'reviews', register: registerReviewRoutes },
  { name: 'health', register: registerHealthRoutes },
];

modules.forEach(module => {
  console.log(`Registering ${module.name} routes...`);
  module.register(app);
  routesRegistered.push(module.name);
});

console.log(`Route registration complete! Registered ${modules.length} modules.`);