*** Settings ***
Resource    ../api_resources.robot
Library    Collections
Suite Setup    Seed Test Orders From File

*** Variables ***
${EXPECTED_ORDER_COUNT}    8

*** Test Cases ***
List Orders Returns Seed Data
    Create API Session
    ${resp}=    GET On Session    api    /orders
    Should Be Equal As Integers    ${resp.status_code}    200
    Should Not Be Empty    ${resp.json()}
    Length Should Be    ${resp.json()}    ${EXPECTED_ORDER_COUNT}

Get Order By Id
    Create API Session
    ${resp}=    GET On Session    api    /orders/1
    Should Be Equal As Integers    ${resp.status_code}    200
    Should Be Equal As Integers    ${resp.json()["id"]}    1
    Should Be Equal As Integers    ${resp.json()["user_id"]}    1
    Should Be Equal As Integers    ${resp.json()["product_id"]}    1
    Should Be Equal As Integers    ${resp.json()["quantity"]}    1

Get Order Not Found Returns 404
    Create API Session
    ${resp}=    GET On Session    api    /orders/99999    expected_status=404
    Should Be Equal As Integers    ${resp.status_code}    404

Post Order Creates New Order
    Create API Session
    ${body}=    Create Dictionary    user_id=1    product_id=1    quantity=2    status=pending
    ${resp}=    POST On Session    api    /orders    json=${body}
    Should Be Equal As Integers    ${resp.status_code}    201
    Dictionary Should Contain Key    ${resp.json()}    id
    Should Be Equal As Integers    ${resp.json()["user_id"]}    1
    Should Be Equal As Integers    ${resp.json()["product_id"]}    1
    Should Be Equal As Integers    ${resp.json()["quantity"]}    2
    Register Created Order Id    ${resp.json()["id"]}

Post Order With Invalid User Returns 400
    Create API Session
    ${body}=    Create Dictionary    user_id=99999    product_id=1    quantity=1
    ${resp}=    POST On Session    api    /orders    json=${body}    expected_status=400
    Should Be Equal As Integers    ${resp.status_code}    400
