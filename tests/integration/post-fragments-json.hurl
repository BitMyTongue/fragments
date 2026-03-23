# POST JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
test-user1@fragments-testing.com:test-password1

{"message":"hello from aaron"}

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

[Captures]
url: header "Location"

# GET the fragment back
GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json

[Asserts]
body == "{\"message\":\"hello from aaron\"}"