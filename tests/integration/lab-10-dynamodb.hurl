# Lab 10 DynamoDB integration test

# Step 1: POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
{ "service": "DynamoDB" }

# Step 2: Confirm 201 and capture Location + id
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"


# Step 3: GET fragment info (metadata)
GET {{fragment1_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200


# Step 4: POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`DynamoDB is **great**.`

# Step 5: Confirm 201 and capture Location + id
HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"


# Step 6: GET fragment info (metadata)
GET {{fragment2_url}}/info
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200


# Step 7: GET all fragments (ids only) and confirm both exist
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
body contains "{{fragment1_id}}"
body contains "{{fragment2_id}}"


# Step 8: DELETE first fragment
DELETE {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# Step 9: Confirm 200
HTTP/1.1 200


# Step 10: Try to GET deleted fragment
GET {{fragment1_url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

# Step 11: Confirm 404
HTTP/1.1 404


# Step 12: GET all fragments again (first gone, second remains)
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
[Asserts]
body not contains "{{fragment1_id}}"
body contains "{{fragment2_id}}"
