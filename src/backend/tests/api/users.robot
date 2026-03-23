*** Settings ***
Resource    ../api_resources.robot
Library    Collections
Suite Setup    Seed Test Users From File

*** Variables ***
${EXPECTED_USER_COUNT}    8

*** Test Cases ***
Get Root Returns Success
    Create API Session
    ${resp}=    GET On Session    api    /
    Should Be Equal As Integers    ${resp.status_code}    200
    Dictionary Should Contain Key    ${resp.json()}    message
    Should Be Equal    ${resp.json()["message"]}    Backend is running

List Users Returns Seed Data
    Create API Session
    ${resp}=    GET On Session    api    /users
    Should Be Equal As Integers    ${resp.status_code}    200
    Should Not Be Empty    ${resp.json()}
    Length Should Be    ${resp.json()}    ${EXPECTED_USER_COUNT}

Get User By Id
    Create API Session
    ${resp}=    GET On Session    api    /users/1
    Should Be Equal As Integers    ${resp.status_code}    200
    Should Be Equal As Integers    ${resp.json()["id"]}    1
    Dictionary Should Contain Key    ${resp.json()}    name
    Dictionary Should Contain Key    ${resp.json()}    email

Get User Not Found Returns 404
    Create API Session
    ${resp}=    GET On Session    api    /users/99999    expected_status=404
    Should Be Equal As Integers    ${resp.status_code}    404

Post User Creates New User
    Create API Session
    ${timestamp}=    Get Time    epoch
    ${email}=    Set Variable    testuser${timestamp}@example.com
    ${body}=    Create Dictionary    name=Test User    email=${email}
    ${resp}=    POST On Session    api    /users    json=${body}
    Should Be Equal As Integers    ${resp.status_code}    201
    Dictionary Should Contain Key    ${resp.json()}    id
    Should Be Equal    ${resp.json()["name"]}    Test User
    Should Be Equal    ${resp.json()["email"]}    ${email}
    Register Created User Id    ${resp.json()["id"]}
