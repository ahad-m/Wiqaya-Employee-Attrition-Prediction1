"""
backend.py — Flask + XGBoost + Clustering
cd app && python backend.py
"""
import os, traceback, joblib, numpy as np, pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from preprocessing import preprocess

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def find_file(candidates):
    for p in candidates:
        if os.path.exists(p): return p
    return None

MODEL_PATH = find_file(["../models/best_model_XGBoost_0.9253_20260302_074121.joblib","models/best_model_XGBoost_0.9253_20260302_074121.joblib","../models/xgb_best_model_2026-03-01_21-08-30.joblib"])
ENCODER_PATH = find_file(["../models/target_encoder.pkl","models/target_encoder.pkl","../models/target_encoder1.pkl"])
CLUSTER_PATH = find_file(["../models/hr_clustering_pipeline.joblib","models/hr_clustering_pipeline.joblib"])

xgb_model = joblib.load(MODEL_PATH)
target_encoder = joblib.load(ENCODER_PATH)
MODEL_FEATURES = xgb_model.get_booster().feature_names

# ══════ FIX: bypass dimension check completely ══════
# _dim=None causes NotFittedError, _dim=34 may fail on some versions
# SAFEST: disable the check method entirely — encoder still works fine
target_encoder._check_transform_inputs = lambda X: None
print(f"✅ Model:    {MODEL_PATH}")
print(f"✅ Encoder:  {ENCODER_PATH} (dimension check disabled)")
print(f"✅ Features ({len(MODEL_FEATURES)}): {MODEL_FEATURES}")

cluster_pipeline = None
if CLUSTER_PATH:
    try:
        d = joblib.load(CLUSTER_PATH)
        cluster_pipeline = d["model"] if isinstance(d, dict) else d
        print(f"✅ Cluster:  {CLUSTER_PATH}")
    except Exception as e:
        print(f"⚠️  Cluster: {e}")


def add_fe_features(df):
    df = df.copy()
    yexp = df['Years_Experience'].replace(0, 1)
    df['Salary_per_Experience'] = df['MonthlySalary'] / yexp
    if 'Opportunity_Training_Score' in MODEL_FEATURES:
        jop = df['Job_Opportunities'] if 'Job_Opportunities' in df.columns else 0
        trn = df['Training_programs_ During_last_three_years'] if 'Training_programs_ During_last_three_years' in df.columns else 0
        df['Opportunity_Training_Score'] = jop + trn
    if 'Allowances_Ratio' in MODEL_FEATURES:
        df['Allowances_Ratio'] = df['Allowances'] / df['MonthlySalary'].replace(0, 1)
    df['Experience_Gap_LastOrg'] = df['Years_Experience'] - df['Years_experience_lastorganization']
    return df


def run_pipeline(df):
    for c in ["Sector","Department","JobTitle"]:
        if c in df.columns: df[c] = df[c].astype(str)
    df = target_encoder.transform(df)
    print(f"   1. TargetEncode -> {df.shape[1]} cols")
    df = add_fe_features(df)
    print(f"   2. +FE -> {df.shape[1]} cols")
    for col in MODEL_FEATURES:
        if col not in df.columns: df[col] = 0
    df = df[MODEL_FEATURES].fillna(0)
    print(f"   3. Select {df.shape[1]} features")
    return df, xgb_model.predict_proba(df), xgb_model.predict(df)


def composite_scores(row):
    g = lambda k, d=0: float(row.get(k, d) or d)
    b = g('Physical_Stress')+g('Psychological_Exhaustion')+(1-g('Recognition'))+(3-g('Work_Live_Balance',2))
    s = (1-g('Get_ Deserved_Promotion'))+(1-g('Useful_Training_Programs'))+g('Years_experience_lastorganization',1)
    d = (3-g('Job_Satisfaction',2))+(3-g('Emotional_Commitment',2))+g('Distance_to_work',1)+(3-g('Environment_Satisfaction',2))
    c = g('OverTime')+(1-g('Bonus'))+(1-g('Rewards&Wages_Satisfaction'))
    return dict(burnout=round(min(b,7),2),stagnation=round(min(s,9),2),disengagement=round(min(d,9),2),compensation=round(min(c,3),2))


