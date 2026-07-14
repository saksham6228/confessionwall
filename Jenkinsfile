// =============================================
//   Jenkinsfile — Confession Wall CI/CD Pipeline
// =============================================
// This file tells Jenkins exactly what to do, step by step,
// every time it runs. Jenkins reads this automatically once
// you point a "Pipeline" job at your GitHub repo.

pipeline {

    // "agent any" means: run this on any available Jenkins machine/server.
    // Since your Jenkins is likely running on the same AWS server you've
    // been using, this will run right there.
    agent any

    stages {

        // ---------------------------------------------
        // STAGE 1: Checkout code from GitHub
        // ---------------------------------------------
        // Jenkins does this automatically when connected to a GitHub
        // repo, but it's good practice to show it explicitly as a stage.
        stage('Checkout') {
            steps {
                echo 'Pulling latest code from GitHub...'
                checkout scm
            }
        }

        // ---------------------------------------------
        // STAGE 2: Stop any old running containers
        // ---------------------------------------------
        // This prevents port conflicts if a previous build is still running.
        stage('Stop Old Containers') {
            steps {
                echo 'Stopping any previously running containers...'
                sh 'docker compose down || true'
                // "|| true" means: don't fail the pipeline if there was
                // nothing running to stop (first-ever run, for example).
            }
        }

        // ---------------------------------------------
        // STAGE 3: Build all three Docker images
        // ---------------------------------------------
        stage('Build') {
            steps {
                echo 'Building frontend, backend, and database images...'
                sh 'docker compose build'
            }
        }

        // ---------------------------------------------
        // STAGE 4: Deploy — start all three containers
        // ---------------------------------------------
        stage('Deploy') {
            steps {
                echo 'Starting all containers...'
                sh 'docker compose up -d'
            }
        }

        // ---------------------------------------------
        // STAGE 5: Verify the deployment worked
        // ---------------------------------------------
        stage('Health Check') {
            steps {
                echo 'Waiting for services to be ready...'
                sh 'sleep 15'
                echo 'Checking backend health...'
                sh 'curl -f http://localhost:3000/api/health || exit 1'
            }
        }
    }

    // ---------------------------------------------
    // POST-BUILD ACTIONS
    // ---------------------------------------------
    // These run regardless of whether the pipeline succeeded or failed,
    // giving you a clear message either way.
    post {
        success {
            echo 'Pipeline completed successfully! Confession Wall is live.'
        }
        failure {
            echo 'Pipeline failed. Check the logs above to see which stage broke.'
        }
    }
}
