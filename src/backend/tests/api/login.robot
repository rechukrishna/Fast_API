*** Settings ***
Resource    ../api_resources.robot
Library    Collections

*** Test Cases ***
Login With Valid Credentials Returns Token
    Reset Test Database
    ${body}=    Create Dictionary    email=alice@example.com    password=password123
    Create Session    api    ${API_URL}
    ${resp}=    POST On Session    api    /auth/login    json=${body}
    Status Should Be    200    ${resp}
    Dictionary Should Contain Key    ${resp.json()}    access_token
    Should Be Equal As Strings    ${resp.json()}[token_type]    bearer
    Dictionary Should Contain Key    ${resp.json()}    user
    Dictionary Should Contain Key    ${resp.json()}[user]    email
    Should Be Equal As Strings    ${resp.json()}[user][email]    alice@example.com

Login With Invalid Password Returns 401
    Reset Test Database
    ${body}=    Create Dictionary    email=alice@example.com    password=wrongpassword
    Create Session    api    ${API_URL}
    ${resp}=    POST On Session    api    /auth/login    json=${body}    expected_status=401
    Status Should Be    401    ${resp}
    Should Contain    ${resp.json()}[detail]    Incorrect email or password

Login With Unknown Email Returns 401
    Reset Test Database
    ${body}=    Create Dictionary    email=nobody@example.com    password=password123
    Create Session    api    ${API_URL}
    ${resp}=    POST On Session    api    /auth/login    json=${body}    expected_status=401
    Status Should Be    401    ${resp}
    Should Contain    ${resp.json()}[detail]    Incorrect email or password

Get Auth Token Returns Valid Token
    Reset Test Database
    ${token}=    Get Auth Token    bob@example.com    password123
    Should Not Be Empty    ${token}
