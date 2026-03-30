*** Settings ***
Resource    ../resources/ui_selenium.resource
Suite Setup     Reset Test Database And Open
Suite Teardown  Close App
Test Setup      Open Orders Page As Valid User

*** Variables ***
${VALID_EMAIL}       alice@example.com
${VALID_PASSWORD}    password123

*** Keywords ***
Open Orders Page As Valid User
    Clear Auth Storage And Reload
    Login    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Should See Header Navigation
    Click Element    xpath://header[contains(@class,'header')]//button[normalize-space()='Orders']
    Wait Until Element Is Visible    xpath://h2[normalize-space()='Orders']    timeout=10s

*** Test Cases ***
Orders Page Shows Form And List
    Page Should Contain Element    css=form.form
    ${select_count}=    Get Element Count    css=form.form select
    Should Be True    ${select_count} >= 3
    Page Should Contain Element    css=input[placeholder="Qty"]
    Page Should Contain Element    xpath://button[@type='submit' and normalize-space()='Add Order']
    Page Should Contain Element    css=ul.list

Status Dropdown Has Required Options
    Page Should Contain Element    xpath://select[option[normalize-space()='Pending']]
    Page Should Contain Element    xpath://select[option[normalize-space()='Paid']]
    Page Should Contain Element    xpath://select[option[normalize-space()='Cancelled']]

Add Order Appears In Orders List
    Select From List By Index    xpath:(//form[contains(@class,'form')]//select)[1]    1
    ${selected_user}=    Get Selected List Label    xpath:(//form[contains(@class,'form')]//select)[1]
    Select From List By Index    xpath:(//form[contains(@class,'form')]//select)[2]    1
    ${selected_product}=    Get Selected List Label    xpath:(//form[contains(@class,'form')]//select)[2]
    Clear Element Text           css=input[placeholder="Qty"]
    Input Text                   css=input[placeholder="Qty"]    3
    Select From List By Label    xpath:(//form[contains(@class,'form')]//select)[3]    Paid
    Click Button                 xpath://button[@type='submit' and normalize-space()='Add Order']
    Wait Until Page Contains Element    xpath://ul[contains(@class,'list')]//li[contains(normalize-space(.), '${selected_user} × ${selected_product}') and contains(normalize-space(.), 'qty 3 (paid)')]    timeout=10s
