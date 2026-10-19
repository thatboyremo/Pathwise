from django.core.management.base import BaseCommand
from jobs.models import Job


class Command(BaseCommand):

    help = "Populate the database with development job opportunities"

    def handle(self, *args, **options):

        jobs = [

            # ==========================================================
            # DATA ANALYST
            # ==========================================================

            {
                "title": "Junior Data Analyst",
                "company": "Pathwise Analytics",
                "location": "Remote",
                "job_type": "remote",
                "experience": "entry",
                "salary": "$45,000 - $60,000",
                "description": (
                    "Analyze business data, create dashboards, "
                    "prepare reports and identify useful trends."
                ),
                "requirements": (
                    "Python, SQL, Excel, Pandas, Data Analysis, "
                    "Power BI, Statistics"
                ),
            },

            {
                "title": "Data Analyst",
                "company": "Northstar Technologies",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$55,000 - $75,000",
                "description": (
                    "Work with product and business teams to analyze "
                    "data and produce actionable insights."
                ),
                "requirements": (
                    "Python, SQL, Excel, Pandas, NumPy, "
                    "Power BI, Tableau, Statistics"
                ),
            },

            {
                "title": "Business Intelligence Analyst",
                "company": "InsightWorks",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$60,000 - $82,000",
                "description": (
                    "Build business intelligence reports and dashboards "
                    "to support data-driven decision making."
                ),
                "requirements": (
                    "SQL, Power BI, Tableau, Excel, Python, "
                    "Data Visualization, Statistics"
                ),
            },

            {
                "title": "Data Analytics Intern",
                "company": "DataBridge",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Support analysts with data cleaning, reporting "
                    "and exploratory data analysis."
                ),
                "requirements": (
                    "Python, Pandas, SQL, Excel, Statistics"
                ),
            },

            # ==========================================================
            # DATA SCIENCE
            # ==========================================================

            {
                "title": "Junior Data Scientist",
                "company": "Nova Analytics",
                "location": "Remote",
                "job_type": "remote",
                "experience": "junior",
                "salary": "$65,000 - $85,000",
                "description": (
                    "Develop machine learning models and perform "
                    "exploratory analysis on business datasets."
                ),
                "requirements": (
                    "Python, Pandas, NumPy, Scikit-learn, "
                    "Machine Learning, SQL, Statistics"
                ),
            },

            {
                "title": "Data Science Intern",
                "company": "QuantLabs",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Assist the data science team with data preparation, "
                    "visualization and machine learning experiments."
                ),
                "requirements": (
                    "Python, Pandas, NumPy, Matplotlib, "
                    "Scikit-learn, Statistics"
                ),
            },

            {
                "title": "Machine Learning Engineer",
                "company": "IntelliCore",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$75,000 - $100,000",
                "description": (
                    "Develop, evaluate and deploy machine learning "
                    "models for production applications."
                ),
                "requirements": (
                    "Python, Scikit-learn, Machine Learning, "
                    "Pandas, NumPy, SQL, Git, Docker"
                ),
            },

            {
                "title": "Junior Machine Learning Engineer",
                "company": "AI Forge",
                "location": "Remote",
                "job_type": "remote",
                "experience": "junior",
                "salary": "$70,000 - $95,000",
                "description": (
                    "Build and improve machine learning pipelines "
                    "and collaborate with software engineers."
                ),
                "requirements": (
                    "Python, Machine Learning, Scikit-learn, "
                    "TensorFlow, Git, SQL"
                ),
            },

            {
                "title": "AI Engineering Intern",
                "company": "FutureMind AI",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Support AI engineers with experimentation, "
                    "data preparation and model evaluation."
                ),
                "requirements": (
                    "Python, Machine Learning, Pandas, NumPy, "
                    "Git, Statistics"
                ),
            },

            # ==========================================================
            # PYTHON / DJANGO
            # ==========================================================

            {
                "title": "Junior Python Developer",
                "company": "CodeCraft",
                "location": "Remote",
                "job_type": "remote",
                "experience": "junior",
                "salary": "$55,000 - $75,000",
                "description": (
                    "Develop backend applications and APIs using Python."
                ),
                "requirements": (
                    "Python, Django, REST API, Git, SQL, PostgreSQL"
                ),
            },

            {
                "title": "Django Developer",
                "company": "WebStack Solutions",
                "location": "Remote",
                "job_type": "contract",
                "experience": "junior",
                "salary": "$30 - $45/hour",
                "description": (
                    "Build and maintain Django applications and "
                    "RESTful APIs."
                ),
                "requirements": (
                    "Python, Django, Django REST Framework, "
                    "REST API, PostgreSQL, Git"
                ),
            },

            {
                "title": "Backend Developer",
                "company": "CloudBridge",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$65,000 - $90,000",
                "description": (
                    "Build scalable backend services and APIs."
                ),
                "requirements": (
                    "Python, Django, REST API, PostgreSQL, "
                    "Docker, Git, Linux"
                ),
            },

            {
                "title": "Python Software Engineering Intern",
                "company": "DevLaunch",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Work alongside software engineers on Python "
                    "applications and backend services."
                ),
                "requirements": (
                    "Python, Git, SQL, Django, REST API"
                ),
            },

            # ==========================================================
            # SOFTWARE ENGINEERING
            # ==========================================================

            {
                "title": "Junior Software Developer",
                "company": "TechNova",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$60,000 - $80,000",
                "description": (
                    "Develop software features and collaborate with "
                    "product and engineering teams."
                ),
                "requirements": (
                    "Python, JavaScript, Git, SQL, "
                    "Data Structures, Algorithms"
                ),
            },

            {
                "title": "Software Engineering Intern",
                "company": "BuildLabs",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Contribute to software projects while learning "
                    "modern development practices."
                ),
                "requirements": (
                    "Python, JavaScript, Git, SQL, "
                    "Data Structures, Algorithms"
                ),
            },

            {
                "title": "Full Stack Developer",
                "company": "DigitalWorks",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$65,000 - $90,000",
                "description": (
                    "Develop modern web applications across the "
                    "frontend and backend."
                ),
                "requirements": (
                    "Python, Django, React, TypeScript, "
                    "JavaScript, SQL, Git"
                ),
            },

            # ==========================================================
            # FRONTEND
            # ==========================================================

            {
                "title": "Junior Frontend Developer",
                "company": "PixelForge",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$55,000 - $75,000",
                "description": (
                    "Build responsive and accessible web interfaces."
                ),
                "requirements": (
                    "HTML, CSS, JavaScript, React, TypeScript, Git"
                ),
            },

            {
                "title": "React Developer",
                "company": "Interface Labs",
                "location": "Remote",
                "job_type": "contract",
                "experience": "junior",
                "salary": "$35 - $50/hour",
                "description": (
                    "Build reusable React components and modern "
                    "frontend applications."
                ),
                "requirements": (
                    "React, TypeScript, JavaScript, HTML, CSS, "
                    "Tailwind CSS, Git"
                ),
            },

            # ==========================================================
            # CYBERSECURITY
            # ==========================================================

            {
                "title": "Junior Cybersecurity Analyst",
                "company": "SecureNet",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$60,000 - $82,000",
                "description": (
                    "Monitor security events and support incident "
                    "response and vulnerability management."
                ),
                "requirements": (
                    "Cybersecurity, Networking, Linux, "
                    "Python, SIEM, TCP/IP"
                ),
            },

            {
                "title": "Cybersecurity Intern",
                "company": "CyberShield",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Assist security teams with monitoring, analysis "
                    "and security investigations."
                ),
                "requirements": (
                    "Cybersecurity, Networking, Linux, "
                    "TCP/IP, Python"
                ),
            },

            # ==========================================================
            # IT / NETWORKING
            # ==========================================================

            {
                "title": "IT Support Specialist",
                "company": "Enterprise Systems",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "entry",
                "salary": "$45,000 - $60,000",
                "description": (
                    "Provide technical support and troubleshoot "
                    "hardware, software and network issues."
                ),
                "requirements": (
                    "IT Support, Networking, Windows, Linux, "
                    "Troubleshooting, TCP/IP"
                ),
            },

            {
                "title": "Junior Network Engineer",
                "company": "NetworkCore",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$55,000 - $78,000",
                "description": (
                    "Support network infrastructure and troubleshoot "
                    "network connectivity issues."
                ),
                "requirements": (
                    "Networking, TCP/IP, Routing, Switching, "
                    "Cisco, Linux"
                ),
            },

            {
                "title": "Network Engineering Intern",
                "company": "ConnectIT",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Assist network engineers with infrastructure "
                    "monitoring and configuration."
                ),
                "requirements": (
                    "Networking, TCP/IP, Routing, Switching, "
                    "Linux"
                ),
            },

            # ==========================================================
            # CLOUD
            # ==========================================================

            {
                "title": "Junior Cloud Engineer",
                "company": "CloudSphere",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "junior",
                "salary": "$65,000 - $90,000",
                "description": (
                    "Support cloud infrastructure and deployment "
                    "automation."
                ),
                "requirements": (
                    "AWS, Docker, Linux, Python, Git, "
                    "Cloud Computing"
                ),
            },

            {
                "title": "Cloud Engineering Intern",
                "company": "SkyStack",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Assist with cloud infrastructure and "
                    "deployment workflows."
                ),
                "requirements": (
                    "AWS, Linux, Python, Git, Docker"
                ),
            },

            # ==========================================================
            # GENERAL ENTRY LEVEL
            # ==========================================================

            {
                "title": "Graduate Software Developer",
                "company": "NextGen Technologies",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "entry",
                "salary": "$50,000 - $70,000",
                "description": (
                    "Graduate development opportunity for candidates "
                    "interested in software engineering."
                ),
                "requirements": (
                    "Python, JavaScript, Git, SQL, "
                    "Data Structures, Algorithms"
                ),
            },

            {
                "title": "Graduate Technology Analyst",
                "company": "TechBridge",
                "location": "Remote",
                "job_type": "full-time",
                "experience": "entry",
                "salary": "$50,000 - $68,000",
                "description": (
                    "Analyze technology processes and support "
                    "digital transformation projects."
                ),
                "requirements": (
                    "Python, SQL, Data Analysis, Excel, "
                    "Communication, Problem Solving"
                ),
            },

            {
                "title": "Junior Technical Consultant",
                "company": "Digital Advisory",
                "location": "Remote",
                "job_type": "contract",
                "experience": "junior",
                "salary": "$30 - $45/hour",
                "description": (
                    "Assist clients with technology solutions "
                    "and technical problem solving."
                ),
                "requirements": (
                    "Python, SQL, Networking, Communication, "
                    "Problem Solving, Git"
                ),
            },

            {
                "title": "Research Assistant - AI",
                "company": "AI Research Lab",
                "location": "Remote",
                "job_type": "part-time",
                "experience": "entry",
                "salary": "$25 - $35/hour",
                "description": (
                    "Assist researchers with machine learning "
                    "experiments, data analysis and literature review."
                ),
                "requirements": (
                    "Python, Machine Learning, Pandas, "
                    "NumPy, Statistics, Research"
                ),
            },

            {
                "title": "Data Science Graduate Intern",
                "company": "ModelWorks",
                "location": "Remote",
                "job_type": "internship",
                "experience": "entry",
                "salary": "Paid Internship",
                "description": (
                    "Gain practical experience building data science "
                    "and machine learning solutions."
                ),
                "requirements": (
                    "Python, Pandas, NumPy, Scikit-learn, "
                    "Machine Learning, SQL"
                ),
            },

        ]

        created = 0
        updated = 0

        for data in jobs:

            job, was_created = Job.objects.update_or_create(

                title=data["title"],
                company=data["company"],

                defaults={
                    "location": data["location"],
                    "job_type": data["job_type"],
                    "experience": data["experience"],
                    "salary": data["salary"],
                    "description": data["description"],
                    "requirements": data["requirements"],

                    # Development URL.
                    # Replace these with real application URLs
                    # when connecting a live jobs source.
                    "apply_url": "https://example.com",

                    "source": "Pathwise Demo",
                    "featured": data["experience"] == "entry",
                },
            )

            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nJob database populated successfully."
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Updated: {updated}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Total jobs: {Job.objects.count()}"
            )
        )