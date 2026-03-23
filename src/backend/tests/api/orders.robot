*** Settings ***
Resource    ../api_resources.robot
Library    Collections
Suite Setup     Order Suite Setup
Suite Teardown  Order Suite Teardown

*** Keywords ***
Order Suite Setup
    Reset Test Database
    Create API Session
    ${ids}=    Create List
    Set Suite Variable    ${CREATED_ORDER_IDS}    ${ids}
    ${test_orders}=    Load Order Test Data
    FOR    ${order}    IN    @{test_orders}
        ${body}=    Create Dictionary    user_id=${order}[user_id]    product_id=${order}[product_id]    quantity=${order}[quantity]    status=${order}[status]
        ${resp}=    POST On Session    api    /orders    json=${body}
        ${order_id}=    Set Variable    ${resp.json()}[id]
        Register Order For Teardown    ${order_id}
    END

Order Suite Teardown
    Create API Session
    FOR    ${order_id}    IN    @{CREATED_ORDER_IDS}
        Run Keyword And Ignore Error    DELETE On Session    api    /orders/${order_id}
    END

*** Test Cases ***
List Orders Returns Seed Data And Test Data
    Create API Session
    ${resp}=    GET On Session    api    /orders
    Status Should Be    200    ${resp}
    ${orders}=    Set Variable    ${resp.json()}
    Length Should Be    ${orders}    ${8}
    ${ids}=    Create List
    FOR    ${o}    IN    @{orders}
        Append To List    ${ids}    ${o}[id]
    END
    Length Should Be    ${ids}    ${8}

Get Order By Id
    Create API Session
    ${resp}=    GET On Session    api    /orders/1
    Status Should Be    200    ${resp}
    Should Be Equal As Integers    ${resp.json()}[user_id]    ${1}
    Should Be Equal As Integers    ${resp.json()}[product_id]    ${1}
    Dictionary Should Contain Key    ${resp.json()}    id
    Dictionary Should Contain Key    ${resp.json()}    status

Get Order Not Found Returns 404
    Create API Session
    ${resp}=    GET On Session    api    /orders/99999    expected_status=404
    Status Should Be    404    ${resp}
    Should Contain    ${resp.json()}[detail]    Order not found

Post Order Creates New Order
    Create API Session
    ${body}=    Create Dictionary    user_id=1    product_id=1    quantity=5    status=pending
    ${resp}=    POST On Session    api    /orders    json=${body}
    Status Should Be    201    ${resp}
    ${order_id}=    Set Variable    ${resp.json()}[id]
    Register Order For Teardown    ${order_id}
    Should Be Equal As Integers    ${resp.json()}[user_id]    ${1}
    Should Be Equal As Integers    ${resp.json()}[product_id]    ${1}
    Should Be Equal As Integers    ${resp.json()}[quantity]    ${5}
    Should Be Equal As Strings    ${resp.json()}[status]    pending
    Dictionary Should Contain Key    ${resp.json()}    id

Post Order With Invalid User Returns 400
    Create API Session
    ${body}=    Create Dictionary    user_id=99999    product_id=1    quantity=1    status=pending
    ${resp}=    POST On Session    api    /orders    json=${body}    expected_status=400
    Status Should Be    400    ${resp}
    Should Contain    ${resp.json()}[detail]    Invalid user or product

Post Order With Invalid Product Returns 400
    Create API Session
    ${body}=    Create Dictionary    user_id=1    product_id=99999    quantity=1    status=pending
    ${resp}=    POST On Session    api    /orders    json=${body}    expected_status=400
    Status Should Be    400    ${resp}
    Should Contain    ${resp.json()}[detail]    Invalid user or product
