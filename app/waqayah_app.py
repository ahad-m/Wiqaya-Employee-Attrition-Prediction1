import streamlit as st
import pandas as pd
import joblib
import os
from predict import predict

# إعداد الصفحة
st.set_page_config(
    page_title="وقاية - نظام التنبؤ المبكر", 
    layout="wide",
    initial_sidebar_state="collapsed"
)

# تحسين التصميم العام - مع دعم كامل للغة العربية
st.markdown("""
<style>
    /* تنسيقات عامة */
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
    
    * {
        font-family: 'Tajawal', sans-serif;
    }
    
    /* توجيه جميع النصوص لليمين */
    .stApp {
        direction: rtl;
        text-align: right;
    }
    
    /* استثناء بعض العناصر التقنية */
    .stProgress, .stButton, [data-testid="column"] {
        direction: rtl;
    }
    
    /* تنسيق عناوين الأقسام لتكون في الوسط */
    .section-title {
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        padding: 1rem 2.5rem;
        border-radius: 60px;
        color: white;
        font-weight: 800;
        font-size: 1.8rem;
        margin: 2.5rem auto 2rem auto;
        display: inline-block;
        box-shadow: 0 10px 25px rgba(30, 60, 114, 0.3);
        border: 2px solid rgba(255,255,255,0.2);
        text-align: center;
        width: auto;
        letter-spacing: 1px;
    }
    
    /* تنسيق الهيدر الرئيسي */
    .main-header {
        background: linear-gradient(135deg, #0a2647, #1e3c72, #2a5298);
        padding: 3.5rem 2rem;
        border-radius: 40px;
        color: white;
        text-align: center;
        margin-bottom: 2.5rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.15);
        position: relative;
        overflow: hidden;
    }
    
    .main-header::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: shine 15s infinite linear;
    }
    
    @keyframes shine {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
/* تنسيق الهيدر الرئيسي */
.main-header {
    background: linear-gradient(135deg, #0a2647, #1e3c72, #2a5298);
    padding: 3.5rem 2rem;
    border-radius: 40px;
    color: white;
    text-align: center;  /* هذا يوسع النص */
    margin-bottom: 2.5rem;
    margin-left: auto;    /* هذه لإضافة هوامش تلقائية */
    margin-right: auto;   /* وهذه أيضاً */
    width: 100%;          /* العرض الكامل */
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.15);
    position: relative;
    overflow: hidden;
    display: block;       /* التأكد من أنه عنصر block */
}

.main-header h1 {
    font-size: 5rem;
    font-weight: 900;
    margin-bottom: 0.8rem;
    text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
    position: relative;
    z-index: 1;
    text-align: center;   /* توسيط النص */
    color: white;  /* تأكيد أن لون النص الوصفي أبيض */

    width: 100%;          /* العرض الكامل */
}

.main-header p {
    font-size: 1.6rem;
    opacity: 0.95;
    font-weight: 500;
    position: relative;
    z-index: 1;
    line-height: 1.6;
    text-align: center;   /* توسيط النص */
    color: white;  /* تأكيد أن لون النص الوصفي أبيض */

    width: 100%;          /* العرض الكامل */
}
    
    /* صندوق المعلومات */
    .info-box {
        background: linear-gradient(135deg, #f8faff, #eef2ff);
        padding: 1.3rem 2rem;
        border-radius: 25px;
        border-right: 8px solid #2a5298;
        margin-bottom: 2rem;
        font-size: 1.2rem;
        font-weight: 600;
        color: #1e3c72;
        box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        text-align: right;
    }
    
    /* تحسين مظهر عناصر الإدخال */
    .stSelectbox label, .stNumberInput label {
        font-weight: 700;
        color: #1e3c72;
        font-size: 1.1rem;
        margin-bottom: 0.7rem;
        display: block;
        text-align: right;
    }
    
    .stSelectbox div[data-baseweb="select"] {
        border-radius: 18px;
        border: 2px solid #dbe4ff;
        background: white;
        text-align: right;
    }
    
    .stSelectbox div[data-baseweb="select"] span {
        text-align: right;
        width: 100%;
    }
    
    /* تنسيق الزر الرئيسي */
    .stButton > button {
        background: linear-gradient(135deg, #0a2647, #1e3c72);
        color: white;
        font-size: 1.5rem;
        font-weight: 800;
        padding: 1.2rem 3rem;
        border-radius: 70px;
        border: none;
        box-shadow: 0 15px 35px rgba(10, 38, 71, 0.4);
        transition: all 0.3s ease;
        width: 100%;
        margin: 2.5rem 0;
        letter-spacing: 1px;
        border: 2px solid rgba(255,255,255,0.1);
    }
    
    .stButton > button:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 45px rgba(10, 38, 71, 0.6);
        background: linear-gradient(135deg, #1e3c72, #0a2647);
    }
    
    /* تنسيق بطاقة النتيجة */
    .result-card {
        background: white;
        padding: 2.5rem;
        border-radius: 40px;
        box-shadow: 0 30px 50px rgba(0,0,0,0.15);
        text-align: center;
        border: 1px solid #f0f7ff;
        margin: 2rem 0;
    }
    
    .result-low {
        background: linear-gradient(135deg, #059669, #10b981);
        color: white;
        padding: 1.5rem;
        border-radius: 30px;
        font-size: 2rem;
        font-weight: 800;
        margin-top: 1.5rem;
    }
    
    .result-medium {
        background: linear-gradient(135deg, #d97706, #f59e0b);
        color: white;
        padding: 1.5rem;
        border-radius: 30px;
        font-size: 2rem;
        font-weight: 800;
        margin-top: 1.5rem;
    }
    
    .result-high {
        background: linear-gradient(135deg, #b91c1c, #dc2626);
        color: white;
        padding: 1.5rem;
        border-radius: 30px;
        font-size: 2rem;
        font-weight: 800;
        margin-top: 1.5rem;
    }
    
    /* تحسين الفواصل */
    hr {
        margin: 2.5rem 0;
        border: none;
        height: 3px;
        background: linear-gradient(to left, transparent, #2a5298, transparent);
    }
    
    /* تنسيق شريط التقدم */
    .stProgress > div > div {
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        border-radius: 30px;
        height: 30px;
    }
    
    /* تنسيق التبويبات */
    div[data-testid="column"] {
        padding: 0 15px;
    }
    
    /* تنسيق النصوص في الأقسام */
    h1, h2, h3, h4, h5, h6 {
        text-align: right;
        font-weight: 700;
        color: #0a2647;
    }
    
    /* تنسيق عناوين النتائج */
    .result-card h2 {
        text-align: center;
        color: #1e3c72;
        font-size: 2.2rem;
        margin-bottom: 1rem;
    }
    
    /* تنسيق التوسيعات */
    .streamlit-expanderHeader {
        font-weight: 700;
        color: #1e3c72;
        font-size: 1.2rem;
        text-align: right;
    }
    
    /* تنسيق رسائل التنبيه */
    .stAlert {
        text-align: right;
        border-radius: 20px;
        padding: 1rem 2rem;
    }
    
    /* تنسيق الأرقام */
    input[type="number"] {
        text-align: right;
    }
    
    /* تنسيق التسميات */
    .css-1cpxqw2 {
        text-align: right;
    }
</style>
""", unsafe_allow_html=True)

