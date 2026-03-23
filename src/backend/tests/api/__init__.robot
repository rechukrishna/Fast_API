*** Settings ***
Resource    ../api_resources.robot
Suite Setup     Initialize Test Data Tracking
Suite Teardown  Delete Test Data By Tracked Ids
