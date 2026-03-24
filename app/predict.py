import joblib
import pandas as pd
from preprocessing import preprocess
from feature_engineering import add_features


def predict(df_new: pd.DataFrame, model, encoder) -> pd.DataFrame:
    df = preprocess(df_new)
    df = encoder.transform(df)
    df = add_features(df)

    predictions   = model.predict(df)
    probabilities = model.predict_proba(df)[:, 1]

    results = df_new.copy()
    results["Prediction"]  = predictions           # 0 = No Attrition, 1 = Attrition
    results["Probability"] = probabilities.round(2)
    return results


# ─────────────────────────────────────────────
# Helper: يطبع الخيارات ويطلب إدخال
# ─────────────────────────────────────────────

def ask(field: str, options: list) -> str:
    print(f"\n{field}:")
    for i, opt in enumerate(options, 1):
        print(f"  {i}. {opt}")
    while True:
        choice = input("اختار رقم: ").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(options):
            return options[int(choice) - 1]
        print("  ⚠️  اختار رقم صحيح")


# ─────────────────────────────────────────────
# الطريقة الأولى: رفع ملف Excel
# ─────────────────────────────────────────────

def predict_from_excel(file_path: str, model, encoder) -> pd.DataFrame:
    df_new  = pd.read_excel(file_path)
    results = predict(df_new, model, encoder)
    print(results[["Prediction", "Probability"]])
    return results


# ─────────────────────────────────────────────
# الطريقة الثانية: إدخال يدوي
# ─────────────────────────────────────────────