# القسم الرئيسي - الهيدر
st.markdown("""
<div class="main-header">
    <h1>وقاية</h1>
    <p>منصة ذكية للتنبؤ المبكر بمخاطر استقالة الموظفين<br>ودعم اتخاذ القرارات الاستباقية</p>
</div>
""", unsafe_allow_html=True)

# تحميل النماذج
@st.cache_resource
def load_models():
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    model_path = os.path.join(BASE_DIR, "models", "best_model_XGBoost_0.9253_20260302_074121.joblib")
    encoder_path = os.path.join(BASE_DIR, "models", "target_encoder1.pkl")

    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)

    return model, encoder

with st.spinner('جاري تحميل النظام...'):
    model, encoder = load_models()

# رسالة ترحيبية
st.markdown("""
<div class="info-box">
    ✨ أدخل بيانات الموظف بدقة لتحصل على تحليل شامل ومؤشر دقيق لمستوى خطر الاستقالة
</div>
""", unsafe_allow_html=True)

# ========== القسم الأول: المعلومات الأساسية ==========
st.markdown('<div class="section-title">📋 المعلومات الأساسية</div>', unsafe_allow_html=True)

col1, col2 = st.columns(2)

with col1:
    Gender = st.selectbox("الجنس", options=["female", "male"], format_func=lambda x: "أنثى" if x == "female" else "ذكر")
    Age = st.selectbox("الفئة العمرية", options=["21 to 30", "31 to 40", "41 to 50", "51 to 60"], 
                       format_func=lambda x: f"من {x.split(' to ')[0]} إلى {x.split(' to ')[1]} سنة")
    Maritalstatus = st.selectbox("الحالة الاجتماعية", options=["married", "single", "divorced"],
                                 format_func=lambda x: "متزوج/ة" if x == "married" else "أعزب/ة" if x == "single" else "مطلق/ة")
    Academic_degree = st.selectbox("المؤهل العلمي", options=["diploma or secondary", "bachelor's", "master's", "ph.d"],
                                  format_func=lambda x: "دبلوم أو ثانوي" if x == "diploma or secondary" else "بكالوريوس" if x == "bachelor's" else "ماجستير" if x == "master's" else "دكتوراه")

