#!/bin/bash

# Jenkins Setup Script for Recipe & Theme Forum Application
# This script helps set up Jenkins for CI/CD

echo "🚀 Setting up Jenkins for Recipe & Theme Forum Application..."

# Check if Jenkins is running
if ! systemctl is-active --quiet jenkins; then
    echo "❌ Jenkins is not running. Let's fix this..."
    
    # Try to start Jenkins on a different port
    echo "🔧 Starting Jenkins on port 8081..."
    sudo -u jenkins java -jar /usr/share/java/jenkins.war --httpPort=8081 &
    sleep 10
    
    # Check if Jenkins is now running
    if curl -f http://localhost:8081 > /dev/null 2>&1; then
        echo "✅ Jenkins is now running on http://localhost:8081"
        JENKINS_URL="http://localhost:8081"
    else
        echo "❌ Jenkins still not running. Please check manually."
        exit 1
    fi
else
    echo "✅ Jenkins is running on http://localhost:8080"
    JENKINS_URL="http://localhost:8080"
fi

# Get initial admin password
echo "🔑 Getting initial admin password..."
if [ -f /var/lib/jenkins/secrets/initialAdminPassword ]; then
    INITIAL_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)
    echo "📋 Initial Admin Password: $INITIAL_PASSWORD"
    echo "🌐 Jenkins URL: $JENKINS_URL"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Open $JENKINS_URL in your browser"
    echo "2. Use the password above to login"
    echo "3. Install suggested plugins"
    echo "4. Create admin user"
    echo "5. Create new pipeline job using the Jenkinsfile"
else
    echo "❌ Could not find initial admin password"
    echo "Please check Jenkins logs manually"
fi

echo ""
echo "📁 Your project files are ready:"
echo "- Jenkinsfile: CI/CD pipeline configuration"
echo "- jenkins-setup.sh: This setup script"
echo ""
echo "🎯 To create a Jenkins job:"
echo "1. Go to Jenkins dashboard"
echo "2. Click 'New Item'"
echo "3. Enter name: 'recipe-theme-forum'"
echo "4. Select 'Pipeline'"
echo "5. In Pipeline section, select 'Pipeline script from SCM'"
echo "6. Select 'Git' as SCM"
echo "7. Enter repository URL: https://github.com/dobbygotcheva/recipe-theme-forum.git"
echo "8. Set branch: main"
echo "9. Set script path: Jenkinsfile"
echo "10. Save and run the pipeline!"
