declare global {
  var testRequest: ReturnType<typeof import('supertest')>
}

export {}
