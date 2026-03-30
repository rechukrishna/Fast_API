pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        BACKEND_DIR = 'src/backend'
        FRONTEND_DIR = 'src/frontend'
        FRONTEND_ROBOT_RESULTS_DIR = 'src/frontend/robot-selenium/results'
        CI = 'true'
        PLAYWRIGHT_SKIP_WEBSERVER = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Start Services') {
            steps {
                dir(env.BACKEND_DIR) {
                    bat 'docker-compose up -d db api frontend'
                    bat 'ping 127.0.0.1 -n 31 > nul'
                }
            }
        }

        stage('Run API Tests') {
            steps {
                dir(env.BACKEND_DIR) {
                    bat 'docker-compose --profile test run --rm robot-tests'
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'npm ci'
                    bat 'npx playwright install chromium'
                    bat 'npx playwright test'
                }
            }
        }

        stage('Setup Frontend Robot Selenium') {
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'py -m pip install -r robot-selenium\\requirements-ui-selenium.txt'
                    bat 'powershell -NoProfile -ExecutionPolicy Bypass -File robot-selenium\\scripts\\prepare-chromedriver.ps1'
                }
            }
        }

        stage('Run Frontend Robot Selenium - Login') {
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'set HEADLESS=TRUE && set CHROME_DRIVER=%WORKSPACE%\\src\\frontend\\robot-selenium\\drivers\\chromedriver.exe && robot --output output-login.xml --log log-login.html --report report-login.html -d robot-selenium\\results robot-selenium\\ui\\login.robot'
                }
            }
        }

        stage('Run Frontend Robot Selenium - Users') {
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'set HEADLESS=TRUE && set CHROME_DRIVER=%WORKSPACE%\\src\\frontend\\robot-selenium\\drivers\\chromedriver.exe && robot --output output-users.xml --log log-users.html --report report-users.html -d robot-selenium\\results robot-selenium\\ui\\users.robot'
                }
            }
        }

        stage('Run Frontend Robot Selenium - Products') {
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'set HEADLESS=TRUE && set CHROME_DRIVER=%WORKSPACE%\\src\\frontend\\robot-selenium\\drivers\\chromedriver.exe && robot --output output-products.xml --log log-products.html --report report-products.html -d robot-selenium\\results robot-selenium\\ui\\products.robot'
                }
            }
        }

        stage('Run Frontend Robot Selenium - Orders') {
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'set HEADLESS=TRUE && set CHROME_DRIVER=%WORKSPACE%\\src\\frontend\\robot-selenium\\drivers\\chromedriver.exe && robot --output output-orders.xml --log log-orders.html --report report-orders.html -d robot-selenium\\results robot-selenium\\ui\\orders.robot'
                }
            }
        }

        stage('Run Frontend Robot Selenium - Performance') {
            steps {
                dir(env.FRONTEND_DIR) {
                    bat 'set HEADLESS=TRUE && set CHROME_DRIVER=%WORKSPACE%\\src\\frontend\\robot-selenium\\drivers\\chromedriver.exe && robot --output output-performance.xml --log log-performance.html --report report-performance.html -d robot-selenium\\results robot-selenium\\ui\\performance.robot'
                }
            }
        }
    }

    post {
        always {
            dir(env.BACKEND_DIR) {
                bat 'docker-compose down -v'
            }
            script {
                def outputExists = fileExists "${env.BACKEND_DIR}/tests/results/output.xml"
                if (outputExists) {
                    robot outputPath: "${env.BACKEND_DIR}/tests/results"
                    archiveArtifacts artifacts: "${env.BACKEND_DIR}/tests/results/report.html, ${env.BACKEND_DIR}/tests/results/log.html", allowEmptyArchive: true
                }
                def frontendRobotOutputExists = fileExists "${env.FRONTEND_ROBOT_RESULTS_DIR}/output-login.xml"
                if (frontendRobotOutputExists) {
                    robot outputPath: "${env.FRONTEND_ROBOT_RESULTS_DIR}"
                    archiveArtifacts artifacts: "${env.FRONTEND_ROBOT_RESULTS_DIR}/report-*.html, ${env.FRONTEND_ROBOT_RESULTS_DIR}/log-*.html, ${env.FRONTEND_ROBOT_RESULTS_DIR}/output-*.xml", allowEmptyArchive: true
                }
                junit allowEmptyResults: true, testResults: "${env.FRONTEND_DIR}/test-results/*.xml"
                def playwrightReportExists = fileExists "${env.FRONTEND_DIR}/playwright-report/index.html"
                if (playwrightReportExists) {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.FRONTEND_DIR}/playwright-report",
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report',
                        reportTitles: ''
                    ])
                    archiveArtifacts artifacts: "${env.FRONTEND_DIR}/playwright-report/", allowEmptyArchive: true
                }
            }
        }
    }
}
