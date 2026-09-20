pipeline {
    agent any
   environment {
        PATH = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    }

    stages {

        stage('Clone') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/GElavarasiA/Resume-Analyzer.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t resume-analyzer:latest .'
            }
        }

        stage('Stop Old Container') {
            steps {
                sh 'docker stop resume-analyzer-app || true'
                sh 'docker rm resume-analyzer-app || true'
            }
        }

        stage('Run New Container') {
            steps {
                sh 'docker run -d --name resume-analyzer-app -p 3000:3000 --restart unless-stopped resume-analyzer:latest'
            }
        }
    }

    post {
        success {
            echo 'Resume Analyzer deployed successfully!'
        }

        failure {
            echo 'Deployment failed. Check the Jenkins console output.'
        }
    }
}