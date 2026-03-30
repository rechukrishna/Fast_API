*** Settings ***
Library    SeleniumLibrary
Library    RequestsLibrary
Library    Collections
Library    String

*** Variables ***
${UI_URL}    %{UI_URL=http://localhost:3000}
${API_URL}   %{API_URL=http://localhost:8000}
${CHROME_DRIVER}    %{CHROME_DRIVER=C:\\Users\\rechu\\Documents\\chrome\\chromedriver-win64\\chromedriver.exe}
${HEADLESS}    %{HEADLESS=FALSE}

*** Keywords ***
Reset Test Database
    Create Session    reset    ${API_URL}
    POST On Session    reset    /test/reset
    Delete All Sessions

Open App
    ${has_driver}=    Run Keyword And Return Status    Should Not Be Empty    ${CHROME_DRIVER}
    ${options}=    Evaluate    selenium.webdriver.ChromeOptions()    modules=selenium.webdriver
    Run Keyword If    '${HEADLESS}'=='TRUE'    Call Method    ${options}    add_argument    --headless=new
    Run Keyword If    ${has_driver}    Open App With Driver Path    ${options}
    ...    ELSE    Open Browser    ${UI_URL}    chrome    options=${options}
    Run Keyword If    ${has_driver}    Go To    ${UI_URL}
    Maximize Browser Window

Open App With Driver Path
    [Arguments]    ${options}
    ${service}=    Evaluate    selenium.webdriver.chrome.service.Service(executable_path=r'''${CHROME_DRIVER}''')    modules=selenium.webdriver.chrome.service
    Create Webdriver    Chrome    options=${options}    service=${service}

Close App
    Close Browser

Reset Test Database And Open
    Reset Test Database
    Open App

Clear Auth Storage And Reload
    Execute Javascript    localStorage.clear()
    Reload Page
    Wait Until Element Is Visible    css=.login-page    timeout=10s

Login
    [Arguments]    ${email}    ${password}
    Wait Until Element Is Visible    css=input[placeholder="Email"]    timeout=10s
    Input Text    css=input[placeholder="Email"]    ${email}
    Input Text    css=input[placeholder="Password"]    ${password}
    Click Button    css=button[type="submit"]

Get Navigation Timing Milliseconds
    [Arguments]    ${metric}
    ${value}=    Execute Javascript    return (() => { const n = performance.getEntriesByType('navigation')[0]; if(!n){ return -1; } return n['${metric}']; })();
    ${number}=    Convert To Number    ${value}
    RETURN    ${number}

Measure Login Duration Milliseconds
    [Arguments]    ${email}    ${password}
    ${start}=    Evaluate    __import__('time').perf_counter()
    Login    ${email}    ${password}
    Wait Until Element Is Visible    css=header.header    timeout=10s
    ${end}=    Evaluate    __import__('time').perf_counter()
    ${elapsed_ms}=    Evaluate    round((${end} - ${start}) * 1000, 2)
    RETURN    ${elapsed_ms}

Should See Error
    [Arguments]    ${message}
    Wait Until Element Is Visible    css=p.error    timeout=10s
    ${text}=    Get Text    css=p.error
    ${text}=    Strip String    ${text}
    Should Be Equal    ${text}    ${message}

Should See Login Page Elements
    Wait Until Element Is Visible    css=.login-page    timeout=10s
    Page Should Contain Element    css=input[placeholder="Email"]
    Page Should Contain Element    css=input[placeholder="Password"]
    Page Should Contain Element    xpath://button[@type="submit" and normalize-space()='Sign In']

Should See Header Navigation
    Wait Until Element Is Visible    css=header.header    timeout=10s
    Page Should Contain Element    xpath://header[contains(@class,'header')]//button[normalize-space()='Users']
    Page Should Contain Element    xpath://header[contains(@class,'header')]//button[normalize-space()='Products']
    Page Should Contain Element    xpath://header[contains(@class,'header')]//button[normalize-space()='Orders']
    Page Should Contain Element    css=button.logout-btn

Should See User Email In Header
    [Arguments]    ${email}
    Wait Until Element Is Visible    css=.user-email    timeout=10s
    ${text}=    Get Text    css=.user-email
    ${text}=    Strip String    ${text}
    Should Be Equal    ${text}    ${email}

