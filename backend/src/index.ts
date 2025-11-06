import { app } from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
