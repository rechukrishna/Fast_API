*** Settings ***
Resource    ../resources/ui_selenium.resource
Suite Setup     Reset Test Database And Open
Suite Teardown  Close App
Test Setup      Clear Auth Storage And Reload

*** Variables ***
${VALID_EMAIL}       alice@example.com
${VALID_PASSWORD}    password123
${MAX_DOM_CONTENT_LOADED_MS}    %{MAX_DOM_CONTENT_LOADED_MS=3000}
${MAX_LOGIN_RENDER_MS}          %{MAX_LOGIN_RENDER_MS=2500}

*** Test Cases ***
Initial Login Page DOM Content Loaded Is Under Threshold
    ${dcl}=    Get Navigation Timing Milliseconds    domContentLoadedEventEnd
    Log    DOMContentLoaded(ms): ${dcl}
    Should Be True    ${dcl} > 0
    Should Be True    ${dcl} < ${MAX_DOM_CONTENT_LOADED_MS}

Successful Login Header Render Is Under Threshold
    ${login_ms}=    Measure Login Duration Milliseconds    ${VALID_EMAIL}    ${VALID_PASSWORD}
    Log    Login render time(ms): ${login_ms}
    Should Be True    ${login_ms} < ${MAX_LOGIN_RENDER_MS}
