pipeline {
    agent any

    parameters {
        booleanParam(
            name: 'PUBLISH',
            defaultValue: false,
            description: 'Publish both packages to npmjs (uses the versions in their package.json).'
        )
    }

    environment {
        // Jenkins credential of type "Secret text" holding an npmjs.com automation token
        NPM_TOKEN = credentials('npmjs-token')
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build kit') {
            steps {
                sh 'npm run build'
            }
        }

        // Publish runs only when the PUBLISH parameter is checked
        // (via "Build with Parameters"). Plain "Build" sticks to the
        // default (false) and skips this stage. Versions are read from
        // each workspace's package.json — bump and commit before running.
        stage('Publish to npmjs') {
            when { expression { params.PUBLISH } }
            steps {
                sh '''
                    # Token goes in the user npmrc, not the repo one (a project
                    # .npmrc would override developers' npm login credentials).
                    echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$HOME/.npmrc"
                    npm publish --workspace=@sensolus/snt-agent-kit
                    npm publish --workspace=@sensolus/create-snt-agent-app
                '''
            }
        }
    }
}