with col2:
    Years_Experience = st.selectbox("مجموع سنوات الخبرة", options=[
        "less than 5 years", "from 5 to 10 years", "from 11 to 15 years",
        "from 16 to 20 years", "from 21 to 25 years", "from 26 to 30 years", "from 31 to 35 years"
    ], format_func=lambda x: "أقل من 5 سنوات" if x == "less than 5 years" else f"من {x.split(' ')[1]} إلى {x.split(' ')[3]} سنوات")
    
    Years_experience_lastorganization = st.selectbox("سنوات الخبرة في المؤسسة الحالية", options=[
        "less than 5 years", "from 5 to 10 years", "from 11 to 15 years",
        "from 16 to 20 years", "from 21 to 25 years", "from 26 to 30 years", "from 31 to 35 years"
    ], format_func=lambda x: "أقل من 5 سنوات" if x == "less than 5 years" else f"من {x.split(' ')[1]} إلى {x.split(' ')[3]} سنوات")
    
    MonthlySalary = st.selectbox("الراتب الشهري", options=[
        "less than 5000 sar", "from 5000 to 10000 s.r",
        "from 11000 to 15000 s.r", "from 16000 to 20000 s.r",
        "from 21000 to 25000 s.r", "from 26000 to 30000 s.r",
        "s.r 31000 - and more"
    ], format_func=lambda x: "أقل من 5000 ريال" if x == "less than 5000 sar" else x.replace("s.r", "ريال").replace("from", "من").replace("to", "إلى").replace("and more", "فأكثر"))
    
    Allowances = st.number_input("البدلات الشهرية", min_value=0.0, step=1.0, format="%.0f")

# ========== القسم الثاني: بيئة العمل ==========
st.markdown('<div class="section-title">🏢 بيئة العمل</div>', unsafe_allow_html=True)

Sector = st.selectbox("القطاع", options=[
    "medical sector", "education sector", "communications and it sector",
    "tourism sector", "financial sector", "economic sector",
    "transport sector", "food production sector", "industry sector",
    "media sector", "engineering consulting companies",
    "environment, water, and agriculture sector", "law firm",
    "energy sector", "restaurant sector"
], format_func=lambda x: {
    "medical sector": "القطاع الصحي",
    "education sector": "القطاع التعليمي",
    "communications and it sector": "قطاع الاتصالات وتقنية المعلومات",
    "tourism sector": "القطاع السياحي",
    "financial sector": "القطاع المالي",
    "economic sector": "القطاع الاقتصادي",
    "transport sector": "قطاع النقل",
    "food production sector": "قطاع إنتاج الأغذية",
    "industry sector": "القطاع الصناعي",
    "media sector": "قطاع الإعلام",
    "engineering consulting companies": "شركات استشارات هندسية",
    "environment, water, and agriculture sector": "قطاع البيئة والمياه والزراعة",
    "law firm": "المجال القانوني",
    "energy sector": "قطاع الطاقة",
    "restaurant sector": "قطاع المطاعم"
}.get(x, x))

Department = st.selectbox("القسم", options=[
    "accounting", "teaching", "relations", "hr", "administration",
    "processes", "banking operations", "customers service", "sales",
    "safety & security", "technical support", "training",
    "information technology", "patient affairs", "marketing",
    "legal affairs", "treasury", "production", "medical service",
    "studies and design", "engineering"
], format_func=lambda x: {
    "accounting": "المحاسبة",
    "teaching": "التدريس",
    "relations": "العلاقات",
    "hr": "الموارد البشرية",
    "administration": "الإدارة",
    "processes": "العمليات",
    "banking operations": "العمليات المصرفية",
    "customers service": "خدمة العملاء",
    "sales": "المبيعات",
    "safety & security": "السلامة والأمن",
    "technical support": "الدعم الفني",
    "training": "التدريب",
    "information technology": "تقنية المعلومات",
    "patient affairs": "شؤون المرضى",
    "marketing": "التسويق",
    "legal affairs": "الشؤون القانونية",
    "treasury": "الخزينة",
    "production": "الإنتاج",
    "medical service": "الخدمات الطبية",
    "studies and design": "الدراسات والتصميم",
    "engineering": "الهندسة"
}.get(x, x))

