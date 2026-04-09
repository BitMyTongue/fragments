# Create fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`hello`

HTTP/1.1 201
[Captures]
fragmentId: jsonpath "$.fragment.id"

# Update fragment
PUT http://localhost:8080/v1/fragments/{{fragmentId}}
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`updated text`

HTTP/1.1 200

# Get updated fragment
GET http://localhost:8080/v1/fragments/{{fragmentId}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "updated text"