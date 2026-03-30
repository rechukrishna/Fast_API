*** Settings ***
Resource    ../resources/ui_selenium.resource
Suite Setup     Reset Test Database And Open
Suite Teardown  Close App
Test Setup      Open Users Page As Valid User

*** Variables ***
${VALID_EMAIL}       alice@example.com
${VALID_PASSWORD}    password123

*** Keywords ***
Open Users Page As Valid User
    Clear Auth Storage And Reload
    Login    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Should See Header Navigation
    Click Element    xpath://header[contains(@class,'header')]//button[normalize-space()='Users']
    Wait Until Element Is Visible    xpath://h2[normalize-space()='Users']    timeout=10s

*** Test Cases ***
Users Page Shows Form And List
    Page Should Contain Element    css=form.form
    Page Should Contain Element    css=input[placeholder="Name"]
    Page Should Contain Element    css=input[placeholder="Email"]
    Page Should Contain Element    css=input[placeholder="Password"]
    Page Should Contain Element    xpath://button[@type='submit' and normalize-space()='Add User']
    Page Should Contain Element    css=ul.list

Add User Appears In Users List
    ${rid}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${name}=    Set Variable    UI User ${rid}
    ${email}=    Set Variable    ui-user-${rid}@test.example.com
    Input Text    css=input[placeholder="Name"]    ${name}
    Input Text    css=input[placeholder="Email"]    ${email}
    Input Text    css=input[placeholder="Password"]    pass123
    Click Button    xpath://button[@type='submit' and normalize-space()='Add User']
    Wait Until Page Contains Element    xpath://ul[contains(@class,'list')]//li[contains(normalize-space(.), '${name}') and contains(normalize-space(.), '${email}')]    timeout=10s

Add User Clears Form Inputs
    ${rid}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${name}=    Set Variable    Form Reset User ${rid}
    ${email}=    Set Variable    form-reset-${rid}@test.example.com
    Input Text    css=input[placeholder="Name"]    ${name}
    Input Text    css=input[placeholder="Email"]    ${email}
    Input Text    css=input[placeholder="Password"]    pass123
    Click Button    xpath://button[@type='submit' and normalize-space()='Add User']
    Wait Until Keyword Succeeds    10x    500ms    Textfield Value Should Be    css=input[placeholder="Name"]    ${EMPTY}
    Textfield Value Should Be    css=input[placeholder="Email"]    ${EMPTY}
    Textfield Value Should Be    css=input[placeholder="Password"]    ${EMPTY}
