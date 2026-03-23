*** Settings ***
Resource    ../api_resources.robot
Library    Collections
Suite Setup     User Suite Setup
Suite Teardown  User Suite Teardown

*** Keywords ***
User Suite Setup
    Reset Test Database
    Create API Session
    ${ids}=    Create List
    Set Suite Variable    ${CREATED_USER_IDS}    ${ids}
    ${test_users}=    Load User Test Data
    FOR    ${user}    IN    @{test_users}
        ${body}=    Create Dictionary    name=${user}[name]    email=${user}[email]    password=${user}[password]
        ${resp}=    POST On Session    api    /users    json=${body}
        ${user_id}=    Set Variable    ${resp.json()}[id]
        Register User For Teardown    ${user_id}
    END

User Suite Teardown
    Create API Session
    FOR    ${user_id}    IN    @{CREATED_USER_IDS}
        Run Keyword And Ignore Error    DELETE On Session    api    /users/${user_id}
    END

*** Test Cases ***
List Users Returns Seed Data
    Create API Session
    ${resp}=    GET On Session    api    /users
    Status Should Be    200    ${resp}
    ${users}=    Set Variable    ${resp.json()}
    Length Should Be    ${users}    ${8}
    ${emails}=    Create List
    FOR    ${u}    IN    @{users}
        Append To List    ${emails}    ${u}[email]
    END
    Should Contain    ${emails}    alice@example.com
    Should Contain    ${emails}    bob@example.com
    Should Contain    ${emails}    suite_test@example.com
    Should Contain    ${emails}    apitestuser@example.com
    Should Contain    ${emails}    suitetester@example.com

Get User By Id
    Create API Session
    ${resp}=    GET On Session    api    /users/1
    Status Should Be    200    ${resp}
    Should Be Equal As Strings    ${resp.json()}[email]    alice@example.com
    Should Be Equal As Strings    ${resp.json()}[name]    Alice Johnson
    Dictionary Should Contain Key    ${resp.json()}    id

Get User Not Found Returns 404
    Create API Session
    ${resp}=    GET On Session    api    /users/99999    expected_status=404
    Status Should Be    404    ${resp}
    Should Contain    ${resp.json()}[detail]    User not found

Post User Creates New User
    Create API Session
    ${body}=    Create Dictionary    name=New User    email=newuser@example.com    password=secret123
    ${resp}=    POST On Session    api    /users    json=${body}
    Status Should Be    201    ${resp}
    ${user_id}=    Set Variable    ${resp.json()}[id]
    Register User For Teardown    ${user_id}
    Should Be Equal As Strings    ${resp.json()}[email]    newuser@example.com
    Should Be Equal As Strings    ${resp.json()}[name]    New User
    Dictionary Should Contain Key    ${resp.json()}    id

Post User With Duplicate Email Returns 409
    Create API Session
    ${body}=    Create Dictionary    name=Duplicate    email=alice@example.com    password=secret123
    ${resp}=    POST On Session    api    /users    json=${body}    expected_status=409
    Status Should Be    409    ${resp}
    Should Contain    ${resp.json()}[detail]    already exists