JobTitle = st.selectbox("المسمى الوظيفي", options=[
    "accountant", "teacher", "relationships specialist", "manger assistant",
    "administrative manager", "project manager", "banking operations",
    "coordinator", "customer services representative", "lecturer", "scribe",
    "sales executive", "sales representative", "salesman", "consultant",
    "security and safety specialist", "admin accountant", "it specialist",
    "trainer", "cybersecurity director", "doctor", "hr specialist",
    "operations supervisor", "data entry operator", "quality specialist",
    "marketing specialist", "application specialist", "chemical engineer",
    "lawyer", "driver", "secretariat", "electrical engineer", "supervisor",
    "nurse", "treasury agent", "receptionist", "head of treasury",
    "quality controller", "hiring specialist", "warehouse officer",
    "mechanical engineer", "production supervisor", "pharmacist",
    "reports manager", "radiographer", "dentist", "lab specialist",
    "insurance officer", "graphic designer", "civil engineer",
    "nutrition specialist", "financial analyst", "project engineer",
    "engineer", "business partners", "relations manager", "purchase specialist",
    "financial manager", "operation and maintenance manager (acting)",
    "passenger services assistant", "after sales service manager", "social worker"
], format_func=lambda x: {
    "accountant": "محاسب",
    "teacher": "معلم",
    "relationships specialist": "أخصائي علاقات",
    "manger assistant": "مساعد مدير",
    "administrative manager": "مدير إداري",
    "project manager": "مدير مشروع",
    "banking operations": "عمليات مصرفية",
    "coordinator": "منسق",
    "customer services representative": "مندوب خدمة عملاء",
    "lecturer": "محاضر",
    "scribe": "كاتب",
    "sales executive": "مدير مبيعات",
    "sales representative": "مندوب مبيعات",
    "salesman": "بائع",
    "consultant": "مستشار",
    "security and safety specialist": "أخصائي أمن وسلامة",
    "admin accountant": "محاسب إداري",
    "it specialist": "أخصائي تقنية معلومات",
    "trainer": "مدرب",
    "cybersecurity director": "مدير أمن سيبراني",
    "doctor": "طبيب",
    "hr specialist": "أخصائي موارد بشرية",
    "operations supervisor": "مشرف عمليات",
    "data entry operator": "مدخل بيانات",
    "quality specialist": "أخصائي جودة",
    "marketing specialist": "أخصائي تسويق",
    "application specialist": "أخصائي تطبيقات",
    "chemical engineer": "مهندس كيميائي",
    "lawyer": "محامي",
    "driver": "سائق",
    "secretariat": "سكرتير",
    "electrical engineer": "مهندس كهرباء",
    "supervisor": "مشرف",
    "nurse": "ممرض",
    "treasury agent": "وكيل خزينة",
    "receptionist": "موظف استقبال",
    "head of treasury": "رئيس الخزينة",
    "quality controller": "مراقب جودة",
    "hiring specialist": "أخصائي توظيف",
    "warehouse officer": "مسؤول مستودع",
    "mechanical engineer": "مهندس ميكانيكي",
    "production supervisor": "مشرف إنتاج",
    "pharmacist": "صيدلي",
    "reports manager": "مدير تقارير",
    "radiographer": "أخصائي أشعة",
    "dentist": "طبيب أسنان",
    "lab specialist": "أخصائي مختبر",
    "insurance officer": "مسؤول تأمين",
    "graphic designer": "مصمم جرافيك",
    "civil engineer": "مهندس مدني",
    "nutrition specialist": "أخصائي تغذية",
    "financial analyst": "محلل مالي",
    "project engineer": "مهندس مشروع",
    "engineer": "مهندس",
    "business partners": "شريك أعمال",
    "relations manager": "مدير علاقات",
    "purchase specialist": "أخصائي مشتريات",
    "financial manager": "مدير مالي",
    "operation and maintenance manager (acting)": "مدير عمليات وصيانة (مكلف)",
    "passenger services assistant": "مساعد خدمات المسافرين",
    "after sales service manager": "مدير خدمة ما بعد البيع",
    "social worker": "أخصائي اجتماعي"
}.get(x, x))

# ========== القسم الثالث: الرضا والضغط الوظيفي ==========
st.markdown('<div class="section-title">💼 الرضا والضغط الوظيفي</div>', unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)

with col1:
    Job_Support = st.selectbox("الدعم الوظيفي", options=["low", "medium", "high"],
                               format_func=lambda x: "ضعيف" if x == "low" else "متوسط" if x == "medium" else "قوي")
    Emotional_Commitment = st.selectbox("الالتزام العاطفي", options=["low", "medium", "high"],
                                       format_func=lambda x: "ضعيف" if x == "low" else "متوسط" if x == "medium" else "قوي")
    Job_Engagement = st.selectbox("الاندماج الوظيفي", options=["difficult", "medium", "easy"],
                                  format_func=lambda x: "صعب" if x == "difficult" else "متوسط" if x == "medium" else "سهل")

