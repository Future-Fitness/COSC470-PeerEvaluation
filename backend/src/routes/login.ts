import { FastifyInstance } from 'fastify';
import { sha512, sha512_256 } from 'js-sha512';
import models from '../util/database';

const User = models.User;

export default function (app: FastifyInstance) {
  app.get('/login', async (req, resp) => {
    // This should contain basic auth header
    const auth = req.headers.authorization;
    if (!auth) {
      resp.status(400).send('Bad request');
      return;
    }

    // Validate authorization header format
    const parts = auth.split(' ');
    if (parts.length !== 2) {
      resp.status(400).send('Bad request - invalid authorization format');
      return;
    }

    const [authType, credentials] = parts;

    // Only accept Basic authentication (case-insensitive)
    if (authType.toLowerCase() !== 'basic') {
      resp.status(400).send('Bad request - must use Basic authentication');
      return;
    }

    // Decode credentials with error handling
    let user: string;
    let pass: string;
    try {
      const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
      const colonIndex = decoded.indexOf(':');

      if (colonIndex === -1) {
        resp.status(400).send('Bad request - invalid credentials format');
        return;
      }

      // Split only on the first colon (password may contain colons)
      user = decoded.substring(0, colonIndex);
      pass = decoded.substring(colonIndex + 1);
    } catch (error) {
      resp.status(400).send('Bad request - invalid base64 encoding');
      return;
    }

    const hashedPass = sha512(pass);

    // Check if user/pass is correct
    const userData = await User.findOne({
      where: {
        name: user,
        hash_pass: hashedPass,
      }
    })

    // Something went wrong
    if (!userData) {
      resp.status(401).send('Unauthorized');
      return;
    }

    const token = generateToken(user);

    // Store a session token in the global state
    // @ts-expect-error this is fine
    app.session = {
      [token]: {
        // TODO make this configurable
        // Expire in 20 minutes
        inactivityExpire: Date.now() + 20 * 60 * 1000,
        // No matter what, expire after 3 days
        fullExpire: Date.now() + 3 * 24 * 60 * 60 * 1000,
        username: user,
        id: userData.id,
      },
      // @ts-expect-error this is fine
      ...app.session
    }

    resp.status(200).send({
      token,
      isTeacher: userData.is_teacher,
    });
  });
}

// Counter for additional uniqueness
let tokenCounter = 0;

const generateToken = (username: string) => {
  // Use multiple entropy sources for guaranteed uniqueness
  const timestamp = Date.now();
  const highResTime = process.hrtime.bigint();
  const randomValue = Math.random().toString(36);
  const counter = tokenCounter++;
  const cpuUsage = process.cpuUsage().system;

  // Combine all sources of entropy
  const seed = `${username}:${timestamp}:${highResTime}:${randomValue}:${counter}:${cpuUsage}`;
  return sha512_256(seed);
}
