// =============================================
//   Jenkinsfile — Confession Wall CI/CD Pipeline
//   (using three separate Dockerfiles, no docker-compose)
// =============================================

pipeline {

    agent any

    stages {

        // ---------------------------------------------
        // STAGE 1: Checkout code from GitHub
        // ---------------------------------------------
        stage('Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        // ---------------------------------------------
        // STAGE 2: Clean up any old containers/network
        // ---------------------------------------------
        stage('Cleanup') {
            steps {
                echo 'Removing old containers and network if they exist...'
                sh 'docker rm -f confession-db confession-backend confession-frontend || true'
                sh 'docker network rm confession-net || true'
            }
        }

        // ---------------------------------------------
        // STAGE 3: Create the shared network
        // ---------------------------------------------
        stage('Create Network') {
            steps {
                echo 'Creating Docker network...'
                sh 'docker network create confession-net'
            }
        }

        // ---------------------------------------------
        // STAGE 4: Build and run the database
        // ---------------------------------------------
        stage('Database') {
            steps {
                echo 'Building and starting database container...'
                sh 'docker build -f Dockerfile.database -t confession-db .'
                sh 'docker run -d --name confession-db --network confession-net -p 3306:3306 confession-db'
                echo 'Waiting for MySQL to initialize...'
                sh 'sleep 20'
            }
        }

        // ---------------------------------------------
        // STAGE 5: Build and run the backend
        // ---------------------------------------------
        stage('Backend') {
            steps {
                echo 'Building and starting backend container...'
                sh 'docker build -f Dockerfile.backend -t confession-backend .'
                sh 'docker run -d --name confession-backend --network confession-net -p 3000:3000 -e DB_HOST=confession-db confession-backend'
            }
        }

        // ---------------------------------------------
        // STAGE 6: Build and run the frontend
        // ---------------------------------------------
        stage('Frontend') {
            steps {
                echo 'Building and starting frontend container...'
                sh 'docker build -f Dockerfile.frontend -t confession-frontend .'
                sh 'docker run -d --name confession-frontend -p 8080:80 confession-frontend'
            }
        }

        // ---------------------------------------------
        // STAGE 7: Verify the deployment worked
        // ---------------------------------------------
        stage('Health Check') {
            steps {
                echo 'Checking backend health...'
                sh 'sleep 5'
                sh 'curl -f http://localhost:3000/api/health || exit 1'
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! Confession Wall is live.'
        }
        failure {
            echo 'Pipeline failed. Check the logs above to see which stage broke.'
        }
    }
}