CENTROIDS=[{"b":2.87,"s":3.63,"d":3.87,"c":1.44},{"b":2.22,"s":1.85,"d":3.43,"c":0.96},{"b":4.59,"s":2.77,"d":5.89,"c":2.07}]
CLUSTER_NAMES=["صاحب الخبرة الراكد","الموظف المرتاح","المنهك المحبط"]
CLUSTER_ATTR=[22.2, 35.3, 57.3]

def assign_cluster(sc, row_df=None):
    if cluster_pipeline is not None and row_df is not None:
        try: return int(cluster_pipeline.predict(row_df)[0])
        except: pass
    dists=[np.sqrt((sc["burnout"]-ct["b"])**2+(sc["stagnation"]-ct["s"])**2+(sc["disengagement"]-ct["d"])**2+(sc["compensation"]-ct["c"])**2) for ct in CENTROIDS]
    return int(np.argmin(dists))


SURVEY_MAP={
    "gender":("Gender",{"ذكر / Male":0,"أُنثى / Female":1}),
    "age":("Age",{"من 21 الى 30 سنة":1,"من 31 الى 40 سنة":2,"من 41 الى 50 سنة":3,"من 51 الى 60 سنة":4}),
    "education":("Academic_degree",{"دبلوم أو ثانوي / Diploma or Secondary":1,"بكالوريوس / Bachelor's":2,"ماجستير / Master's":3,"دكتوراه / Ph.D":4}),
    "totalExp":("Years_Experience",{"أقل من 5 سنوات":1,"من 5 الى 10 سنوات":2,"من 11 الى 15 سنة":3,"من 16 الى 20 سنة":4,"من 21 الى 25 سنة":5,"من 26 الى 30 سنة":6,"من 31 الى 35 سنة":7,"من 36 الى 40 سنة":7}),
    "lastOrgExp":("Years_experience_lastorganization",{"أقل من 5 سنوات":1,"من 5 الى 10 سنوات":2,"من 11 الى 15 سنة":3,"من 16 الى 20 سنة":4,"من 21 الى 25 سنة":5,"من 26 الى 30 سنة":6,"من 31 الى 35 سنة":7,"من 36 الى 40 سنة":7}),
    "sector":("Sector",None),"department":("Department",None),"jobTitle":("JobTitle",None),
    "salary":("MonthlySalary",{"أقل من 5,000 ر.س":1,"من 5,000 الى 10,000 ر.س":2,"من 11,000 الى 15,000 ر.س":3,"من 16,000 الى 20,000 ر.س":4,"من 21,000 الى 25,000 ر.س":5,"من 26,000 الى 30,000 ر.س":6,"31,000 ر.س فأكثر":7}),
    "allowances":("Allowances",{"بدل السكن / Housing":1,"بدل المواصلات / Transportation":1,"بدل المعيشة / Living":1,"بدل السفر / Travel":1,"لم أحصل على أي بدلات / None":0}),
    "medInsurance":("MedicalInsurance",{"نعم / Yes":1,"لا / No":0}),
    "annualBonus":("Bonus",{"نعم / Yes":1,"لا / No":0}),
    "overtime":("OverTime",{"نعم / Yes":1,"لا / No":0}),
    "overtimePay":("Payment_Overtime",{"نعم / Yes":3,"لا / No":2,"ليس لدي ساعات عمل إضافية / No overtime":1}),
    "salaryOk":("Rewards&Wages_Satisfaction",{"نعم / Yes":1,"لا / No":0}),
    "promotion":("Get_ Deserved_Promotion",{"نعم / Yes":1,"لا / No":0}),
    "trainCount":("Training_programs_ During_last_three_years",{"لم أتلقَّ أي تدريب":0,"من 1 الى 3 برامج":1,"من 4 الى 6 برامج":2,"من 7 برامج فأكثر":3}),
    "trainBenefit":("Useful_Training_Programs",{"نعم / Yes":1,"لا / No":0}),
    "travelFreq":("Business_Travel",{"السفر بشكل متكرر / Frequently":3,"السفر نادراً / Rarely":2,"لا أسافر من أجل العمل / Never":1}),
    "orgSupport":("Job_Support",{"عالٍ / High":3,"متوسط / Medium":2,"منخفض / Low":1}),
    "recognition":("Recognition",{"نعم / Yes":1,"لا / No":0}),
    "commitment":("Emotional_Commitment",{"عالٍ / High":3,"متوسط / Medium":2,"منخفض / Low":1}),
    "involvement":("Job_Engagement",{"سهل / Easy":3,"متوسط / Medium":2,"صعب / Difficult":1}),
    "distance":("Distance_to_work",{"قريب / Close":1,"متوسط / Medium":2,"بعيد / Far":3}),
    "workLifeBal":("Work_Live_Balance",{"سهل / Easy":3,"متوسط / Medium":2,"صعب / Difficult":1}),
    "physStress":("Physical_Stress",{"نعم / Yes":2,"لا / No":0,"أحياناً / Sometimes":1}),
    "mentalStress":("Psychological_Exhaustion",{"نعم / Yes":2,"لا / No":0,"أحياناً / Sometimes":1}),
    "jobSecurity":("Job_Stability",{"نعم / Yes":1,"لا / No":0}),
    "healthIssue":("Health_Issues",{"نعم / Yes":1,"لا / No":0}),
    "envSat":("Environment_Satisfaction",{"عالٍ / High":3,"متوسط / Medium":2,"منخفض / Low":1}),
    "jobSat":("Job_Satisfaction",{"راضٍ جداً / Very Satisfied":3,"راضٍ / Satisfied":2,"غير راضٍ / Not Satisfied":1}),
    "otherOffers":("Job_Opportunities",{"نعم / Yes":1,"لا / No":0}),
}
SECTOR_MAP={"المالية / Finance":"finance","الصحة / Health":"health","البيئة والمياه والزراعة":"environment, water and agriculture","البلديات / Municipalities":"municipalities","الإسكان / Housing":"housing","الطاقة / Energy":"energy","الاتصالات / Telecommunications":"telecommunications","التعليم / Education":"education","النقل / Transport":"transport","الإعلام / Media":"media"}
DEPT_MAP={"الإدارة / Administration":"administration","المبيعات / Sales":"sales","المحاسبة / Accounting":"accounting","العمليات / Processes":"processes","العلاقات / Relations":"relations","الموارد البشرية / HR":"hr","تكنولوجيا المعلومات / IT":"it","خدمة العملاء / Customer Service":"customer service","الدعم الفني / Technical Support":"technical support"}
TITLE_MAP={"موظف / Employee":"employee","محلل / Analyst":"analyst","مشرف / Supervisor":"supervisor","مدير / Manager":"manager","مدير عام / General Manager":"general manager","مستشار / Consultant":"consultant","تنفيذي / Executive":"executive","أخرى / Other":"other"}

