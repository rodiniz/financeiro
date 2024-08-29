{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": ["**/?(*.)+(spec|test).ts?(x)"],
  "collectCoverageFrom": ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
  "coveragePathIgnorePatterns": ["/node_modules/"],
  "coverageReporters": ["text", "lcov"]
} 