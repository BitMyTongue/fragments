# Lab 9 S3 integration test

# 1. POST a new text fragment to http://localhost:8080 as an authorized user. The fragment's body should be the string, Hello S3!.
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Hello S3!`

# 2. Confirm that the server returns a 201, and capture the Location header value to a variable named url
HTTP/1.1 201
[Asserts]
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 9

[Captures]
url: header "Location"

# 3. GET the fragment you just created using the url as an authorized user.
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 4. Confirm that the server returns a 200, that the type of the fragment is text/plain, and that the body is equal to Hello S3!
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

# 5. DELETE the fragment using the url as an authorized user.
DELETE {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 6. Confirm that the server returns a 200.
HTTP/1.1 200

# 7. Try to GET the fragment again using the url as an authorized user.
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# 8. Confirm that the server returns a 404, since the fragment should be deleted.
HTTP/1.1 404