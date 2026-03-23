*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    OperatingSystem

*** Variables ***
# Use API_URL env var when set (e.g. Docker: http://api:8000), else localhost for local runs
${API_URL}         %{API_URL=http://localhost:8000}

*** Keywords ***
Reset Test Database
    Create Session    reset    ${API_URL}
    POST On Session    reset    /test/reset
    Delete All Sessions

Get Auth Token
    [Arguments]    ${email}    ${password}
    ${body}=    Create Dictionary    email=${email}    password=${password}
    Create Session    api    ${API_URL}
    ${resp}=    POST On Session    api    /auth/login    json=${body}
    RETURN    ${resp.json()}[access_token]

Create API Session
    [Arguments]    ${email}=alice@example.com    ${password}=password123
    ${token}=    Get Auth Token    ${email}    ${password}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    Create Session    api    ${API_URL}    headers=${headers}

Register User For Teardown
    [Arguments]    ${user_id}
    Append To List    ${CREATED_USER_IDS}    ${user_id}

Register Product For Teardown
    [Arguments]    ${product_id}
    Append To List    ${CREATED_PRODUCT_IDS}    ${product_id}

Register Order For Teardown
    [Arguments]    ${order_id}
    Append To List    ${CREATED_ORDER_IDS}    ${order_id}

Load User Test Data
    ${path}=    Join Path    ${CURDIR}    test_data    users.json
    ${content}=    Get File    ${path}
    ${users}=    Evaluate    json.loads('''${content}''')    json
    RETURN    ${users}

Load Product Test Data
    ${path}=    Join Path    ${CURDIR}    test_data    products.json
    ${content}=    Get File    ${path}
    ${products}=    Evaluate    json.loads('''${content}''')    json
    RETURN    ${products}

Load Order Test Data
    ${path}=    Join Path    ${CURDIR}    test_data    orders.json
    ${content}=    Get File    ${path}
    ${orders}=    Evaluate    json.loads('''${content}''')    json
    RETURN    ${orders}
