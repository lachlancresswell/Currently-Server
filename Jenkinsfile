pipeline {
    agent any

    stages {
        stage('Test Docker Compose') {
            steps {
                script {
                    // Navigate to the directory with your docker-compose.yml
                    // Assuming docker-compose.yml is in the root of your project
                    sh 'docker compose up -d'

                    // Run tests that interact with the InfluxDB service
                    sh './test_database.sh'

                    // Take down the services after tests are complete
                    sh 'docker compose down'
                }
            }
        }
    }

    post {
        always {
            // Clean up, ensure docker-compose services are down
            sh 'docker compose down'
        }
    }
}