with col2:
    Work_Live_Balance = st.selectbox("توازن الحياة والعمل", options=["difficult", "medium", "easy"],
                                     format_func=lambda x: "صعب" if x == "difficult" else "متوسط" if x == "medium" else "جيد")
    Environment_Satisfaction = st.selectbox("الرضا عن بيئة العمل", options=["low", "medium", "high"],
                                           format_func=lambda x: "غير راض" if x == "low" else "راض إلى حد ما" if x == "medium" else "راض جداً")
    Job_Satisfaction = st.selectbox("الرضا الوظيفي", options=["not satisfied", "satisfied", "very satisfied"],
                                    format_func=lambda x: "غير راض" if x == "not satisfied" else "راض" if x == "satisfied" else "راض جداً")

with col3:
    Physical_Stress = st.selectbox("الضغط الجسدي", options=["no", "sometimes", "yes"],
                                   format_func=lambda x: "لا يوجد" if x == "no" else "أحياناً" if x == "sometimes" else "نعم")
    Psychological_Exhaustion = st.selectbox("الإرهاق النفسي", options=["no", "sometimes", "yes"],
                                           format_func=lambda x: "لا يوجد" if x == "no" else "أحياناً" if x == "sometimes" else "نعم")

# ========== القسم الرابع: المزايا والحوافز ==========
st.markdown('<div class="section-title">🎁 المزايا والحوافز</div>', unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)

with col1:
    MedicalInsurance = st.selectbox("تأمين طبي", options=["yes", "no"],
                                    format_func=lambda x: "نعم" if x == "yes" else "لا")
    Bonus = st.selectbox("مكافآت", options=["yes", "no"],
                         format_func=lambda x: "نعم" if x == "yes" else "لا")
    OverTime = st.selectbox("عمل إضافي", options=["yes", "no"],
                            format_func=lambda x: "نعم" if x == "yes" else "لا")

with col2:
    Payment_Overtime = st.selectbox("هل يتم دفع العمل الإضافي؟", options=[
        "i don't have overtime", "no", "yes"
    ], format_func=lambda x: "لا يوجد عمل إضافي" if x == "i don't have overtime" else "لا يتم الدفع" if x == "no" else "نعم يتم الدفع")
    
    Recognition = st.selectbox("هل تحصل على التقدير؟", options=["yes", "no"],
                               format_func=lambda x: "نعم" if x == "yes" else "لا")
    
    RewardsWages = st.selectbox("الرضا عن الرواتب", options=["yes", "no"],
                                format_func=lambda x: "راض" if x == "yes" else "غير راض")

with col3:
    Promotion = st.selectbox("حصلت على ترقية مستحقة", options=["yes", "no"],
                             format_func=lambda x: "نعم" if x == "yes" else "لا")
    
    Training = st.selectbox("عدد البرامج التدريبية", options=[
        "i did not receive any training", "from 1 to 3 training programs",
        "from 4 to 6 training programs", "from 7  training programs to more"
    ], format_func=lambda x: "لم أتلق أي تدريب" if x == "i did not receive any training" else f"{x.split(' ')[1]} إلى {x.split(' ')[3]} برامج" if "from" in x else "٧ برامج فأكثر")
    
    Useful_Training_Programs = st.selectbox("هل كان التدريب مفيداً؟", options=["yes", "no"],
                                            format_func=lambda x: "نعم" if x == "yes" else "لا")

# ========== القسم الخامس: عوامل إضافية ==========
st.markdown('<div class="section-title">📌 عوامل إضافية</div>', unsafe_allow_html=True)

col1, col2, col3 = st.columns(3)

with col1:
    Business_Travel = st.selectbox("السفر للعمل", options=[
        "i do not travel for work", "travel rarely", "travel frequently"
    ], format_func=lambda x: "لا أسفر للعمل" if x == "i do not travel for work" else "أسفر نادراً" if x == "travel rarely" else "أسفر بكثرة")
    
    Distance_to_work = st.selectbox("المسافة للعمل", options=["close", "medium", "far"],
                                    format_func=lambda x: "قريبة" if x == "close" else "متوسطة" if x == "medium" else "بعيدة")

with col2:
    Job_Stability = st.selectbox("تشعر بالاستقرار الوظيفي", options=["yes", "no"],
                                 format_func=lambda x: "نعم" if x == "yes" else "لا")
    
    Health_Issues = st.selectbox("تعاني من مشاكل صحية", options=["yes", "no"],
                                 format_func=lambda x: "نعم" if x == "yes" else "لا")