def predict_manual(model, encoder) -> pd.DataFrame:
    print("\n" + "="*50)
    print("أدخل بيانات الموظف")
    print("="*50)

    data = {
        "Gender": ask("Gender", [
            "female", "male"
        ]),
        "Age": ask("Age", [
            "21 to 30", "31 to 40", "41 to 50", "51 to 60"
        ]),
        "Maritalstatus": ask("Maritalstatus", [
            "married", "single", "divorced"
        ]),
        "Academic_degree": ask("Academic_degree", [
            "diploma or secondary", "bachelor's", "master's", "ph.d"
        ]),
        "Years_Experience": ask("Years_Experience", [
            "less than 5 years", "from 5 to 10 years", "from 11 to 15 years",
            "from 16 to 20 years", "from 21 to 25 years",
            "from 26 to 30 years", "from 31 to 35 years"
        ]),
        "Years_experience_lastorganization": ask("Years_experience_lastorganization", [
            "less than 5 years", "from 5 to 10 years", "from 11 to 15 years",
            "from 16 to 20 years", "from 21 to 25 years",
            "from 26 to 30 years", "from 31 to 35 years"
        ]),
        "Sector": ask("Sector", [
            "medical sector", "education sector", "communications and it sector",
            "tourism sector", "financial sector", "economic sector",
            "transport sector", "food production sector", "industry sector",
            "media sector", "engineering consulting companies",
            "environment, water, and agriculture sector", "law firm",
            "energy sector", "restaurant sector"
        ]),
        "Department": ask("Department", [
            "accounting", "teaching", "relations", "hr", "administration",
            "processes", "banking operations", "customers service", "sales",
            "safety & security", "technical support", "training",
            "information technology", "patient affairs", "marketing",
            "legal affairs", "treasury", "production", "medical service",
            "studies and design", "engineering"
        ]),
        "JobTitle": ask("JobTitle", [
            "accountant", "teacher", "relationships specialist", "manger assistant",
            "administrative manager", "project manager", "banking operations",
            "coordinator", "customer services representative", "lecturer",
            "scribe", "sales executive", "sales representative", "salesman",
            "consultant", "security and safety specialist", "admin accountant",
            "it specialist", "trainer", "cybersecurity director", "doctor",
            "hr specialist", "operations supervisor", "data entry operator",
            "quality specialist", "marketing specialist", "application specialist",
            "chemical engineer", "lawyer", "driver", "secretariat",
            "electrical engineer", "supervisor", "nurse", "treasury agent",
            "receptionist", "head of treasury", "quality controller",
            "hiring specialist", "warehouse officer", "mechanical engineer",
            "production supervisor", "pharmacist", "reports manager",
            "radiographer", "dentist", "lab specialist", "insurance officer",
            "graphic designer", "civil engineer", "nutrition specialist",
            "financial analyst", "project engineer", "engineer",
            "business partners", "relations manager", "purchase specialist",
            "financial manager", "operation and maintenance manager (acting)",
            "passenger services assistant", "after sales service manager",
            "social worker"
        ]),
        "MonthlySalary": ask("MonthlySalary", [
            "less than 5000 sar", "from 5000 to 10000 s.r",
            "from 11000 to 15000 s.r", "from 16000 to 20000 s.r",
            "from 21000 to 25000 s.r", "from 26000 to 30000 s.r",
            "s.r 31000 - and more"
        ]),
        "Allowances": float(input("\nAllowances (رقم): ").strip()),
        "MedicalInsurance": ask("MedicalInsurance", ["yes", "no"]),
        "Bonus": ask("Bonus", ["yes", "no"]),
        "OverTime": ask("OverTime", ["yes", "no"]),
        "Payment_Overtime": ask("Payment_Overtime", [
            "i don't have overtime", "no", "yes"
        ]),
        "Rewards&Wages_Satisfaction": ask("Rewards&Wages_Satisfaction", ["yes", "no"]),
        "Get_ Deserved_Promotion": ask("Get_ Deserved_Promotion", ["yes", "no"]),
        "Training_programs_ During_last_three_years": ask("Training_programs_ During_last_three_years", [
            "i did not receive any training", "from 1 to 3 training programs",
            "from 4 to 6 training programs", "from 7  training programs to more"
        ]),
        "Useful_Training_Programs": ask("Useful_Training_Programs", ["yes", "no"]),
        "Business_Travel": ask("Business_Travel", [
            "i do not travel for work", "travel rarely", "travel frequently"
        ]),
        "Job_Support": ask("Job_Support", ["low", "medium", "high"]),
        "Recognition": ask("Recognition", ["yes", "no"]),
        "Emotional_Commitment": ask("Emotional_Commitment", ["low", "medium", "high"]),
        "Job_Engagement": ask("Job_Engagement", ["difficult", "medium", "easy"]),
        "Distance_to_work": ask("Distance_to_work", ["close", "medium", "far"]),
        "Work_Live_Balance": ask("Work_Live_Balance", ["difficult", "medium", "easy"]),
        "Physical_Stress": ask("Physical_Stress", ["no", "sometimes", "yes"]),
        "Psychological_Exhaustion": ask("Psychological_Exhaustion", ["no", "sometimes", "yes"]),
        "Job_Stability": ask("Job_Stability", ["yes", "no"]),
        "Health_Issues": ask("Health_Issues", ["yes", "no"]),
        "Environment_Satisfaction": ask("Environment_Satisfaction", ["low", "medium", "high"]),
        "Job_Satisfaction": ask("Job_Satisfaction", ["not satisfied", "satisfied", "very satisfied"]),
        "Job_Opportunities": ask("Job_Opportunities", ["yes", "no"]),
    }

    df_new  = pd.DataFrame([data])
    results = predict(df_new, model, encoder)

    print("\n" + "="*50)
    print("النتيجة:")
    pred  = results["Prediction"].values[0]
    prob  = results["Probability"].values[0]
    label = "  سيترك العمل" if pred == 1 else " سيبقى في العمل"
    print(f"  {label}  (احتمال: {prob*100:.1f}%)")
    print("="*50)

    return results


# ─────────────────────────────────────────────
# الاستخدام
# ─────────────────────────────────────────────

if __name__ == "__main__":

    model   = joblib.load("models/best_model_XGBoost_0.9253_20260302_074121.joblib")  # ← غيّر المسار لو لازم
    encoder = joblib.load("models/target_encoder1.pkl")

    print("اختار طريقة الإدخال:")
    print("1 - رفع ملف Excel")
    print("2 - إدخال يدوي")
    choice = input("اختارك (1 أو 2): ").strip()

    if choice == "1":
        file_path = input("مسار الملف: ").strip()
        predict_from_excel(file_path, model, encoder)

    elif choice == "2":
        predict_manual(model, encoder)

    else:
        print("اختار 1 أو 2 بس!")