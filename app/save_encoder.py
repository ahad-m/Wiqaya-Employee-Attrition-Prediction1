import joblib
import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from category_encoders import TargetEncoder


# ─── نفس خطوات النوتبوك الأصلي ───────────────

df = pd.read_excel("data/Original Dataset of Employee Attrition.xlsx")

df.drop(columns=['ID'], inplace=True)
df.columns = df.columns.str.strip()

for col in df.select_dtypes(include='object').columns:
    df[col] = df[col].str.strip().str.lower()

dfcopy = df.copy()

# Binary
binary_cols = [
    'Attrition', 'MedicalInsurance', 'Bonus', 'OverTime',
    'Rewards&Wages_Satisfaction', 'Get_ Deserved_Promotion',
    'Useful_Training_Programs', 'Recognition',
    'Job_Stability', 'Health_Issues', 'Job_Opportunities'
]
for col in binary_cols:
    dfcopy[col] = dfcopy[col].map({'yes': 1, 'no': 0})

dfcopy["Gender"] = dfcopy["Gender"].map({'male': 0, 'female': 1})

dfcopy["Physical_Stress"]          = dfcopy["Physical_Stress"].map({'no': 0, 'sometimes': 1, 'yes': 2})
dfcopy["Psychological_Exhaustion"] = dfcopy["Psychological_Exhaustion"].map({'no': 0, 'sometimes': 1, 'yes': 2})

dfcopy["Age"] = dfcopy["Age"].map({'21 to 30': 1, '31 to 40': 2, '41 to 50': 3, '51 to 60': 4})

dfcopy["Academic_degree"] = dfcopy["Academic_degree"].map({
    'diploma or secondary': 1, "bachelor's": 2, "master's": 3, 'ph.d': 4
})

dfcopy['MonthlySalary'] = dfcopy['MonthlySalary'].map({
    'less than 5000 sar': 1, 'from 5000 to 10000 s.r': 2,
    'from 11000 to 15000 s.r': 3, 'from 16000 to 20000 s.r': 4,
    'from 21000 to 25000 s.r': 5, 'from 26000 to 30000 s.r': 6,
    's.r 31000 - and more': 7,
})

dfcopy['Years_Experience'] = dfcopy['Years_Experience'].map({
    'less than 5 years': 1, 'from 5 to 10 years': 2, 'from 11 to 15 years': 3,
    'from 16 to 20 years': 4, 'from 21 to 25 years': 5,
    'from 26 to 30 years': 6, 'from 31 to 35 years': 7,
})

dfcopy['Years_experience_lastorganization'] = dfcopy['Years_experience_lastorganization'].map({
    'less than 5 years': 1, 'from 5 to 10 years': 2, 'from 11 to 15 years': 3,
    'from 16 to 20 years': 4, 'from 21 to 25 years': 5,
    'from 26 to 30 years': 6, 'from 31 to 35 years': 7,
})

dfcopy['Training_programs_ During_last_three_years'] = dfcopy['Training_programs_ During_last_three_years'].map({
    'i did not receive any training': 0, 'from 1 to 3 training programs': 1,
    'from 4 to 6 training programs': 2, 'from 7  training programs to more': 3,
})

dfcopy['Job_Support']             = dfcopy['Job_Support'].map({'low': 1, 'medium': 2, 'high': 3})
dfcopy['Emotional_Commitment']    = dfcopy['Emotional_Commitment'].map({'low': 1, 'medium': 2, 'high': 3})
dfcopy['Environment_Satisfaction']= dfcopy['Environment_Satisfaction'].map({'low': 1, 'medium': 2, 'high': 3})
dfcopy['Job_Satisfaction']        = dfcopy['Job_Satisfaction'].map({'not satisfied': 1, 'satisfied': 2, 'very satisfied': 3})
dfcopy['Job_Engagement']          = dfcopy['Job_Engagement'].map({'difficult': 1, 'medium': 2, 'easy': 3})
dfcopy['Work_Live_Balance']       = dfcopy['Work_Live_Balance'].map({'difficult': 1, 'medium': 2, 'easy': 3})
dfcopy['Distance_to_work']        = dfcopy['Distance_to_work'].map({'close': 1, 'medium': 2, 'far': 3})
dfcopy['Business_Travel']         = dfcopy['Business_Travel'].map({'i do not travel for work': 1, 'travel rarely': 2, 'travel frequently': 3})
dfcopy['Payment_Overtime']        = dfcopy['Payment_Overtime'].map({"i don't have overtime": 1, 'no': 2, 'yes': 3})

dfcopy = pd.get_dummies(dfcopy, columns=['Maritalstatus'], dtype=int, drop_first=True)

# Target Encoding
X = dfcopy.drop('Attrition', axis=1)
y = dfcopy['Attrition']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

encoder = TargetEncoder(cols=['Sector', 'Department', 'JobTitle'])
encoder.fit(X_train, y_train)

# حفظ الـ encoder
os.makedirs("models", exist_ok=True)
joblib.dump(encoder, "models/target_encoder1.pkl")
print("target_encoder.pkl saved!")