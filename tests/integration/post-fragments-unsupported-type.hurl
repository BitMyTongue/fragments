# Unsupported Content-Type Test
POST http://localhost:8080/v1/fragments
Content-Type: application/invalid

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`This should fail`

HTTP/1.1 415