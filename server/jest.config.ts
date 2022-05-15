import type { Config } from "@jest/types"

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: false,
  silent: true,
  collectCoverage: true,
  roots: ['<rootDir>/src'],
  testPathIgnorePatterns: ["<rootDir>/dist/*"], // Ignore js files outside of src/
}
export default config