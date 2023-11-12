pipeline {
    agent {
        docker {
            image 'node:20-bullseye' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'cd server && npm install' 
                sh 'cd server && npm run build' 
            }
        }
    }
}