# CardioAI: Abstract Document

## 1. Introduction

### 1.1 Brief overview of the Project
**CardioAI** is a premium, full-stack health-technology application designed to assist in the early detection and prediction of heart diseases. By leveraging Machine Learning (ML) techniques—specifically the Random Forest algorithm—the application analyzes various medical parameters provided by the user to assess their cardiovascular risk level. The system features a modern, glassmorphic web interface that provides real-time analysis and personalized health recommendations.

#### 1.1.1 Scope
The scope of this project involves:
*   Developing an interactive web-based interface for data entry and result visualization.
*   Implementing a robust backend using **FastAPI** to handle data processing and ML predictions.
*   Integrating a trained Machine Learning model to provide risk assessments (Low, Medium, High).
*   Providing actionable lifestyle and clinical recommendations based on individual risk profiles.
*   Deploying the application using containerization (Docker) for scalability and platform independence.

#### 1.1.2 Purpose
The primary purpose of CardioAI is to provide a preliminary screening tool that empowers individuals to monitor their heart health. It aims to bridge the gap between traditional medical checkups and digital health monitoring, encouraging users to seek professional medical advice early if high-risk factors are detected.

#### 1.1.3 Objective of the Study
*   To build an accurate prediction model using contemporary Machine Learning algorithms.
*   To create a user-friendly and aesthetically pleasing interface for medical data interaction.
*   To minimize the delay in identifying potential heart disease symptoms.
*   To provide data-driven lifestyle recommendations to improve overall cardiovascular health.

#### 1.1.4 Literature Survey
Recent studies in healthcare informatics highlight the increasing role of AI in predictive diagnostics. Traditional methods often rely on manual scoring (like the Framingham Risk Score), which may not capture complex non-linear relationships in medical data. Modern literature suggests that Ensemble methods like Random Forest and Gradient Boosting significantly outperform traditional statistical models in terms of accuracy and sensitivity when dealing with large medical datasets like the Cleveland Heart Disease dataset.

### 1.2 Problem Statement
Heart disease remains a leading cause of mortality globally. Many individuals are unaware of their risk factors until a critical cardiac event occurs. Existing diagnostic processes are often expensive, time-consuming, and inaccessible to everyone. There is a critical need for an automated, accessible, and reliable system that can provide an initial risk assessment based on standard clinical parameters (e.g., blood pressure, cholesterol, age, and ECG results).

### 1.3 Proposed System
The proposed system, **CardioAI**, is an advanced AI-driven diagnostic framework that bridges the gap between raw medical data and actionable clinical insights.

#### 1.3.1 Dataset Used
The system is trained and validated on the **Cleveland Heart Disease Dataset** from the UCI Machine Learning Repository. 
- **Sample Size:** 303 clinical records.
- **Features:** 14 critical parameters including age, chest pain type (cp), resting blood pressure (trestbps), serum cholesterol (chol), fasting blood sugar (fbs), maximum heart rate achieved (thalach), etc.
- **Target:** Presence of heart disease (Binary Classification).

#### 1.3.2 Algorithm: Random Forest Classifier
CardioAI utilizes the **Random Forest** algorithm, an ensemble learning method that constructs a multitude of decision trees during training.
- **Why Random Forest?** Unlike single decision trees, Random Forest prevents overfitting by averaging results from 100+ different trees. It is highly robust to outliers and excels at capturing complex non-linear relationships between medical factors (e.g., the interaction between age and cholesterol).
- **Process:** The model processes 13 clinical inputs, calculates feature importance, and outputs a probability score (Confidence Level) along with a risk category (Low, Medium, High).

#### 1.3.3 Difference: Existing vs. Proposed System

| Feature | Existing Systems (Traditional) | Proposed System (CardioAI) |
| :--- | :--- | :--- |
| **Methodology** | Manual scoring (Framingham) or simple linear regression. | Advanced Ensemble Learning (Random Forest). |
| **Accuracy** | Often lower due to manual bias and inability to handle non-linear data. | Higher accuracy by capturing hidden patterns across hundreds of decision trees. |
| **Output Type** | Usually binary (Yes/No). | Granular: Risk Percentage + Confidence Level + Severity. |
| **Speed** | Requires clinical visits and manual calculations. | Instantaneous results (under 1 second) via web-portal. |
| **Recommendations** | Generic or non-existent in software. | Personalized medical, diet, and lifestyle engine based on risk. |

---


---

## 2. System Analysis

### 2.1 System Study
The system study involves understanding the workflow of medical data from the point of user input to the final risk assessment. This includes data validation, feature scaling in the backend, and the presentation of results via the frontend.

#### 2.1.1 Feasibility Study
*   **Technical Feasibility:** The project uses Python (FastAPI) and Scikit-Learn, which are industry standards for ML. The frontend uses standard web technologies. All tools are open-source and well-documented.
*   **Operational Feasibility:** The system is designed for ease of use. Users only need to input their medical values into a wizard-style form. The output is presented in plain, actionable language.
*   **Economic Feasibility:** The system is built using open-source technologies, meaning no licensing costs are involved. It can be hosted on standard cloud infrastructure.

### 2.2 Requirement Analysis

#### 2.2.1 Functional Requirements
*   **Prediction Engine:** The system must accurately predict the risk level based on input features.
*   **Data Validation:** The system must ensure that the user inputs are within realistic physiological ranges.
*   **Report Generation:** The system should provide a summary of the assessment and recommendations.
*   **Interactive UI:** Dynamic charts and visual indicators represent health status.

#### 2.2.2 Non-Functional Requirements
*   **Performance:** Predictions should be returned in under 1 second.
*   **Usability:** The interface must be intuitive, requiring minimal technical or medical knowledge.
*   **Scalability:** The system should be able to handle multiple simultaneous requests via FastAPI’s asynchronous capabilities.
*   **Security:** Data validation to prevent injection attacks and ensure user privacy.

### 2.3 System Requirement Specification

#### 2.3.1 Hardware Requirements
*   **Processor:** Intel Core i3 or higher (or equivalent ARM like Apple M-series).
*   **RAM:** 4GB minimum (8GB recommended for running Docker containers).
*   **Storage:** 500MB of free disk space for application files and Docker images.
*   **Display:** Minimum resolution of 1024x768.

#### 2.3.2 Software Requirements
*   **Operating System:** Windows 10/11, macOS, or Linux.
*   **Runtime Environment:** Python 3.9 or higher.
*   **Containerization:** Docker and Docker Compose.
*   **Browser:** Modern web browsers (Chrome, Firefox, Safari, or Edge).

#### 2.3.3 Libraries Requirements
*   **fastapi:** For building high-performance APIs.
*   **uvicorn:** As the ASGI server for FastAPI.
*   **scikit-learn:** For machine learning model development and prediction.
*   **pandas:** For data manipulation and analysis.
*   **numpy:** For numerical computing.
*   **joblib:** For model persistence.
*   **pydantic:** For data validation and settings management.

---

## References
1. Detrano, R., et al. (1989). "International application of a new probability algorithm for the diagnosis of coronary artery disease." American Journal of Cardiology.
2. Breiman, L. (2001). "Random Forests." Machine Learning, 45(1), 5-32.
3. Dua, D. and Graff, C. (2019). UCI Machine Learning Repository. Irvine, CA: University of California, School of Information and Computer Science.
4. Kaggle Dataset: "Heart Disease Dataset" (Cleveland heart disease data).
5. FastAPI Documentation: https://fastapi.tiangolo.com/
