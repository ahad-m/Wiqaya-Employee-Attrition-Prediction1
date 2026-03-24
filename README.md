[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/tlv2tzQq)
# Wiqaya (وِقَايَة) — Employee Attrition Prediction System

An ML-powered system that predicts employee attrition in the Saudi government sector using **XGBoost classification** and **KMeans clustering**, served through an interactive **React dashboard**.

---

## Key Results

| Metric | Value |
|---|---:|
| Accuracy | **84%** |
| ROC-AUC | **92.5%** |
| Precision (Attrition) | **87%** |
| Recall (Attrition) | **74%** |
| F1-Score (Attrition) | **80%** |

### Confusion Matrix (239 test samples)

|  | Pred: Stay | Pred: Leave |
|---|---:|---:|
| Actually Stayed | **125 (TN)** | **11 (FP)** |
| Actually Left | **27 (FN)** | **76 (TP)** |

---

## Dataset

- **1,191** Saudi government employees surveyed across **10 sectors**
- **34 features**: demographics, salary, work environment, satisfaction, stress, career growth
- Binary target: **stayed vs left** (~**57% / 43%**)

---

## Methodology

### 1) Preprocessing

- Ordinal encoding for survey responses  
- Target encoding for **Sector**, **Department**, **JobTitle**
- **3 engineered features:**
  - `Salary_per_Experience = MonthlySalary / Years_Experience`
  - `Opportunity_Training_Score = Job_Opportunities + Training_programs`
  - `Experience_Gap_LastOrg = Years_Experience - Years_at_last_org`

**Final feature count:** **37**

---

### 2) Clustering (Unsupervised)

- **KMeans++ (K=3)** after **PCA (38 → 16 components, 81% variance)**
- **Silhouette Score:** **0.155**
- 4 composite scores: **Burnout**, **Stagnation**, **Disengagement**, **Compensation Gap**

| Cluster | Name | Size | Attrition |
|---:|---|---:|---:|
| 0 | Stagnant Veteran | 153 (16%) | 22.2% |
| 1 | Comfortable Employee | 363 (38%) | 35.3% |
| 2 | Exhausted & Frustrated | 436 (46%) | 57.3% |

---

### 3) Classification (Supervised)

- Best model: **XGBoost** (RandomizedSearchCV tuned)
- Train/test split: **80/20 stratified** (**952 / 239**)

| Model | Accuracy | ROC-AUC |
|---|---:|---:|
| XGBoost | **84%** | **92.5%** |
| Logistic Regression |  0.81% | 90% |

---

## Top 5 Feature Importances

1. Psychological Exhaustion — **18.7%**
2. Monthly Salary — **14.2%**
3. Overtime — **12.8%**
4. Years of Experience — **11.5%**
5. Recognition — **9.8%**

**Key finding:** Psychological exhaustion outweighs salary as the **#1 attrition driver**.

---

## Project Structure

```text
wiqaya/
├── data/
│   └── Original_Dataset_of_Employee_Attrition.xlsx
├── notebooks/
│   ├── 01_EDA.ipynb
│   ├── 02_Preprocessing.ipynb
│   ├── 03_Clustering2.ipynb
│   ├── 04_Classification.ipynb
│   └── 05_Feature_Importance.ipynb
├── models/
│   ├── best_model_XGBoost_0.9253_*.joblib
│   ├── target_encoder.pkl
│   └── hr_clustering_pipeline.joblib
├── app/
├── wiqaya/
│   ├── src/App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md

```
---

## Team & Roles

| Member | Responsibilities |
|---|---|
| **Ahad** | Preprocessing • Feature Engineerin • Clustering • Interface  |
| **Mooj** | EDA • Interface • Preprocessing • Clustering|
| **Abdoslamalsalm** | Preprocessing Feature • Engineering & Selection • Classification Training |
| **Majid** | Classification Training • Hyperparameter Tuning • Feature Engineering&Feature importance |
