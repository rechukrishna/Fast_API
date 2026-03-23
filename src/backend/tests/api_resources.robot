*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    OperatingSystem
Library    BuiltIn

*** Variables ***
# Use API_URL env var when set (e.g. Docker: http://api:8000), else localhost for local runs
${API_URL}         %{API_URL=http://localhost:8000}
${TEST_DATA_DIR}   ${CURDIR}/test_data
${AUTH_EMAIL}      alice@example.com
${AUTH_PASSWORD}   password123

*** Keywords ***
Get Auth Token
    Create Session    api    ${API_URL}
    ${body}=    Create Dictionary    email=${AUTH_EMAIL}    password=${AUTH_PASSWORD}
    ${resp}=    POST On Session    api    /auth/login    json=${body}
    Should Be Equal As Integers    ${resp.status_code}    200
    [Return]    ${resp.json()["access_token"]}

Create API Session
    ${token}=    Get Auth Token
    &{headers}=    Create Dictionary    Authorization=Bearer ${token}
    Create Session    api    ${API_URL}    headers=${headers}

Initialize Test Data Tracking
    ${CREATED_USER_IDS}=    Create List
    ${CREATED_PRODUCT_IDS}=    Create List
    ${CREATED_ORDER_IDS}=    Create List
    Set Global Variable    ${CREATED_USER_IDS}    ${CREATED_USER_IDS}
    Set Global Variable    ${CREATED_PRODUCT_IDS}    ${CREATED_PRODUCT_IDS}
    Set Global Variable    ${CREATED_ORDER_IDS}    ${CREATED_ORDER_IDS}

Seed Test Users From File
    Create API Session
    ${path}=    Join Path    ${TEST_DATA_DIR}    users.json
    ${path}=    Replace String    ${path}    \\    /
    ${users}=    Evaluate    json.load(open('${path}'))    json
    ${timestamp}=    Get Time    epoch
    ${idx}=    Set Variable    0
    FOR    ${user}    IN    @{users}
        ${email}=    Set Variable    testuser${timestamp}_${idx}@example.com
        ${idx}=    Evaluate    ${idx} + 1
        ${body}=    Create Dictionary    name=${user["name"]}    email=${email}    password=testpass123
        ${resp}=    POST On Session    api    /users    json=${body}
        Append To List    ${CREATED_USER_IDS}    ${resp.json()["id"]}
        Set Global Variable    ${CREATED_USER_IDS}
    END

Seed Test Products From File
    Create API Session
    ${path}=    Join Path    ${TEST_DATA_DIR}    products.json
    ${path}=    Replace String    ${path}    \\    /
    ${products}=    Evaluate    json.load(open('${path}'))    json
    FOR    ${product}    IN    @{products}
        ${body}=    Create Dictionary    name=${product["name"]}    price=${product["price"]}    stock=${product["stock"]}
        ${resp}=    POST On Session    api    /products    json=${body}
        Append To List    ${CREATED_PRODUCT_IDS}    ${resp.json()["id"]}
        Set Global Variable    ${CREATED_PRODUCT_IDS}
    END

Seed Test Orders From File
    Create API Session
    ${path}=    Join Path    ${TEST_DATA_DIR}    orders.json
    ${path}=    Replace String    ${path}    \\    /
    ${orders}=    Evaluate    json.load(open('${path}'))    json
    FOR    ${order}    IN    @{orders}
        ${body}=    Create Dictionary    user_id=${order["user_id"]}    product_id=${order["product_id"]}    quantity=${order["quantity"]}    status=${order["status"]}
        ${resp}=    POST On Session    api    /orders    json=${body}
        Append To List    ${CREATED_ORDER_IDS}    ${resp.json()["id"]}
        Set Global Variable    ${CREATED_ORDER_IDS}
    END

Register Created User Id
    [Arguments]    ${user_id}
    Append To List    ${CREATED_USER_IDS}    ${user_id}
    Set Global Variable    ${CREATED_USER_IDS}

Register Created Product Id
    [Arguments]    ${product_id}
    Append To List    ${CREATED_PRODUCT_IDS}    ${product_id}
    Set Global Variable    ${CREATED_PRODUCT_IDS}

Register Created Order Id
    [Arguments]    ${order_id}
    Append To List    ${CREATED_ORDER_IDS}    ${order_id}
    Set Global Variable    ${CREATED_ORDER_IDS}

Delete Test Data By Tracked Ids
    Create API Session
    FOR    ${order_id}    IN    @{CREATED_ORDER_IDS}
        Run Keyword And Ignore Error    DELETE On Session    api    /orders/${order_id}
    END
    FOR    ${product_id}    IN    @{CREATED_PRODUCT_IDS}
        Run Keyword And Ignore Error    DELETE On Session    api    /products/${product_id}
    END
    FOR    ${user_id}    IN    @{CREATED_USER_IDS}
        Run Keyword And Ignore Error    DELETE On Session    api    /users/${user_id}
    END
