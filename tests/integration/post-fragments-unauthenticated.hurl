# POST without authentication should fail
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

# Just don't include BasicAuth

`This should not work`

HTTP/1.1 401