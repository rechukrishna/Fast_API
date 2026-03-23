*** Settings ***
Resource    ../api_resources.robot
Library    Collections
Suite Setup     Product Suite Setup
Suite Teardown  Product Suite Teardown

*** Keywords ***
Product Suite Setup
    Reset Test Database
    Create API Session
    ${ids}=    Create List
    Set Suite Variable    ${CREATED_PRODUCT_IDS}    ${ids}
    ${test_products}=    Load Product Test Data
    FOR    ${product}    IN    @{test_products}
        ${body}=    Create Dictionary    name=${product}[name]    price=${product}[price]    stock=${product}[stock]
        ${resp}=    POST On Session    api    /products    json=${body}
        ${product_id}=    Set Variable    ${resp.json()}[id]
        Register Product For Teardown    ${product_id}
    END

Product Suite Teardown
    Create API Session
    FOR    ${product_id}    IN    @{CREATED_PRODUCT_IDS}
        Run Keyword And Ignore Error    DELETE On Session    api    /products/${product_id}
    END

*** Test Cases ***
List Products Returns Seed Data And Test Data
    Create API Session
    ${resp}=    GET On Session    api    /products
    Status Should Be    200    ${resp}
    ${products}=    Set Variable    ${resp.json()}
    Length Should Be    ${products}    ${13}
    ${names}=    Create List
    FOR    ${p}    IN    @{products}
        Append To List    ${names}    ${p}[name]
    END
    Should Contain    ${names}    Laptop Pro 15
    Should Contain    ${names}    Test Product
    Should Contain    ${names}    Suite Test Widget
    Should Contain    ${names}    API Test Gadget

Get Product By Id
    Create API Session
    ${resp}=    GET On Session    api    /products/1
    Status Should Be    200    ${resp}
    Should Be Equal As Strings    ${resp.json()}[name]    Laptop Pro 15
    Dictionary Should Contain Key    ${resp.json()}    id
    Dictionary Should Contain Key    ${resp.json()}    price
    Dictionary Should Contain Key    ${resp.json()}    stock

Get Product Not Found Returns 404
    Create API Session
    ${resp}=    GET On Session    api    /products/99999    expected_status=404
    Status Should Be    404    ${resp}
    Should Contain    ${resp.json()}[detail]    Product not found

Post Product Creates New Product
    Create API Session
    ${body}=    Create Dictionary    name=New Product    price=299.99    stock=15
    ${resp}=    POST On Session    api    /products    json=${body}
    Status Should Be    201    ${resp}
    ${product_id}=    Set Variable    ${resp.json()}[id]
    Register Product For Teardown    ${product_id}
    Should Be Equal As Strings    ${resp.json()}[name]    New Product
    Should Be Equal As Numbers    ${resp.json()}[price]    299.99
    Should Be Equal As Integers    ${resp.json()}[stock]    ${15}
    Dictionary Should Contain Key    ${resp.json()}    id
