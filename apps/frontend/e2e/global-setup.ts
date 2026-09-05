import { execFileSync } from "node:child_process"
import { rmSync } from "node:fs"
import { BACKEND_ENV, e2eDbFiles } from "./constants"

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm"

export default function globalSetup() {
  for (const file of e2eDbFiles()) {
    rmSync(file, { force: true })
  }

  const env = { ...process.env, ...BACKEND_ENV }

  execFileSync(pnpm, ["--filter", "backend", "db:migrate"], { env, stdio: "inherit" })
  execFileSync(pnpm, ["--filter", "backend", "db:seed"], { env, stdio: "inherit" })
}