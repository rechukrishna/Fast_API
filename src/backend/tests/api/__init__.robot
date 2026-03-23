*** Settings ***
Resource    ../api_resources.robot
Suite Setup     Reset Test Database    Initialize Test Data Tracking
Suite Teardown  Delete Test Data By Tracked Ids