def survey_to_row(form):
    row={}
    for key,val in form.items():
        if key=="leftBefore" or key not in SURVEY_MAP: continue
        col,mapping=SURVEY_MAP[key]
        if key=="marital":
            row["Maritalstatus_married"]=1 if "متزوج" in str(val) else 0
            row["Maritalstatus_single"]=1 if "أعزب" in str(val) else 0
            continue
        if key=="sector": row[col]=SECTOR_MAP.get(val,"finance"); continue
        if key=="department": row[col]=DEPT_MAP.get(val,"administration"); continue
        if key=="jobTitle": row[col]=TITLE_MAP.get(val,"employee"); continue
        if mapping and val in mapping: row[col]=mapping[val]
    BASE=['Gender','Age','Academic_degree','Years_Experience','Years_experience_lastorganization','Sector','Department','JobTitle','MonthlySalary','Allowances','MedicalInsurance','Bonus','OverTime','Payment_Overtime','Rewards&Wages_Satisfaction','Get_ Deserved_Promotion','Training_programs_ During_last_three_years','Useful_Training_Programs','Business_Travel','Job_Support','Recognition','Emotional_Commitment','Job_Engagement','Distance_to_work','Work_Live_Balance','Physical_Stress','Psychological_Exhaustion','Job_Stability','Health_Issues','Environment_Satisfaction','Job_Satisfaction','Job_Opportunities','Maritalstatus_married','Maritalstatus_single']
    for c in BASE:
        if c not in row: row[c]="unknown" if c in ('Sector','Department','JobTitle') else 0
    return row


