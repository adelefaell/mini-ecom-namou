import { buildApp } from "./app"
import { env } from "./env"

const app = buildApp()

app.listen({ port: env.PORT, host: env.HOST }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})