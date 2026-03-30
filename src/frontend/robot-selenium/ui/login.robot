*** Settings ***
Resource    ../resources/ui_selenium.resource
Suite Setup     Reset Test Database And Open
Suite Teardown  Close App
Test Setup      Clear Auth Storage And Reload

*** Variables ***
${VALID_EMAIL}       alice@example.com
${VALID_PASSWORD}    password123

*** Test Cases ***
Login Page Shows Required Elements
    Should See Login Page Elements

Submitting With Empty Email Shows Error
    Input Text    css=input[placeholder="Password"]    ${VALID_PASSWORD}
    Click Button    css=button[type="submit"]
    Should See Error    Email is required

Submitting With Empty Password Shows Error
    Input Text    css=input[placeholder="Email"]    ${VALID_EMAIL}
    Click Button    css=button[type="submit"]
    Should See Error    Password is required

Submitting With Whitespace Email Shows Error
    Input Text    css=input[placeholder="Email"]    ${SPACE}${SPACE}${SPACE}
    Input Text    css=input[placeholder="Password"]    ${VALID_PASSWORD}
    Click Button    css=button[type="submit"]
    Should See Error    Email is required

Invalid Credentials Show Error
    Input Text    css=input[placeholder="Email"]    invalid@example.com
    Input Text    css=input[placeholder="Password"]    wrongpassword
    Click Button    css=button[type="submit"]
    Should See Error    Incorrect email or password
    
Successful Login Shows Header Navigation
    Login    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Should See Header Navigation

Successful Login Shows User Email In Header
    Login    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Should See User Email In Header    ${VALID_EMAIL}

