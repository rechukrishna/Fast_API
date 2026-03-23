*** Settings ***
Resource    ../api_resources.robot
Library    Collections
Suite Setup    Seed Test Products From File

*** Variables ***
${EXPECTED_PRODUCT_COUNT}    13

*** Test Cases ***
List Products Returns Seed Data
    Create API Session
    ${resp}=    GET On Session    api    /products
    Should Be Equal As Integers    ${resp.status_code}    200
    Should Not Be Empty    ${resp.json()}
    Length Should Be    ${resp.json()}    ${EXPECTED_PRODUCT_COUNT}

Get Product By Id
    Create API Session
    ${resp}=    GET On Session    api    /products/1
    Should Be Equal As Integers    ${resp.status_code}    200
    Should Be Equal As Integers    ${resp.json()["id"]}    1
    Should Be Equal    ${resp.json()["name"]}    Laptop Pro 15
    Should Be Equal As Numbers    ${resp.json()["price"]}    1499.99
    Should Be Equal As Integers    ${resp.json()["stock"]}    10

Get Product Not Found Returns 404
    Create API Session
    ${resp}=    GET On Session    api    /products/99999    expected_status=404
    Should Be Equal As Integers    ${resp.status_code}    404

Post Product Creates New Product
    Create API Session
    ${body}=    Create Dictionary    name=Test Product    price=99.99    stock=5
    ${resp}=    POST On Session    api    /products    json=${body}
    Should Be Equal As Integers    ${resp.status_code}    201
    Dictionary Should Contain Key    ${resp.json()}    id
    Should Be Equal    ${resp.json()["name"]}    Test Product
    Should Be Equal As Numbers    ${resp.json()["price"]}    99.99
    Should Be Equal As Integers    ${resp.json()["stock"]}    5
    Register Created Product Id    ${resp.json()["id"]}