with col3:
    Job_Opportunities = st.selectbox("لديك فرص وظيفية خارجية", options=["yes", "no"],
                                     format_func=lambda x: "نعم" if x == "yes" else "لا")

# ========== زر التحليل ==========
# ========== زر التحليل ==========
st.markdown("---")

if st.button("🔍 تحليل البيانات وإظهار النتيجة", use_container_width=True):

    data = {
        "Gender": Gender,
        "Age": Age,
        "Maritalstatus": Maritalstatus,
        "Academic_degree": Academic_degree,
        "Years_Experience": Years_Experience,
        "Years_experience_lastorganization": Years_experience_lastorganization,
        "Sector": Sector,
        "Department": Department,
        "JobTitle": JobTitle,
        "MonthlySalary": MonthlySalary,
        "Allowances": Allowances,
        "MedicalInsurance": MedicalInsurance,
        "Bonus": Bonus,
        "OverTime": OverTime,
        "Payment_Overtime": Payment_Overtime,
        "Rewards&Wages_Satisfaction": RewardsWages,
        "Get_ Deserved_Promotion": Promotion,
        "Training_programs_ During_last_three_years": Training,
        "Useful_Training_Programs": Useful_Training_Programs,
        "Business_Travel": Business_Travel,
        "Job_Support": Job_Support,
        "Recognition": Recognition,
        "Emotional_Commitment": Emotional_Commitment,
        "Job_Engagement": Job_Engagement,
        "Distance_to_work": Distance_to_work,
        "Work_Live_Balance": Work_Live_Balance,
        "Physical_Stress": Physical_Stress,
        "Psychological_Exhaustion": Psychological_Exhaustion,
        "Job_Stability": Job_Stability,
        "Health_Issues": Health_Issues,
        "Environment_Satisfaction": Environment_Satisfaction,
        "Job_Satisfaction": Job_Satisfaction,
        "Job_Opportunities": Job_Opportunities,
    }

    df_new = pd.DataFrame([data])
    
    with st.spinner('جاري تحليل البيانات...'):
        results = predict(df_new, model, encoder)
        prob = results["Probability"].values[0]

    # عرض النتائج بشكل جذاب
    st.markdown('<div class="result-card">', unsafe_allow_html=True)
    
    st.markdown("##  نتيجة التحليل")
    st.markdown("---")
    
    # عرض النتيجة بدون نسبة مئوية
    if prob < 0.50:  # نغير العتبة إلى 0.5 كحد فاصل
        st.markdown(f"""
        <div class="result-low">
            ✅ لا يتوقع أن يخرج <br>
            <small style="font-size: 1.1rem;">الموظف مستقر ومؤشرات الأداء إيجابية</small>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="result-high">
            🔴 من المتوقع أن يخرج <br>
            <small style="font-size: 1.1rem;">خطر استقالة مرتفع - يوصى باتخاذ إجراءات فورية</small>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    # # نصائح مخصصة حسب النتيجة
    # st.markdown("---")
    # with st.expander("💡 توصيات ونصائح"):
    #     if prob < 0.30:
    #         st.info("""
    #         **الوضع مطمئن** 🟢
    #         - حافظ على استمرارية بيئة العمل الإيجابية
    #         - قدم المزيد من التحديات المناسبة للموظف
    #         - استمر في برامج التطوير والتدريب
    #         """)
    #     elif prob < 0.60:
    #         st.warning("""
    #         **يحتاج لمتابعة** 🟡
    #         - قم بعمل جلسة استماع لمعرفة احتياجات الموظف
    #         - راجع المزايا والحوافز المقدمة
    #         - قدم دعماً إضافياً في مجالات الضغط
    #         """)
    #     else:
    #         st.error("""
    #         **يحتاج لتدخل عاجل** 🔴
    #         - عقد اجتماع عاجل مع الموظف
    #         - مراجعة شاملة للراتب والمزايا
    #         - تقديم خطة تطوير وظيفي واضحة
    #         - دراسة إمكانية تغيير المهام أو القسم
    #         """)
# import streamlit as st
# import pandas as pd
# import joblib

# from predict import predict

# st.set_page_config(page_title="وقايه", page_icon="🛡️", layout="wide")

# st.title("🛡️ وقايه")
# st.subheader("نظام تنبيه مبكر لخروج الموظفين")
# st.divider()

# # @st.cache_resource
# # def load_models():
# #     model = joblib.load("models/best_model_XGBoost_0.9253_20260302_074121.joblib")
# #     encoder = joblib.load("models/target_encoder1.pkl")
# #     return model, encoder

# import os

# @st.cache_resource
# def load_models():
#     BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
#     model_path = os.path.join(BASE_DIR, "models", "best_model_XGBoost_0.9253_20260302_074121.joblib")
#     encoder_path = os.path.join(BASE_DIR, "models", "target_encoder1.pkl")

#     model = joblib.load(model_path)
#     encoder = joblib.load(encoder_path)

#     return model, encoder
# model, encoder = load_models()

# st.header("📋 بيانات الموظف")

# # ─────────────────────────────
# # القسم الأول: معلومات أساسية
# # ─────────────────────────────

# col1, col2 = st.columns(2)

# with col1:
#     Gender = st.selectbox("الجنس", ["female", "male"])
#     Age = st.selectbox("العمر", ["21 to 30", "31 to 40", "41 to 50", "51 to 60"])
#     Maritalstatus = st.selectbox("الحالة الاجتماعية", ["married", "single", "divorced"])
#     Academic_degree = st.selectbox("المؤهل العلمي", [
#         "diploma or secondary", "bachelor's", "master's", "ph.d"
#     ])

# with col2:
#     Years_Experience = st.selectbox("سنوات الخبرة", [
#         "less than 5 years", "from 5 to 10 years", "from 11 to 15 years",
#         "from 16 to 20 years", "from 21 to 25 years",
#         "from 26 to 30 years", "from 31 to 35 years"
#     ])
#     Years_experience_lastorganization = st.selectbox("سنوات الخبرة في آخر جهة", [
#         "less than 5 years", "from 5 to 10 years", "from 11 to 15 years",
#         "from 16 to 20 years", "from 21 to 25 years",
#         "from 26 to 30 years", "from 31 to 35 years"
#     ])
#     MonthlySalary = st.selectbox("الراتب الشهري", [
#         "less than 5000 sar", "from 5000 to 10000 s.r",
#         "from 11000 to 15000 s.r", "from 16000 to 20000 s.r",
#         "from 21000 to 25000 s.r", "from 26000 to 30000 s.r",
#         "s.r 31000 - and more"
#     ])
#     Allowances = st.number_input("البدلات", min_value=0.0)

# # ─────────────────────────────
# # القسم الثاني: بيئة العمل
# # ─────────────────────────────

# Sector = st.selectbox("القطاع", [
#     "medical sector", "education sector", "communications and it sector",
#     "tourism sector", "financial sector", "economic sector",
#     "transport sector", "food production sector", "industry sector",
#     "media sector", "engineering consulting companies",
#     "environment, water, and agriculture sector", "law firm",
#     "energy sector", "restaurant sector"
# ])

# Department = st.selectbox("القسم", [
#     "accounting", "teaching", "relations", "hr", "administration",
#     "processes", "banking operations", "customers service", "sales",
#     "safety & security", "technical support", "training",
#     "information technology", "patient affairs", "marketing",
#     "legal affairs", "treasury", "production", "medical service",
#     "studies and design", "engineering"
# ])

# JobTitle = st.selectbox("المسمى الوظيفي", [
#     "accountant",
#     "teacher",
#     "relationships specialist",
#     "manger assistant",
#     "administrative manager",
#     "project manager",
#     "banking operations",
#     "coordinator",
#     "customer services representative",
#     "lecturer",
#     "scribe",
#     "sales executive",
#     "sales representative",
#     "salesman",
#     "consultant",
#     "security and safety specialist",
#     "admin accountant",
#     "it specialist",
#     "trainer",
#     "cybersecurity director",
#     "doctor",
#     "hr specialist",
#     "operations supervisor",
#     "data entry operator",
#     "quality specialist",
#     "marketing specialist",
#     "application specialist",
#     "chemical engineer",
#     "lawyer",
#     "driver",
#     "secretariat",
#     "electrical engineer",
#     "supervisor",
#     "nurse",
#     "treasury agent",
#     "receptionist",
#     "head of treasury",
#     "quality controller",
#     "hiring specialist",
#     "warehouse officer",
#     "mechanical engineer",
#     "production supervisor",
#     "pharmacist",
#     "reports manager",
#     "radiographer",
#     "dentist",
#     "lab specialist",
#     "insurance officer",
#     "graphic designer",
#     "civil engineer",
#     "nutrition specialist",
#     "financial analyst",
#     "project engineer",
#     "engineer",
#     "business partners",
#     "relations manager",
#     "purchase specialist",
#     "financial manager",
#     "operation and maintenance manager (acting)",
#     "passenger services assistant",
#     "after sales service manager",
#     "social worker"
# ])
# # ─────────────────────────────
# # القسم الثالث: الرضا والضغط
# # ─────────────────────────────

# Job_Support = st.selectbox("الدعم الوظيفي", ["low", "medium", "high"])
# Emotional_Commitment = st.selectbox("الالتزام العاطفي", ["low", "medium", "high"])
# Job_Engagement = st.selectbox("الاندماج الوظيفي", ["difficult", "medium", "easy"])
# Work_Live_Balance = st.selectbox("توازن الحياة والعمل", ["difficult", "medium", "easy"])
# Environment_Satisfaction = st.selectbox("الرضا عن بيئة العمل", ["low", "medium", "high"])
# Job_Satisfaction = st.selectbox("الرضا الوظيفي", ["not satisfied", "satisfied", "very satisfied"])
# Physical_Stress = st.selectbox("الضغط الجسدي", ["no", "sometimes", "yes"])
# Psychological_Exhaustion = st.selectbox("الإرهاق النفسي", ["no", "sometimes", "yes"])

# # ─────────────────────────────
# # القسم الرابع: مزايا
# # ─────────────────────────────

# MedicalInsurance = st.selectbox("تأمين طبي", ["yes", "no"])
# Bonus = st.selectbox("مكافآت", ["yes", "no"])
# OverTime = st.selectbox("عمل إضافي", ["yes", "no"])
# Payment_Overtime = st.selectbox("هل يتم دفع العمل الإضافي", [
#     "i don't have overtime", "no", "yes"
# ])
# Recognition = st.selectbox("هل يتم تقديرك", ["yes", "no"])
# RewardsWages = st.selectbox("الرضا عن الرواتب", ["yes", "no"])
# Promotion = st.selectbox("حصلت على ترقية مستحقة", ["yes", "no"])
# Training = st.selectbox("عدد البرامج التدريبية", [
#     "i did not receive any training", "from 1 to 3 training programs",
#     "from 4 to 6 training programs", "from 7  training programs to more"
# ])
# Useful_Training_Programs = st.selectbox("هل التدريب كان مفيد", ["yes", "no"])
# Business_Travel = st.selectbox("السفر للعمل", [
#     "i do not travel for work", "travel rarely", "travel frequently"
# ])
# Distance_to_work = st.selectbox("المسافة للعمل", ["close", "medium", "far"])
# Job_Stability = st.selectbox("تشعر بالاستقرار", ["yes", "no"])
# Health_Issues = st.selectbox("مشاكل صحية", ["yes", "no"])
# Job_Opportunities = st.selectbox("عندك فرص وظيفية خارجية", ["yes", "no"])

# # ─────────────────────────────
# # زر التحليل
# # ─────────────────────────────

# if st.button("🔍 حلل الآن"):

#     data = {
#         "Gender": Gender,
#         "Age": Age,
#         "Maritalstatus": Maritalstatus,
#         "Academic_degree": Academic_degree,
#         "Years_Experience": Years_Experience,
#         "Years_experience_lastorganization": Years_experience_lastorganization,
#         "Sector": Sector,
#         "Department": Department,
#         "JobTitle": JobTitle,
#         "MonthlySalary": MonthlySalary,
#         "Allowances": Allowances,
#         "MedicalInsurance": MedicalInsurance,
#         "Bonus": Bonus,
#         "OverTime": OverTime,
#         "Payment_Overtime": Payment_Overtime,
#         "Rewards&Wages_Satisfaction": RewardsWages,
#         "Get_ Deserved_Promotion": Promotion,
#         "Training_programs_ During_last_three_years": Training,
#         "Useful_Training_Programs": Useful_Training_Programs,
#         "Business_Travel": Business_Travel,
#         "Job_Support": Job_Support,
#         "Recognition": Recognition,
#         "Emotional_Commitment": Emotional_Commitment,
#         "Job_Engagement": Job_Engagement,
#         "Distance_to_work": Distance_to_work,
#         "Work_Live_Balance": Work_Live_Balance,
#         "Physical_Stress": Physical_Stress,
#         "Psychological_Exhaustion": Psychological_Exhaustion,
#         "Job_Stability": Job_Stability,
#         "Health_Issues": Health_Issues,
#         "Environment_Satisfaction": Environment_Satisfaction,
#         "Job_Satisfaction": Job_Satisfaction,
#         "Job_Opportunities": Job_Opportunities,
#     }

#     df_new = pd.DataFrame([data])
#     results = predict(df_new, model, encoder)

#     prob = results["Probability"].values[0]

#     st.divider()
#     st.header("📊 النتيجة")

#     st.progress(float(prob))

#     if prob < 0.30:
#         st.success(f"🟢 الخطر منخفض ({prob*100:.1f}%)")
#     elif prob < 0.60:
#         st.warning(f"🟡 الخطر متوسط ({prob*100:.1f}%)")
#     else:
#         st.error(f"🔴 الخطر عالي ({prob*100:.1f}%)")