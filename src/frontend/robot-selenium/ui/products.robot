*** Settings ***
Resource    ../resources/ui_selenium.resource
Suite Setup     Reset Test Database And Open
Suite Teardown  Close App
Test Setup      Open Products Page As Valid User

*** Variables ***
${VALID_EMAIL}       alice@example.com
${VALID_PASSWORD}    password123

*** Keywords ***
Open Products Page As Valid User
    Clear Auth Storage And Reload
    Login    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Should See Header Navigation
    Click Element    xpath://header[contains(@class,'header')]//button[normalize-space()='Products']
    Wait Until Element Is Visible    xpath://h2[normalize-space()='Products']    timeout=10s

*** Test Cases ***
Products Page Shows Form And List
    Page Should Contain Element    css=form.form
    Page Should Contain Element    css=input[placeholder="Name"]
    Page Should Contain Element    css=input[placeholder="Price"]
    Page Should Contain Element    css=input[placeholder="Stock"]
    Page Should Contain Element    xpath://button[@type='submit' and normalize-space()='Add Product']
    Page Should Contain Element    css=ul.list

Add Product Appears In Products List
    ${rid}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${name}=    Set Variable    UI Product ${rid}
    Input Text    css=input[placeholder="Name"]    ${name}
    Input Text    css=input[placeholder="Price"]    12.34
    Input Text    css=input[placeholder="Stock"]    5
    Click Button    xpath://button[@type='submit' and normalize-space()='Add Product']
    Wait Until Page Contains Element    xpath://ul[contains(@class,'list')]//li[contains(normalize-space(.), '${name}')]    timeout=10s

Add Product Clears Form Inputs
    ${rid}=    Evaluate    str(int(__import__('time').time() * 1000))
    ${name}=    Set Variable    Reset Product ${rid}
    Input Text    css=input[placeholder="Name"]    ${name}
    Input Text    css=input[placeholder="Price"]    22.22
    Input Text    css=input[placeholder="Stock"]    9
    Click Button    xpath://button[@type='submit' and normalize-space()='Add Product']
    Wait Until Keyword Succeeds    10x    500ms    Textfield Value Should Be    css=input[placeholder="Name"]    ${EMPTY}
    Textfield Value Should Be    css=input[placeholder="Price"]    ${EMPTY}
    Textfield Value Should Be    css=input[placeholder="Stock"]    ${EMPTY}
