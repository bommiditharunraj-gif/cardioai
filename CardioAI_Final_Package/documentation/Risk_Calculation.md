# CardioAI Risk Calculation Logic

The CardioAI system calculates a patient's risk profile (Low, Medium, High) using a two-stage approach. First, it utilizes an advanced Machine Learning model to evaluate the likelihood of cardiovascular disease based on clinical inputs. Second, it applies an explicit clinical rules engine to determine the final, actionable risk severity.

## 1. Primary AI Prediction Layer
When a patient submits their health data (including age, blood pressure, cholesterol, chest pain type, max heart rate, etc.), the data is passed to the core AI model (`heart_disease_model.pkl`).

The model outputs two primary values:
1.  **Prediction ($P$):** A binary classification.
    *   `P = 1`: Indicates the presence of heart disease markers.
    *   `P = 0`: Indicates the absence of significant heart disease markers.
2.  **Confidence ($C$):** A probability value between $0.0$ and $1.0$ (0% to 100%) indicating how certain the model is about its prediction.

## 2. Clinical Rules Engine (Risk Stratification)
To convert the raw AI prediction into actionable categories (Low, Medium, High), the system uses a heuristic rules engine defined in the `predict` function of the backend API.

The engine evaluates three key variables:
*   **Prediction ($P$)** from the AI model.
*   **Confidence ($C$)** from the AI model.
*   **Chest Pain Type (`cp`)**: Symptomatic indicator (0 = Asymptomatic, > 0 = Angina types).
*   **Fluoroscopy Vessels (`ca`)**: Number of major vessels (0-3) colored by fluoroscopy (indicates blockage or calcification).

### The Updated Logic Tree (Phase 2)

The system now maps frontend values to clinical standards (adjusting for 0-indexing) and uses a more sensitive classification system:

```python
# Map frontend to clinical standards
mapped_data['cp'] += 1 # UCI starts at 1
mapped_data['slope'] += 1
mapped_data['thal'] = thal_mapping[data.thal]

# Classification logic
if prediction == 1:
    # Prediction suggests disease
    if confidence >= 0.65 or data.cp < 2 or data.ca > 0 or data.oldpeak > 2.0:
        risk_level = "High"
    else:
        risk_level = "Medium"
else:
    # Prediction suggests NO disease (Safety-Net Layer)
    if data.trestbps > 165 or data.chol > 300 or data.oldpeak > 2.5:
        risk_level = "High" # Dangerously high markers override prediction
    elif data.trestbps > 140 or data.chol > 240 or data.age > 70 or data.ca > 0 or confidence < 0.7:
        risk_level = "Medium" # Warning signs or model uncertainty
    else:
        risk_level = "Low"
```

### Explanation of Risk Categories:

#### 🟢 Low Risk
*   **Condition:** Model predicts **Negative** AND all vitals are within normal/pre-hypertensive ranges.
*   **Confidence:** Requires higher certainty from the model ($C \ge 0.7$).

#### 🟡 Medium Risk
*   **Condition:** 
    *   Model predicts **Positive** but with lower confidence and mild symptoms.
    *   **OR** Model predicts **Negative** but vitals show warning signs (e.g., BP > 140 or Cholesterol > 240).
    *   **OR** Patient is over 70 years old or has visible vessels (CA > 0).

#### 🔴 High Risk
*   **Condition:**
    *   Model predicts **Positive** with strong indicators (Confidence > 0.65, Typical/Atypical Angina, or physical blockages).
    *   **OR** Vitals are in the critical danger zone (BP > 165, Cholesterol > 300, or Oldpeak > 2.5) regardless of AI prediction.
*   **Action:** Immediate clinical intervention requested.

