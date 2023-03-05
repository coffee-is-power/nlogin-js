import type { JestConfigWithTsJest } from "ts-jest";
const jestConfig: JestConfigWithTsJest = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};
export default jestConfig;