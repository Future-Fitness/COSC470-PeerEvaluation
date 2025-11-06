import { app } from './app'

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen({
  port: PORT,
  host: '0.0.0.0'
}, () => {
  console.log(`Server is listening on port ${PORT}!`)
})