// =============================================
//   Jenkinsfile — Confession Wall CI/CD Pipeline
//   (using three separate Dockerfiles, no docker-compose)
//   Ports chosen to be unique on a shared training server
// =============================================

pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Removing old containers and network if they exist...'
                sh 'docker rm -f confession-db-saksham confession-backend-saksham confession-frontend-saksham || true'
                sh 'docker network rm confession-net-saksham || true'
            }
        }

        stage('Create Network') {
            steps {
                echo 'Creating Docker network...'
                sh 'docker network create confession-net-saksham'
            }
        }

        stage('Database') {
            steps {
                echo 'Building and starting database container...'
                sh 'docker build -f Dockerfile.database -t confession-db-saksham .'
                sh 'docker run -d --name confession-db-saksham --network confession-net-saksham -p 3916:3306 confession-db-saksham'
                echo 'Waiting for MySQL to initialize...'
                sh 'sleep 20'
            }
        }

        stage('Backend') {
            steps {
                echo 'Building and starting backend container...'
                sh 'docker build -f Dockerfile.backend -t confession-backend-saksham .'
                sh 'docker run -d --name confession-backend-saksham --network confession-net-saksham -p 3917:3000 -e DB_HOST=confession-db-saksham confession-backend-saksham'
            }
        }

        stage('Frontend') {
            steps {
                echo 'Building and starting frontend container...'
                sh 'docker build -f Dockerfile.frontend -t confession-frontend-saksham .'
                sh 'docker run -d --name confession-frontend-saksham -p 8917:80 confession-frontend-saksham'
            }
        }

        stage('Health Check') {
            steps {
                echo 'Checking backend health...'
                sh 'sleep 5'
                sh 'curl -f http://localhost:3917/api/health || exit 1'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Confession Wall is live on port 8917.'
        }
        failure {
            echo 'Pipeline failed. Check the logs above to see which stage broke.'
        }
    }
}