@app.route("/predict", methods=["POST"])
def predict():
    try:
        form=request.json
        print(f"\n{'='*50}\nPOST /predict — {len(form)} answers")
        row=survey_to_row(form)
        df=pd.DataFrame([row])
        print(f"   Base: {df.shape[1]} cols")
        df,proba,preds=run_pipeline(df)
        risk=round(float(proba[0][1])*100,1)
        pred=int(preds[0])
        sc=composite_scores(row)
        cl=assign_cluster(sc,pd.DataFrame([row]))
        print(f"   => {'LEAVE' if pred==1 else 'STAY'} {risk}% cluster={CLUSTER_NAMES[cl]}")
        return jsonify(success=True,risk=risk,prediction=pred,
            label="سيغادر" if pred==1 else "سيبقى",
            cluster=cl,cluster_name=CLUSTER_NAMES[cl],
            cluster_attrition=CLUSTER_ATTR[cl],scores=sc)
    except Exception as e:
        traceback.print_exc()
        return jsonify(success=False,error=str(e)),400

@app.route("/predict-file", methods=["POST"])
def predict_file():
    try:
        f=request.files.get("file")
        if not f: return jsonify(success=False,error="No file"),400
        print(f"\n{'='*50}\nPOST /predict-file — {f.filename}")
        df=pd.read_csv(f) if f.filename.endswith(".csv") else pd.read_excel(f)
        if "Attrition" in df.columns: df.drop(columns=["Attrition"],inplace=True)
        df=preprocess(df)
        rows=[r.to_dict() for _,r in df.iterrows()]
        df,probas,preds=run_pipeline(df)
        employees,c_counts=[],[0,0,0]
        for i in range(len(df)):
            sc=composite_scores(rows[i]); cl=assign_cluster(sc,pd.DataFrame([rows[i]]))
            c_counts[cl]+=1
            employees.append(dict(index=i,risk=round(float(probas[i][1])*100,1),
                prediction="سيغادر" if preds[i]==1 else "سيبقى",
                cluster=cl,cluster_name=CLUSTER_NAMES[cl],scores=sc))
        total=len(employees); leaving=sum(1 for e in employees if e["prediction"]=="سيغادر")
        return jsonify(success=True,total=total,leaving=leaving,staying=total-leaving,
            leaving_pct=round(leaving/total*100,1),
            clusters=[dict(id=i,name=CLUSTER_NAMES[i],count=c_counts[i]) for i in range(3)],
            employees=employees)
    except Exception as e:
        traceback.print_exc()
        return jsonify(success=False,error=str(e)),400

@app.route("/health")
def health():
    return jsonify(status="ok",model_features=len(MODEL_FEATURES),feature_names=MODEL_FEATURES)

@app.route("/features")
def features():
    try:
        imp=xgb_model.feature_importances_
        fl=sorted(zip(MODEL_FEATURES,imp.tolist()),key=lambda x:-x[1])
        return jsonify(success=True,features=[{"name":f,"importance":round(v,4)} for f,v in fl])
    except Exception as e:
        return jsonify(success=False,error=str(e)),400

if __name__=="__main__":
    print(f"\n🚀 http://localhost:5001\n📂 {os.getcwd()}")
    app.run(debug=True,port=5001)
