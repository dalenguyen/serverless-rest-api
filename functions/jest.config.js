module.exports = {
  roots: [
    '<rootDir>/__tests__',
    '<rootDir>/test'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json'
    }
  }
}
