import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

class ManagerAgent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.system_prompt = os.getenv("MANAGER_SYS_PROMPT")

    def generate_report(self, agent_outputs):
        """
        Generate a comprehensive report based on the outputs of specialized agents.
        
        :param agent_outputs: A dictionary containing the outputs from each specialized agent
        :return: A JSON object containing the aggregated report
        """
        # Prepare the input for the manager agent
        input_content = json.dumps(agent_outputs, indent=2)
        
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"Here are the outputs from our specialized agents:\n\n{input_content}\n\nPlease analyze these outputs and generate a comprehensive security report."}
        ]

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.2,
                max_tokens=2000
            )
            
            report = json.loads(response.choices[0].message.content)
            return report
        except Exception as e:
            print(f"An error occurred while generating the report: {str(e)}")
            return None

    def update_dashboard(self, report):
        """
        Update the dashboard with the latest report data.
        This method would interact with the GUI to update displayed information.
        
        :param report: The JSON report generated by the manager agent
        """
        # This is a placeholder for the actual implementation
        # In a real-world scenario, this method would update the GUI
        # For now, we'll just print the report
        print("Updating dashboard with the following report:")
        print(json.dumps(report, indent=2))

def main():
    # Initialize the manager agent
    manager = ManagerAgent()

    # Simulate outputs from specialized agents
    agent_outputs = {
        "security_scanner": {
            "vulnerabilities": [
                {"severity": "high", "description": "SQL Injection vulnerability in login form"},
                {"severity": "medium", "description": "Cross-Site Scripting (XSS) in comment section"}
            ],
            "scan_coverage": 0.95
        },
        "code_quality_checker": {
            "issues": [
                {"type": "maintainability", "description": "Complex method in UserController exceeds cyclomatic complexity threshold"},
                {"type": "style", "description": "Inconsistent naming conventions in utility functions"}
            ],
            "overall_score": 7.5
        },
        "performance_analyzer": {
            "bottlenecks": [
                {"location": "Database queries in ProductService", "impact": "high"},
                {"location": "Image processing in MediaController", "impact": "medium"}
            ],
            "average_response_time": 250  # milliseconds
        },
        "dependency_auditor": {
            "outdated_dependencies": [
                {"name": "react", "current_version": "17.0.2", "latest_version": "18.2.0"},
                {"name": "lodash", "current_version": "4.17.20", "latest_version": "4.17.21"}
            ],
            "vulnerable_dependencies": [
                {"name": "axios", "version": "0.21.1", "vulnerability": "CVE-2023-45857"}
            ]
        }
    }

    # Generate the report
    report = manager.generate_report(agent_outputs)

    if report:
        # Update the dashboard with the generated report
        manager.update_dashboard(report)
    else:
        print("Failed to generate the report.")

if __name__ == "__main__":
    main()