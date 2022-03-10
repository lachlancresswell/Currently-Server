import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  //testPathIgnorePatterns: ["<rootDir>/dist/"]
}
export default config